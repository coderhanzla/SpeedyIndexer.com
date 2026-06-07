'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import Papa from 'papaparse';

export default function SubmitPage() {
    const [urlsText, setUrlsText] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [creditAccount, setCreditAccount] = useState(null);

    const urls = useMemo(() => urlsText
        .split('\n')
        .map((u) => u.trim())
        .filter((u) => u.startsWith('http')), [urlsText]);
    const creditsBalance = Number(creditAccount?.credits_balance || 0);
    const testMode = creditAccount?.test_mode === true;

    useEffect(() => {
        async function loadCredits() {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData?.session?.access_token;
            if (!token) return;

            try {
                const response = await fetch('/api/credits/balance', {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: 'no-store',
                });
                const payload = await response.json();
                if (response.ok) setCreditAccount(payload.account || null);
            } catch {
                setCreditAccount(null);
            }
        }

        loadCredits();
    }, []);

    function handleCSVUpload(e) {
        const file = e.target.files[0];

        if (!file) return;

        Papa.parse(file, {
            complete: (result) => {
                const urls = result.data
                    .flat()
                    .map((u) => String(u).trim())
                    .filter((u) => u.startsWith('http'));

                setUrlsText(urls.join('\n'));
                setMessage(`${urls.length} URLs loaded from CSV`);
            },
            error: () => {
                setMessage('Failed to read CSV file');
            }
        });
    }

    async function submitURL() {
        if (urls.length === 0) {
            setMessage('Please enter at least one valid URL');
            return;
        }

        if (!testMode && creditsBalance < urls.length) {
            setMessage('Insufficient credits. Please buy more credits.');
            return;
        }

        setLoading(true);
        setMessage('');

        const {
            data: { user }
        } = await supabase.auth.getUser();

        if (!user) {
            setMessage('Please login first');
            setLoading(false);
            return;
        }

        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData?.session?.access_token;

            if (!token) {
                throw new Error('Please login first');
            }

            const response = await fetch('/api/bulk-submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    urls
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error || 'Failed to submit URLs'
                );
            }

            setMessage(
                `${result.queued || 0} URLs submitted for Google discovery. ${result.creditsDeducted || 0} credits used. Final indexing decisions remain with Google.`
            );

            if (typeof result.balanceAfter === 'number') {
                setCreditAccount((current) => ({
                    ...(current || {}),
                    credits_balance: result.balanceAfter,
                    total_credits_used: Number(current?.total_credits_used || 0) + Number(result.creditsDeducted || 0),
                }));
            }
            setUrlsText('');
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#020617',
                color: 'white',
                padding: '40px',
                fontFamily: 'sans-serif'
            }}
        >
            <h1
                style={{
                    fontSize: '42px',
                    marginBottom: '20px'
                }}
            >
                Bulk URL Submit
            </h1>

            <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
                Paste URLs one per line or upload a CSV file.
            </p>

            <p style={{ color: creditsBalance > 0 ? '#38bdf8' : '#fbbf24', marginBottom: '20px', fontWeight: 700 }}>
                {creditsBalance.toLocaleString()} credits available. 1 Credit = 1 URL submission. {creditsBalance === 0 ? 'Please buy credits to submit URLs.' : 'Credits never expire.'}
            </p>

            <textarea
                value={urlsText}
                onChange={(e) =>
                    setUrlsText(e.target.value)
                }
                placeholder={`https://example.com/page-1
https://example.com/page-2
https://example.com/page-3`}
                style={{
                    width: '100%',
                    maxWidth: '900px',
                    minHeight: '250px',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #334155',
                    background: '#0f172a',
                    color: 'white',
                    fontSize: '16px',
                    resize: 'vertical'
                }}
            />

            <br />
            <br />

            <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                style={{
                    color: 'white',
                    marginBottom: '20px'
                }}
            />

            <br />

            <button
                onClick={submitURL}
                disabled={loading || creditsBalance < urls.length}
                style={{
                    padding: '14px 24px',
                    borderRadius: '10px',
                    border: 'none',
                    background: loading
                        ? '#475569'
                        : '#06b6d4',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: loading
                        ? 'not-allowed'
                        : 'pointer'
                }}
            >
                {loading
                    ? 'Submitting...'
                    : 'Submit URLs'}
            </button>

            <p
                style={{
                    marginTop: '20px',
                    color: '#38bdf8'
                }}
            >
                {message}
            </p>
        </div>
    );
}
