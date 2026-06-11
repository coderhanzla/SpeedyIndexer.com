'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import './dashboard.css';
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
    const profileEmail = user?.email || '';
    const profileName = profileEmail ? profileEmail.split('@')[0] : 'Loading';
    const profileInitial = profileEmail ? profileEmail.slice(0, 1).toUpperCase() : 'U';
    const balanceLabel = loading ? '-' : formatNumberLabel(balance);
    const creditsPurchasedLabel = loading ? '-' : formatNumberLabel(creditsPurchased);
    const creditsUsedLabel = loading ? '-' : formatNumberLabel(creditsUsed);
    const queueSizeLabel = loading ? '-' : apiStats?.queueSize ?? '-';
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
                            <strong>{profileName}</strong>
                            <span>{profileEmail || 'Loading account...'}</span>
                        </div>
                        <div className="ri-avatar">{profileInitial}</div>
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
                            <div><span>Available Credits</span><h2>{balanceLabel}</h2></div>
                            <CreditCard size={26} />
                        </div>
                        <p>{loading ? 'Loading credit balance...' : balance === 0 ? 'Buy credits to start submitting URLs.' : `${formatNumberLabel(balance)} URLs available`}</p>
                        <button type="button" onClick={() => setShowCreditModal(true)}><Plus size={17} /> Add Credits</button>
                    </article>

                    <article className="ri-card">
                        <div className="ri-card-head">
                            <div><span>Credits Purchased</span><h2>{creditsPurchasedLabel}</h2></div>
                            <WalletCards size={26} />
                        </div>
                        <p>Manual credit activation after payment.</p>
                    </article>

                    <article className="ri-card">
                        <div className="ri-card-head">
                            <div><span>Credits Used</span><h2>{creditsUsedLabel}</h2></div>
                            <Gauge size={26} />
                        </div>
                        <p>Credits persist until URL submissions use them.</p>
                    </article>

                    <article className="ri-card">
                        <div className="ri-card-head">
                            <div><span>Queue Health</span><h2>{queueSizeLabel}</h2></div>
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
                            {loading && <p>Loading credit history...</p>}
                            {!loading && creditHistory.length === 0 && <p>No credit transactions yet</p>}
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

        </main>
    );
}
