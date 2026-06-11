'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    CreditCard,
    Gauge,
    History,
    LayoutDashboard,
    ListFilter,
    LogOut,
    Plus,
    Rocket,
    Search,
    Send,
    WalletCards,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const statusLabels = ['queued', 'processing', 'discovery_submitted', 'waiting_for_google', 'indexed', 'not_indexed', 'failed'];

const statusCopy = {
    queued: 'Queued',
    processing: 'Processing',
    discovery_submitted: 'Discovery submitted',
    waiting_for_google: 'Waiting for Google',
    indexed: 'Indexed',
    not_indexed: 'Not indexed yet',
    failed: 'Failed',
};

function formatStatus(status) {
    return statusCopy[status] || statusCopy.queued;
}

function formatDateLabel(value) {
    if (!value) return '-';
    return String(value).slice(0, 10);
}

function formatNumberLabel(value) {
    return String(Math.trunc(Number(value || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function parseUrlList(value) {
    return Array.from(
        new Set(
            value
                .split(/[\s,]+/)
                .map((item) => item.trim())
                .filter((item) => {
                    try {
                        const parsed = new URL(item);
                        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
                    } catch {
                        return false;
                    }
                })
        )
    );
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [urls, setUrls] = useState([]);
    const [creditAccount, setCreditAccount] = useState(null);
    const [creditHistory, setCreditHistory] = useState([]);
    const [apiStats, setApiStats] = useState(null);
    const [urlsText, setUrlsText] = useState('');
    const [notice, setNotice] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [dateFilter, setDateFilter] = useState('Last 30 days');
    const [projectFilter, setProjectFilter] = useState('All projects');

    useEffect(() => {
        let mounted = true;
        async function loadUser() {
            // retry a few times to allow a recently-created session to propagate
            const maxAttempts = 6;
            const delayMs = 500;
            for (let attempt = 0; attempt < maxAttempts; attempt++) {
                const { data } = await supabase.auth.getUser();
                if (!mounted) return;
                if (data?.user) {
                    setUser(data.user);
                    return;
                }
                // wait before retrying
                await new Promise((res) => setTimeout(res, delayMs));
            }

            // final check — if still no user, send to signin
            const { data: finalData } = await supabase.auth.getUser();
            if (!mounted) return;
            if (!finalData?.user) {
                router.push('/signin');
                return;
            }
            setUser(finalData.user);
        }

        loadUser();

        return () => {
            mounted = false;
        };
    }, [router]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const section = new URLSearchParams(window.location.search).get('section');
        if (section === 'credits') setShowCreditModal(true);
    }, []);

    async function getToken() {
        const { data } = await supabase.auth.getSession();
        return data?.session?.access_token;
    }

    async function authedFetch(url, options = {}) {
        const token = await getToken();
        if (!token) throw new Error('Please sign in again.');
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                ...(options.headers || {}),
            },
            cache: 'no-store',
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'Request failed.');
        return payload;
    }

    async function loadDashboard() {
        if (!user?.id) return;
        setLoading(true);
        try {
            const [jobsPayload, balancePayload, historyPayload, statsPayload] = await Promise.all([
                authedFetch('/api/jobs?limit=50'),
                authedFetch('/api/credits/balance'),
                authedFetch('/api/credits/history'),
                authedFetch('/api/stats').catch(() => null),
            ]);

            setUrls(jobsPayload.jobs || []);
            setCreditAccount(balancePayload.account || null);
            setCreditHistory(historyPayload.history || []);
            setApiStats(statsPayload);
        } catch (error) {
            setNotice(error.message || 'Failed to load dashboard.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDashboard();
    }, [user?.id]);

    const parsedUrls = useMemo(() => parseUrlList(urlsText), [urlsText]);
    const balance = Number(creditAccount?.credits_balance || 0);
    const creditsUsed = Number(creditAccount?.total_credits_used || 0);
    const creditsPurchased = Number(creditAccount?.total_credits_purchased || 0);
    const testMode = creditAccount?.test_mode === true;
    const insufficient = !testMode && parsedUrls.length > 0 && balance < parsedUrls.length;
    const statusCounts = useMemo(() => {
        return statusLabels.reduce((acc, status) => {
            acc[status] = urls.filter((item) => item.status === status).length;
            return acc;
        }, {});
    }, [urls]);

    async function submitUrls(event) {
        event.preventDefault();
        if (!parsedUrls.length) {
            setNotice('Enter at least one valid URL.');
            return;
        }
        if (insufficient) {
            setNotice('Insufficient credits. Please buy more credits.');
            return;
        }

        setSubmitting(true);
        setNotice('');
        try {
            const payload = await authedFetch('/api/bulk-submit', {
                method: 'POST',
                body: JSON.stringify({ urls: parsedUrls }),
            });
            setNotice(`${payload.queued || 0} URLs submitted for discovery. ${payload.creditsDeducted || 0} credits used. Completed means submitted for discovery, not guaranteed Google indexing.`);
            setUrlsText('');
            await loadDashboard();
        } catch (error) {
            setNotice(error.message || 'Submission failed.');
        } finally {
            setSubmitting(false);
        }
    }

    async function signOut() {
        await supabase.auth.signOut();
        router.push('/signin');
    }

    return (
        <main className="ri-shell">
            <aside className="ri-sidebar">
                <Link href="/" className="ri-brand">SpeedyIndexer</Link>
                <nav>
                    <a className="active"><LayoutDashboard size={18} /> Dashboard</a>
                    <a><Rocket size={18} /> URL Indexing</a>
                    <a onClick={() => setShowCreditModal(true)}><WalletCards size={18} /> Credits</a>
                    <a><History size={18} /> History</a>
                </nav>
                <button type="button" onClick={signOut}><LogOut size={17} /> Sign out</button>
            </aside>

            <section className="ri-main">
                <header className="ri-top">
                    <div>
                        <span>Indexing pipeline</span>
                        <h1>URL INDEXING</h1>
                    </div>
                    <div className="ri-profile">
                        <div>
                            <strong>{user?.email?.split('@')[0] || 'User'}</strong>
                            <span>{user?.email || 'Loading...'}</span>
                        </div>
                        <div className="ri-avatar">{(user?.email || 'U').slice(0, 1).toUpperCase()}</div>
                    </div>
                </header>

                <div className="ri-filters">
                    <label><CalendarDays size={17} /><select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)}><option>Last 7 days</option><option>Last 30 days</option><option>All time</option></select></label>
                    <label><ListFilter size={17} /><select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}><option>All projects</option><option>Default project</option></select></label>
                    <label className="ri-search"><Search size={17} /><input placeholder="Search submissions" /></label>
                </div>

                {notice && <div className="ri-notice">{notice}</div>}

                <div className="ri-notice">
                    Completed means submitted for discovery, not guaranteed Google indexing.
                </div>

                <section className="ri-grid">
                    <article className="ri-card ri-credit-card">
                        <div className="ri-card-head">
                            <div><span>Available Credits</span><h2>{formatNumberLabel(balance)}</h2></div>
                            <CreditCard size={26} />
                        </div>
                        <p>{balance === 0 ? 'Buy credits to start submitting URLs.' : `${formatNumberLabel(balance)} URLs available`}</p>
                        <button type="button" onClick={() => setShowCreditModal(true)}><Plus size={17} /> Add Credits</button>
                    </article>

                    <article className="ri-card">
                        <div className="ri-card-head">
                            <div><span>Credits Purchased</span><h2>{formatNumberLabel(creditsPurchased)}</h2></div>
                            <WalletCards size={26} />
                        </div>
                        <p>Manual credit activation after payment.</p>
                    </article>

                    <article className="ri-card">
                        <div className="ri-card-head">
                            <div><span>Credits Used</span><h2>{formatNumberLabel(creditsUsed)}</h2></div>
                            <Gauge size={26} />
                        </div>
                        <p>Credits persist until URL submissions use them.</p>
                    </article>

                    <article className="ri-card">
                        <div className="ri-card-head">
                            <div><span>Queue Health</span><h2>{apiStats?.queueSize ?? '-'}</h2></div>
                            <Clock3 size={26} />
                        </div>
                        <p>Waiting, active, and delayed discovery jobs.</p>
                    </article>
                </section>

                <section className="ri-workspace">
                    <article className="ri-card ri-submit">
                        <div className="ri-card-title">
                            <h2>Enter URLs for Indexing</h2>
                            <span>Validation, sitemap inclusion, and Google discovery signals</span>
                        </div>
                        <form onSubmit={submitUrls}>
                            <textarea
                                value={urlsText}
                                onChange={(event) => setUrlsText(event.target.value)}
                                placeholder={'https://example.com/page1\nhttps://example.com/page2'}
                            />
                            <div className="ri-credit-check">
                                <span>Credits required: <b>{parsedUrls.length}</b></span>
                                <span>Current balance: <b>{balance}</b></span>
                            </div>
                            {insufficient && <p className="ri-error">Insufficient credits. Please buy more credits.</p>}
                            <button type="submit" disabled={submitting || !parsedUrls.length || insufficient}>
                                <Send size={17} />
                                {submitting ? 'Submitting...' : 'Submit URLs'}
                            </button>
                        </form>
                    </article>

                    <article className="ri-card">
                        <div className="ri-card-title">
                            <h2>Discovery / Index Status</h2>
                            <span>Discovery submission is separate from Google indexing</span>
                        </div>
                        <div className="ri-status-grid">
                            {statusLabels.map((status) => (
                                <div key={status}>
                                    <span>{formatStatus(status)}</span>
                                    <strong>{statusCounts[status] || 0}</strong>
                                </div>
                            ))}
                        </div>
                    </article>
                </section>

                <section className="ri-tables">
                    <article className="ri-card">
                        <div className="ri-card-title">
                            <h2>Recent Submissions</h2>
                            <span>URL discovery history</span>
                        </div>
                        <div className="ri-table">
                            {loading && <p>Loading submissions...</p>}
                            {!loading && urls.length === 0 && <p>No URLs submitted yet</p>}
                            {urls.slice(0, 8).map((item) => (
                                <div key={item.id}>
                                    <span>{item.url}</span>
                                    <small>{formatDateLabel(item.created_at)}</small>
                                    <b>{formatStatus(item.status)}</b>
                                </div>
                            ))}
                        </div>
                    </article>

                    <article className="ri-card">
                        <div className="ri-card-title">
                            <h2>Credit History</h2>
                            <span>Recent transactions</span>
                        </div>
                        <div className="ri-table">
                            {creditHistory.length === 0 && <p>No credit transactions yet</p>}
                            {creditHistory.slice(0, 8).map((item) => (
                                <div key={item.id}>
                                    <span>{item.type}</span>
                                    <small>{formatDateLabel(item.created_at)}</small>
                                    <b>{item.amount} / {item.balance_after}</b>
                                </div>
                            ))}
                        </div>
                    </article>
                </section>
            </section>

            {showCreditModal && (
                <div className="ri-modal" role="dialog" aria-modal="true">
                    <div>
                        <CheckCircle2 size={28} />
                        <h2>Add Credits</h2>
                        <p>Payments are handled manually. Contact admin after payment to activate credits.</p>
                        <div>
                            <Link href="/pricing">View Pricing</Link>
                            <button type="button" onClick={() => setShowCreditModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .ri-shell { min-height: 100vh; display: grid; grid-template-columns: 260px 1fr; background: #070b14; color: #f8fafc; }
                .ri-sidebar { padding: 24px 16px; background: #0d121d; border-right: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; gap: 26px; }
                .ri-brand { color: white; text-decoration: none; font-weight: 900; font-size: 22px; letter-spacing: -0.03em; }
                .ri-sidebar nav { display: grid; gap: 8px; }
                .ri-sidebar a, .ri-sidebar button { display: flex; align-items: center; gap: 10px; color: #9aa8bc; border: 0; background: transparent; text-decoration: none; padding: 12px; border-radius: 8px; font-weight: 700; cursor: pointer; }
                .ri-sidebar a.active, .ri-sidebar a:hover, .ri-sidebar button:hover { background: rgba(249,115,22,0.12); color: #fff; }
                .ri-sidebar button { margin-top: auto; }
                .ri-main { padding: 28px; overflow: hidden; }
                .ri-top, .ri-filters, .ri-card-head, .ri-credit-check, .ri-table div { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
                .ri-top span, .ri-card span, .ri-card-title span, .ri-profile span { color: #94a3b8; }
                .ri-top h1 { margin: 4px 0 0; font-size: clamp(38px, 5vw, 72px); letter-spacing: -0.05em; }
                .ri-profile { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 10px 12px; }
                .ri-profile div:first-child { display: grid; text-align: right; }
                .ri-avatar { width: 42px; height: 42px; display: grid; place-items: center; border-radius: 8px; background: #f97316; font-weight: 900; }
                .ri-filters { justify-content: flex-start; margin: 24px 0; flex-wrap: wrap; }
                .ri-filters label { display: inline-flex; align-items: center; gap: 8px; border: 1px solid rgba(255,255,255,0.09); background: rgba(255,255,255,0.04); border-radius: 8px; padding: 10px 12px; color: #cbd5e1; }
                .ri-filters select, .ri-filters input { background: transparent; border: 0; color: white; outline: 0; }
                .ri-filters option { color: #111827; }
                .ri-search { min-width: min(360px, 100%); }
                .ri-search input { width: 100%; }
                .ri-notice, .ri-error { border-radius: 8px; padding: 12px 14px; margin-bottom: 16px; }
                .ri-notice { background: rgba(14,165,233,0.12); border: 1px solid rgba(14,165,233,0.25); color: #bae6fd; }
                .ri-error { background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.25); color: #fecaca; }
                .ri-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
                .ri-card { background: #111827; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 20px; box-shadow: 0 18px 50px rgba(0,0,0,0.22); }
                .ri-card h2 { margin: 6px 0 0; font-size: 34px; letter-spacing: -0.04em; }
                .ri-card p { color: #94a3b8; line-height: 1.6; }
                .ri-credit-card { background: linear-gradient(135deg, rgba(249,115,22,0.2), #111827); border-color: rgba(249,115,22,0.35); }
                .ri-credit-card button, .ri-submit button, .ri-modal a { display: inline-flex; align-items: center; gap: 8px; border: 0; border-radius: 8px; background: #f97316; color: white; padding: 11px 14px; font-weight: 900; text-decoration: none; cursor: pointer; }
                .ri-submit button:disabled { opacity: 0.5; cursor: not-allowed; }
                .ri-workspace { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.75fr); gap: 14px; margin-top: 14px; }
                .ri-card-title { margin-bottom: 16px; }
                .ri-card-title h2 { font-size: 22px; margin: 0 0 4px; }
                .ri-submit textarea { width: 100%; min-height: 220px; resize: vertical; border: 1px solid rgba(255,255,255,0.1); background: #070b14; color: white; border-radius: 8px; padding: 14px; font-size: 15px; line-height: 1.6; }
                .ri-credit-check { justify-content: flex-start; flex-wrap: wrap; margin: 12px 0; color: #cbd5e1; }
                .ri-status-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
                .ri-status-grid div { background: #070b14; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 14px; }
                .ri-status-grid strong { display: block; font-size: 28px; margin-top: 8px; }
                .ri-tables { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 14px; }
                .ri-table { display: grid; gap: 10px; }
                .ri-table div { background: #070b14; border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; padding: 12px; }
                .ri-table span { color: #e2e8f0; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .ri-table small { color: #94a3b8; }
                .ri-table b { color: #fb923c; white-space: nowrap; }
                .ri-modal { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.72); display: grid; place-items: center; padding: 20px; }
                .ri-modal > div { max-width: 440px; background: #111827; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 26px; text-align: center; }
                .ri-modal p { color: #cbd5e1; line-height: 1.7; }
                .ri-modal div div { display: flex; justify-content: center; gap: 10px; }
                .ri-modal button { border: 1px solid rgba(255,255,255,0.12); background: transparent; color: white; border-radius: 8px; padding: 11px 14px; font-weight: 800; cursor: pointer; }
                @media (max-width: 1020px) {
                    .ri-shell { grid-template-columns: 1fr; }
                    .ri-sidebar { position: static; flex-direction: row; align-items: center; overflow-x: auto; }
                    .ri-sidebar nav { display: flex; }
                    .ri-sidebar button { margin-top: 0; }
                    .ri-grid, .ri-workspace, .ri-tables { grid-template-columns: 1fr; }
                    .ri-top { align-items: flex-start; flex-direction: column; }
                }
                @media (max-width: 640px) {
                    .ri-main { padding: 18px; }
                    .ri-sidebar { padding: 14px; }
                    .ri-sidebar nav a:nth-child(n+3) { display: none; }
                    .ri-status-grid { grid-template-columns: 1fr; }
                    .ri-table div { align-items: flex-start; flex-direction: column; }
                }
            `}</style>
        </main>
    );
}
