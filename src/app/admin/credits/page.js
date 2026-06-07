'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CreditCard, MinusCircle, PlusCircle, RefreshCcw, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin1@yopmail.com';

function formatTimestampLabel(value) {
    if (!value) return '-';
    return String(value).replace('T', ' ').slice(0, 19);
}

function formatNumberLabel(value) {
    return String(Math.trunc(Number(value || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export default function AdminCreditsPage() {
    const [user, setUser] = useState(null);
    const [email, setEmail] = useState('');
    const [amount, setAmount] = useState('1000');
    const [note, setNote] = useState('');
    const [accounts, setAccounts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [totals, setTotals] = useState({ totalCreditsAdded: 0, totalCreditsUsed: 0, usersWithCredits: 0 });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const isAdmin = String(user?.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const selectedAccount = useMemo(() => {
        const needle = email.trim().toLowerCase();
        return accounts.find((account) => String(account.email || '').toLowerCase() === needle) || accounts[0];
    }, [accounts, email]);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
    }, []);

    async function authedFetch(url, options = {}) {
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token;
        if (!token) throw new Error('Admin sign-in required.');

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

    async function loadCredits(searchEmail = email) {
        if (!isAdmin) return;
        setLoading(true);
        try {
            const query = searchEmail.trim() ? `?email=${encodeURIComponent(searchEmail.trim())}` : '';
            const payload = await authedFetch(`/api/admin/credits/transactions${query}`);
            setAccounts(payload.accounts || []);
            setTransactions(payload.transactions || []);
            setTotals(payload.totals || totals);
            setMessage('Credit data loaded.');
        } catch (error) {
            setMessage(error.message || 'Failed to load credit data.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (isAdmin) loadCredits('');
    }, [isAdmin]);

    async function submitCreditChange(type) {
        const numericAmount = Number(amount);
        if (!email.trim()) {
            setMessage('Enter a user email first.');
            return;
        }
        if (!Number.isInteger(numericAmount) || numericAmount <= 0) {
            setMessage('Amount must be a positive integer.');
            return;
        }

        setLoading(true);
        try {
            const payload = await authedFetch(`/api/admin/credits/${type}`, {
                method: 'POST',
                body: JSON.stringify({ email: email.trim(), amount: numericAmount, note }),
            });
            setMessage(`Credits updated. New balance: ${payload.account?.credits_balance ?? 0}`);
            await loadCredits(email);
        } catch (error) {
            setMessage(error.message || 'Credit update failed.');
        } finally {
            setLoading(false);
        }
    }

    if (!user) {
        return (
            <main className="admin-credit-page">
                <section className="admin-credit-panel">
                    <h1>Admin credits</h1>
                    <p>Sign in as the admin account to manage manual credits.</p>
                    <Link href="/login">Go to login</Link>
                </section>
            </main>
        );
    }

    if (!isAdmin) {
        return (
            <main className="admin-credit-page">
                <section className="admin-credit-panel">
                    <h1>Admin credits</h1>
                    <p>Admin access required.</p>
                    <Link href="/dashboard">Back to dashboard</Link>
                </section>
            </main>
        );
    }

    return (
        <main className="admin-credit-page">
            <section className="admin-credit-hero">
                <div>
                    <span>Manual payments</span>
                    <h1>Credit management</h1>
                    <p>1 Credit = 1 URL submission. Credits never expire and never reset daily.</p>
                </div>
                <Link href="/admin">Back to admin</Link>
            </section>

            <section className="admin-credit-metrics">
                <Metric title="Total credits added" value={totals.totalCreditsAdded} />
                <Metric title="Total credits used" value={totals.totalCreditsUsed} />
                <Metric title="Users with credits" value={totals.usersWithCredits} />
                <Metric title="Selected balance" value={selectedAccount?.credits_balance ?? 0} />
            </section>

            <section className="admin-credit-grid">
                <form className="admin-credit-panel" onSubmit={(event) => event.preventDefault()}>
                    <header>
                        <CreditCard size={20} />
                        <h2>Add or deduct credits</h2>
                    </header>
                    <label>
                        <span>User email</span>
                        <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="customer@example.com" />
                    </label>
                    <label>
                        <span>Credits</span>
                        <input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="numeric" />
                    </label>
                    <label>
                        <span>Note / reason</span>
                        <textarea rows={3} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Pro plan payment confirmed" />
                    </label>
                    <div className="admin-credit-actions">
                        <button type="button" onClick={() => loadCredits(email)} disabled={loading}>
                            <Search size={17} />
                            Search
                        </button>
                        <button type="button" onClick={() => submitCreditChange('add')} disabled={loading}>
                            <PlusCircle size={17} />
                            Add
                        </button>
                        <button type="button" onClick={() => submitCreditChange('deduct')} disabled={loading}>
                            <MinusCircle size={17} />
                            Deduct
                        </button>
                    </div>
                    {message && <p className="admin-credit-message">{message}</p>}
                </form>

                <section className="admin-credit-panel">
                    <header>
                        <RefreshCcw size={20} />
                        <h2>Transaction history</h2>
                    </header>
                    <div className="admin-credit-list">
                        {transactions.length === 0 && <p>No credit transactions found.</p>}
                        {transactions.map((item) => (
                            <article key={item.id}>
                                <div>
                                    <strong>{item.type}</strong>
                                    <span>{formatTimestampLabel(item.created_at)}</span>
                                    <p>{item.note || '-'}</p>
                                </div>
                                <b>{item.amount} / {item.balance_after}</b>
                            </article>
                        ))}
                    </div>
                </section>
            </section>

            <style jsx>{`
                .admin-credit-page { min-height: 100vh; padding: 32px; background: #07111f; color: #e5eefb; }
                .admin-credit-hero, .admin-credit-panel, .admin-credit-metrics > article { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; }
                .admin-credit-hero { display: flex; justify-content: space-between; gap: 20px; align-items: center; padding: 24px; margin-bottom: 18px; }
                .admin-credit-hero span { color: #22d3ee; font-weight: 700; text-transform: uppercase; font-size: 12px; }
                .admin-credit-hero h1 { margin: 4px 0; font-size: clamp(28px, 4vw, 44px); }
                .admin-credit-hero p { margin: 0; color: #9fb0c7; }
                .admin-credit-hero a, .admin-credit-panel a { color: #22d3ee; }
                .admin-credit-metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 18px; }
                .admin-credit-metrics article { padding: 18px; }
                .admin-credit-metrics span, .admin-credit-panel label span { display: block; color: #9fb0c7; font-size: 13px; margin-bottom: 6px; }
                .admin-credit-metrics strong { font-size: 28px; }
                .admin-credit-grid { display: grid; grid-template-columns: minmax(300px, 420px) 1fr; gap: 18px; }
                .admin-credit-panel { padding: 20px; }
                .admin-credit-panel header { display: flex; gap: 10px; align-items: center; margin-bottom: 16px; }
                .admin-credit-panel h2 { margin: 0; font-size: 20px; }
                .admin-credit-panel label { display: block; margin-bottom: 14px; }
                .admin-credit-panel input, .admin-credit-panel textarea { width: 100%; border: 1px solid rgba(255,255,255,0.14); border-radius: 8px; background: rgba(2,6,23,0.65); color: white; padding: 12px; }
                .admin-credit-actions { display: flex; flex-wrap: wrap; gap: 10px; }
                .admin-credit-actions button { display: inline-flex; align-items: center; gap: 7px; border: 0; border-radius: 8px; padding: 10px 14px; background: #0ea5e9; color: white; font-weight: 700; cursor: pointer; }
                .admin-credit-actions button:disabled { opacity: 0.55; cursor: not-allowed; }
                .admin-credit-message { color: #bae6fd; }
                .admin-credit-list { display: grid; gap: 10px; max-height: 620px; overflow: auto; }
                .admin-credit-list article { display: flex; justify-content: space-between; gap: 12px; padding: 12px; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; background: rgba(255,255,255,0.03); }
                .admin-credit-list span, .admin-credit-list p { color: #9fb0c7; margin: 3px 0 0; font-size: 13px; }
                @media (max-width: 820px) {
                    .admin-credit-page { padding: 18px; }
                    .admin-credit-hero, .admin-credit-grid { display: block; }
                    .admin-credit-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                    .admin-credit-panel { margin-bottom: 16px; }
                }
            `}</style>
        </main>
    );
}

function Metric({ title, value }) {
    return (
        <article>
            <span>{title}</span>
            <strong>{formatNumberLabel(value)}</strong>
        </article>
    );
}
