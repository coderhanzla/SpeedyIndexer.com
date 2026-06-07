import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { getAuthenticatedUser } from '../../lib/apiAuth.js';

export const runtime = 'nodejs';

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin1@yopmail.com').toLowerCase();
const dataDir = process.env.SUPPORT_DATA_DIR || path.join(tmpdir(), 'speedyindexer');
const dataFile = path.join(dataDir, 'support-realtime.json');
const adminActions = new Set(['admin-reply', 'take-handover', 'update-ticket']);

async function requireSupportAdmin(request) {
    const auth = await getAuthenticatedUser(request);
    if (auth.error) return { error: auth.error };

    const email = String(auth.user.email || '').toLowerCase();
    if (email !== ADMIN_EMAIL) {
        return {
            error: NextResponse.json(
                { success: false, error: 'Admin access required' },
                { status: 403 }
            ),
        };
    }

    return auth;
}

async function requireSameUserOrAdmin(request, userEmail) {
    const auth = await getAuthenticatedUser(request);
    if (auth.error) return { error: auth.error };

    const requester = String(auth.user.email || '').toLowerCase();
    const target = String(userEmail || '').toLowerCase();
    if (requester !== target && requester !== ADMIN_EMAIL) {
        return {
            error: NextResponse.json(
                { success: false, error: 'Access denied' },
                { status: 403 }
            ),
        };
    }

    return auth;
}

async function readData() {
    try {
        const raw = await readFile(dataFile, 'utf8');
        return JSON.parse(raw);
    } catch {
        return { tickets: [] };
    }
}

async function writeData(data) {
    await mkdir(dataDir, { recursive: true });
    await writeFile(dataFile, JSON.stringify(data, null, 2));
}

function nowLabel() {
    return 'Just now';
}

function ticketId(prefix = 'SUP') {
    return `${prefix}-${Date.now().toString().slice(-6)}`;
}

function messageId() {
    return `MSG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function normalizeTicket(ticket) {
    return {
        id: ticket.id || ticketId(),
        userEmail: ticket.userEmail || 'guest@speedyindexer.com',
        userName: ticket.userName || (ticket.userEmail || 'guest').split('@')[0],
        subject: ticket.subject || 'Support message',
        message: ticket.message || 'No message added.',
        priority: ticket.priority || 'Normal',
        status: ticket.status || 'Open',
        updated: ticket.updated || nowLabel(),
        reply: ticket.reply || '',
        source: ticket.source || 'Support ticket',
        sessionId: ticket.sessionId || '',
        assignedTo: ticket.assignedTo || '',
        messages: Array.isArray(ticket.messages) ? ticket.messages : [],
    };
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userEmail = searchParams.get('userEmail');

    if (userEmail) {
        const user = await requireSameUserOrAdmin(request, userEmail);
        if (user.error) return user.error;
    }

    if (!sessionId && !userEmail) {
        const admin = await requireSupportAdmin(request);
        if (admin.error) return admin.error;
    }

    const data = await readData();
    const tickets = (data.tickets || []).map(normalizeTicket);

    if (sessionId) {
        return NextResponse.json({
            tickets: tickets.filter((ticket) => ticket.sessionId === sessionId),
        });
    }

    if (userEmail) {
        return NextResponse.json({
            tickets: tickets.filter((ticket) => ticket.userEmail === userEmail),
        });
    }

    return NextResponse.json({ tickets });
}

export async function POST(request) {
    const body = await request.json().catch(() => ({}));
    if (adminActions.has(body.action)) {
        const admin = await requireSupportAdmin(request);
        if (admin.error) return admin.error;
    }

    const data = await readData();
    const tickets = (data.tickets || []).map(normalizeTicket);
    const action = body.action;

    if (action === 'chat-message') {
        const sessionId = body.sessionId || ticketId('CHAT');
        const userEmail = body.userEmail || 'guest@speedyindexer.com';
        const text = String(body.message || '').trim();
        if (!text) return NextResponse.json({ error: 'Message is required.' }, { status: 400 });

        let ticket = tickets.find((item) => item.sessionId === sessionId && item.source === 'Live chat');
        if (!ticket) {
            ticket = normalizeTicket({
                id: ticketId('CHAT'),
                userEmail,
                userName: body.userName || userEmail.split('@')[0],
                subject: 'Live chat message',
                message: text,
                priority: 'Normal',
                status: 'Open',
                source: 'Live chat',
                sessionId,
            });
            tickets.unshift(ticket);
        }

        ticket.userEmail = userEmail;
        ticket.userName = body.userName || ticket.userName;
        ticket.message = text;
        ticket.status = ticket.status === 'Resolved' ? 'Open' : ticket.status;
        ticket.updated = nowLabel();
        ticket.messages.push({ id: messageId(), role: 'user', text, date: nowLabel() });
    }

    if (action === 'create-ticket' || action === 'handover') {
        const isHandover = action === 'handover';
        const userEmail = body.userEmail || 'guest@speedyindexer.com';
        const ticket = normalizeTicket({
            id: body.id || ticketId('SUP'),
            userEmail,
            userName: body.userName || userEmail.split('@')[0],
            subject: isHandover ? 'Human handover from chat' : body.subject,
            message: body.message || 'No message added.',
            priority: isHandover ? 'High' : body.priority,
            status: 'Open',
            source: isHandover ? 'Chat handover' : 'Support ticket',
            sessionId: body.sessionId || '',
        });
        ticket.messages.push({
            id: messageId(),
            role: 'user',
            text: ticket.message,
            date: nowLabel(),
        });
        tickets.unshift(ticket);
    }

    if (action === 'admin-reply') {
        const reply = String(body.reply || '').trim();
        const ticket = tickets.find((item) => item.id === body.id);
        if (!ticket || !reply) return NextResponse.json({ error: 'Ticket and reply are required.' }, { status: 400 });
        ticket.reply = reply;
        ticket.status = 'Answered';
        ticket.updated = nowLabel();
        ticket.messages.push({ id: messageId(), role: 'admin', text: reply, date: nowLabel() });
    }

    if (action === 'take-handover') {
        const ticket = tickets.find((item) => item.id === body.id);
        if (!ticket) return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 });
        const reply = body.reply || 'A human support agent has taken over this chat handover and will reply shortly.';
        ticket.status = 'In Progress';
        ticket.assignedTo = body.assignedTo || 'admin1@yopmail.com';
        ticket.reply = ticket.reply || reply;
        ticket.updated = nowLabel();
        ticket.messages.push({ id: messageId(), role: 'admin', text: ticket.reply, date: nowLabel() });
    }

    if (action === 'update-ticket') {
        const ticket = tickets.find((item) => item.id === body.id);
        if (!ticket) return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 });
        Object.assign(ticket, body.updates || {}, { updated: nowLabel() });
    }

    const nextData = { tickets };
    await writeData(nextData);
    return NextResponse.json(nextData);
}
