import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin.js';
import { isTestMode } from '../../../lib/testMode.js';

export const runtime = 'nodejs';

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || '').trim().toLowerCase();

async function findUserByEmail(email) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
    });

    if (error) throw error;

    return (data?.users || []).find((user) => String(user.email || '').toLowerCase() === email) || null;
}

export async function POST(req) {
    try {
        if (!isTestMode()) {
            return NextResponse.json({ error: 'Admin setup is only available in test mode' }, { status: 403 });
        }

        if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_KEY) {
            return NextResponse.json({ error: 'Service key not configured on server' }, { status: 500 });
        }

        const body = await req.json().catch(() => null);
        const email = String(body?.email || '').trim().toLowerCase();
        const password = String(body?.password || '');

        if (!ADMIN_EMAIL) {
            return NextResponse.json({ error: 'Admin email is not configured' }, { status: 500 });
        }

        if (email !== ADMIN_EMAIL) {
            return NextResponse.json({ error: 'This endpoint only prepares the configured admin account' }, { status: 403 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        const existingUser = await findUserByEmail(email);

        if (existingUser) {
            const { data, error } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
                password,
                email_confirm: true,
            });

            if (error) throw error;

            return NextResponse.json({ user: data?.user || existingUser, action: 'updated' });
        }

        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        });

        if (error) throw error;

        return NextResponse.json({ user: data?.user || null, action: 'created' });
    } catch (err) {
        return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
    }
}
