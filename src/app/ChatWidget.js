'use client';

import { useEffect, useRef, useState } from 'react';
import { Headphones, MessageSquareText, Send, X } from 'lucide-react';
import { supabase } from './lib/supabase';

const defaultChatSettings = {
    enabled: true,
    title: 'SpeedyIndexer AI Assistant',
    welcome: 'Hi, I can help with indexing, pricing, orders and support.',
    whatsapp: '+15550000000',
    prompt: 'Act as a helpful SEO indexing support assistant for SpeedyIndexer customers.',
};

const SITE_KNOWLEDGE = [
    {
        match: ['google', 'index fast', 'how fast', 'crawl'],
        answer: 'Google Indexing API submissions typically trigger a crawl within 1-48 hours. Final indexing still depends on domain authority, crawl budget, content quality and Google policy.',
    },
    {
        match: ['indexnow', 'bing', 'yandex'],
        answer: 'IndexNow sends an instant crawl signal to Bing, Yandex and other participating engines with one submission. SpeedyIndexer combines it with Google API, sitemap pings and retry handling.',
    },
    {
        match: ['sitemap', 'sitemap.xml'],
        answer: 'Yes. You can submit a sitemap URL from the dashboard. Sitemap links are extracted and queued, including sitemap indexes and nested sitemap files.',
    },
    {
        match: ['bulk', 'csv', 'excel', 'xlsx', 'xls', 'doc', 'docx', 'upload', 'file'],
        answer: 'Bulk upload is available inside Dashboard > Website indexing. You can paste URLs or upload files containing links, including CSV, TXT, Excel exports and document files. Valid URLs are extracted before submission.',
    },
    {
        match: ['drip', 'schedule', 'rate limit', 'quota'],
        answer: 'Drip-feed scheduling spreads submissions over time to avoid quota spikes. Credit balance does not reset daily: 1 Credit = 1 accepted URL submission, and unused credits never expire.',
    },
    {
        match: ['free', 'trial', 'credits'],
        answer: 'SpeedyIndexer uses manual credit packs instead of a free daily indexing plan. Packs start at $3 for 40 credits, and 1 Credit = 1 accepted URL submission.',
    },
    {
        match: ['pricing', 'price', 'plan', 'upgrade', 'starter', 'pro', 'agency'],
        answer: 'Credit packs are Starter $3 / 40 credits, Basic $12 / 250 credits, Pro $45 / 1,000 credits, Growth $87 / 2,000 credits, Agency $199 / 5,000 credits, and Enterprise $350 / 15,000 credits. Credits never expire.',
    },
    {
        match: ['api', 'developer', 'webhook', 'integration'],
        answer: 'Pro and Agency plans include full REST API access, higher rate limits and webhook support. You can manage API access from the user dashboard.',
    },
    {
        match: ['fail', 'failed', 'retry', 'error'],
        answer: 'Failed URLs are logged with an error status and can be retried. The indexing system also supports automatic retry rules configured by admin.',
    },
    {
        match: ['payment', 'topup', 'top-up', 'invoice', 'billing'],
        answer: 'Wallet top-ups stay pending until admin approval. Admin can manage international gateways, local bank transfer and Indian payment gateways, then approve or reject user top-up requests.',
    },
    {
        match: ['support', 'ticket', 'help'],
        answer: 'You can create a support ticket from Dashboard > Support with priority and details. Admin can reply from the support inbox and you will receive a notification.',
    },
    {
        match: ['whatsapp', 'contact'],
        answer: 'You can continue the chat on WhatsApp using the button below. Admin can edit the WhatsApp number and chat welcome message from the admin settings.',
    },
];

function readStored(key, fallback) {
    if (typeof window === 'undefined') return fallback;
    try {
        const value = window.localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch {
        return fallback;
    }
}

function writeStored(key, value) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('speedy-storage', { detail: { key, value } }));
}

function WhatsAppIcon() {
    return (
        <svg viewBox="0 0 32 32" width="18" height="18" aria-hidden="true" focusable="false">
            <path
                fill="currentColor"
                d="M16.03 4C9.41 4 4.03 9.36 4.03 15.95c0 2.1.55 4.15 1.6 5.96L4 28l6.25-1.62a12.06 12.06 0 0 0 5.78 1.47c6.62 0 12-5.36 12-11.95S22.65 4 16.03 4Zm0 21.82c-1.8 0-3.55-.48-5.1-1.38l-.36-.21-3.7.96.99-3.6-.24-.37a9.8 9.8 0 0 1-1.52-5.27c0-5.47 4.46-9.92 9.93-9.92s9.93 4.45 9.93 9.92-4.46 9.87-9.93 9.87Zm5.45-7.42c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z"
            />
        </svg>
    );
}

const quickPrompts = [
    'Bulk indexing',
    'Pricing plans',
    'Payment top-up',
    'Support ticket',
];

export default function ChatWidget() {
    const [settings, setSettings] = useState(defaultChatSettings);
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [thread, setThread] = useState([]);
    const [userEmail, setUserEmail] = useState('guest@speedyindexer.com');
    const [handoverStatus, setHandoverStatus] = useState('');
    const [ready, setReady] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const threadEndRef = useRef(null);

    useEffect(() => {
        setSettings(readStored('speedy-chat-settings', defaultChatSettings));
        setThread(readStored('speedy-chat-thread', []));
        const storedSession = readStored('speedy-chat-session', '');
        const nextSession = storedSession || `CHAT-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 7)}`;
        writeStored('speedy-chat-session', nextSession);
        setSessionId(nextSession);
        setReady(true);
        supabase.auth.getUser().then(({ data }) => {
            if (data?.user?.email) setUserEmail(data.user.email);
        });
    }, []);

    useEffect(() => {
        if (ready) writeStored('speedy-chat-thread', thread);
    }, [ready, thread]);

    useEffect(() => {
        if (!open) return;
        const timer = window.setTimeout(() => {
            threadEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 40);

        return () => window.clearTimeout(timer);
    }, [open, thread, handoverStatus]);

    useEffect(() => {
        if (!sessionId) return;

        async function loadAdminReplies() {
            try {
                const response = await fetch(`/api/support-realtime?sessionId=${encodeURIComponent(sessionId)}`, { cache: 'no-store' });
                const data = await response.json();
                const adminMessages = (data.tickets || [])
                    .flatMap((ticket) => ticket.messages || [])
                    .filter((item) => item.role === 'admin');

                if (adminMessages.length === 0) return;

                setThread((items) => {
                    const existing = new Set(items.map((item) => item.remoteId).filter(Boolean));
                    const nextMessages = adminMessages
                        .filter((item) => !existing.has(item.id))
                        .map((item) => ({
                            role: 'Admin',
                            text: item.text,
                            date: item.date || 'Just now',
                            remoteId: item.id,
                        }));

                    return nextMessages.length > 0 ? [...items, ...nextMessages] : items;
                });
            } catch {
                // Keep chat usable if the live inbox is temporarily unavailable.
            }
        }

        loadAdminReplies();
        const timer = window.setInterval(loadAdminReplies, 3500);
        return () => window.clearInterval(timer);
    }, [sessionId]);

    if (!settings.enabled) return null;

    function getSiteAnswer(text) {
        const needle = text.toLowerCase();
        const matched = SITE_KNOWLEDGE.find((item) => item.match.some((word) => needle.includes(word)));
        if (matched) return matched.answer;

        return 'I can help with SpeedyIndexer pricing, bulk URL indexing, Google API, IndexNow, sitemap imports, payment top-ups, API access, support tickets and WhatsApp contact. Ask me about any of those and I will guide you.';
    }

    function sendMessage(event) {
        event.preventDefault();
        const text = message.trim();
        if (!text) return;
        pushMessage(text);
    }

    function pushMessage(text) {
        const answer = getSiteAnswer(text);
        const nextItems = [
            ...thread,
            { role: 'You', text, date: 'Just now' },
            {
                role: 'AI',
                text: answer,
                date: 'Just now',
            },
        ];
        setThread(nextItems);
        setMessage('');
        setHandoverStatus('');
        sendLiveChatMessage(text);
    }

    async function sendLiveChatMessage(text) {
        try {
            await fetch('/api/support-realtime', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'chat-message',
                    sessionId,
                    userEmail,
                    userName: userEmail.split('@')[0],
                    message: text,
                }),
            });
        } catch {
            // Local AI chat still works when live inbox sync is unavailable.
        }
    }

    function requestHumanHandover() {
        const transcript = thread.map((item) => `${item.role}: ${item.text}`).join('\n');
        const ticketId = `SUP-${Date.now().toString().slice(-5)}`;
        const tickets = readStored('speedy-support-tickets', []);
        const ticket = {
            id: ticketId,
            userEmail,
            userName: userEmail.split('@')[0],
            subject: 'Human handover from chat',
            message: transcript || 'User requested human support from chat before sending a message.',
            priority: 'High',
            status: 'Open',
            updated: 'Just now',
            reply: '',
            source: 'Chat handover',
        };
        writeStored('speedy-support-tickets', [ticket, ...tickets]);

        const notifications = readStored('speedy-notifications', []);
        writeStored('speedy-notifications', [
            {
                id: `NTF-${Date.now().toString().slice(-6)}`,
                to: 'admin',
                title: 'Human handover requested',
                message: `${userEmail} requested human support from chat. Ticket ${ticketId} includes the chat transcript.`,
                type: 'Support',
                status: 'Unread',
                date: 'Just now',
            },
            ...notifications,
        ]);

        fetch('/api/support-realtime', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'handover',
                id: ticketId,
                sessionId,
                userEmail,
                userName: userEmail.split('@')[0],
                message: transcript || 'User requested human support from chat before sending a message.',
            }),
        }).catch(() => {});

        setHandoverStatus(`Human support requested. Ticket ${ticketId} was created.`);
    }

    const whatsappHref = `https://wa.me/${String(settings.whatsapp || '').replace(/[^\d]/g, '')}`;

    return (
        <div className="site-chat-widget">
            {open && (
                <section className="site-chat-panel">
                    <header className="site-chat-header">
                        <div>
                            <span className="site-chat-status">Online support</span>
                            <strong>{settings.title}</strong>
                            <span>{settings.welcome}</span>
                        </div>
                        <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">
                            <X size={16} />
                        </button>
                    </header>
                    <div className="site-chat-actions">
                        <a className="support" href="/dashboard?section=support">
                            <Headphones size={17} />
                            Support Ticket
                        </a>
                        <button className="human" type="button" onClick={requestHumanHandover}>
                            <Headphones size={17} />
                            Human Handover
                        </button>
                        {settings.whatsapp && (
                            <a className="whatsapp" href={whatsappHref} target="_blank" rel="noreferrer">
                                <WhatsAppIcon />
                                WhatsApp
                            </a>
                        )}
                    </div>
                    <div className="site-chat-prompts">
                        {quickPrompts.map((prompt) => (
                            <button key={prompt} type="button" onClick={() => pushMessage(prompt)}>
                                {prompt}
                            </button>
                        ))}
                    </div>
                    <div className="site-chat-thread" aria-live="polite">
                        {thread.length === 0 && <p>{settings.welcome}</p>}
                        {handoverStatus && <p className="site-chat-handover">{handoverStatus}</p>}
                        {thread.map((item, index) => (
                            <article key={`${item.role}-${index}`} className={item.role === 'You' ? 'from-user' : ''}>
                                <strong>{item.role}</strong>
                                <span>{item.text}</span>
                            </article>
                        ))}
                        <span ref={threadEndRef} className="site-chat-scroll-anchor" aria-hidden="true" />
                    </div>
                    <form onSubmit={sendMessage}>
                        <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask about indexing or orders" />
                        <button type="submit" aria-label="Send message">
                            <Send size={16} />
                        </button>
                    </form>
                    <footer className="site-chat-credit">
                        Powered by <a href="https://coderlity.com" target="_blank" rel="noreferrer">Coderlity</a>
                    </footer>
                </section>
            )}
            <button className="site-chat-launcher" type="button" onClick={() => setOpen((value) => !value)} aria-label="Open chat">
                <MessageSquareText size={21} />
            </button>
        </div>
    );
}
