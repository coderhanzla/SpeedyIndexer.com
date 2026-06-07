'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

const copy = {
    signin: {
        eyebrow: 'Welcome back',
        title: 'Sign in to SpeedyIndexer',
        subtitle: 'Continue to your credit-based Google discovery dashboard.',
        button: 'Sign in',
        switchText: 'New to SpeedyIndexer?',
        switchHref: '/signup',
        switchLabel: 'Create an account',
    },
    signup: {
        eyebrow: 'Create account',
        title: 'Create your SpeedyIndexer account',
        subtitle: 'Buy credits, submit URLs, and track Google discovery signals.',
        button: 'Create account',
        switchText: 'Already have an account?',
        switchHref: '/signin',
        switchLabel: 'Sign in',
    },
};

export default function AuthForm({ mode = 'signin' }) {
    const router = useRouter();
    const isSignup = mode === 'signup';
    const text = copy[mode] || copy.signin;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('info');

    async function readJsonResponse(resp) {
        const text = await resp.text();
        if (!text) return {};

        try {
            return JSON.parse(text);
        } catch {
            return { error: text };
        }
    }

    async function submitAuth(event) {
        event.preventDefault();
        setMessage('');

        if (!email || !password) {
            setMessageType('error');
            setMessage('Please enter your email and password.');
            return;
        }

        if (isSignup && password !== confirmPassword) {
            setMessageType('error');
            setMessage('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            setMessageType('error');
            setMessage('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);

        try {
            if (isSignup) {
                // Use server-side endpoint to create and auto-confirm the user to avoid
                // rate-limited confirmation emails. The endpoint requires a service key.
                let createdByServer = false;

                try {
                    const resp = await fetch('/api/auth/signup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password }),
                    });

                    const payload = await readJsonResponse(resp);
                    if (!resp.ok) {
                        throw new Error(payload.error || 'Signup failed');
                    }

                    createdByServer = true;
                } catch (serverError) {
                    const { error: signUpError } = await supabase.auth.signUp({
                        email,
                        password,
                    });

                    if (signUpError) {
                        throw new Error(serverError?.message || signUpError.message || 'Signup failed');
                    }
                }

                // Now sign in the newly created user to establish a session
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (signInError) {
                    if (!createdByServer) {
                        setMessageType('info');
                        setMessage('Account created. Please check your email, then sign in.');
                        setLoading(false);
                        return;
                    }
                    throw signInError;
                }

                if (signInData?.session) {
                    router.push('/dashboard');
                    return;
                }

                setMessageType('info');
                setMessage(createdByServer ? 'Account created. Please sign in.' : 'Account created. Please check your email, then sign in.');
                setLoading(false);
                return;
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw error;
            }

            if (data?.session) {
                router.push('/dashboard');
            } else {
                setMessageType('info');
                setMessage('Sign-in initiated. Please check your email or try again.');
            }
        } catch (err) {
            const text = err?.message || err?.error_description || JSON.stringify(err) || 'Authentication failed. Please try again.';
            setMessageType('error');
            setMessage(text);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="auth-shell">
            <section className="auth-card" aria-labelledby="auth-title">
                <Link href="/" className="auth-brand" aria-label="SpeedyIndexer home">
                    <span className="auth-brand-mark">⚡</span>
                    <span>
                        <strong>Speedy</strong>Indexer
                    </span>
                </Link>

                <div className="auth-heading">
                    <span className="auth-eyebrow">{text.eyebrow}</span>
                    <h1 id="auth-title">{text.title}</h1>
                    <p>{text.subtitle}</p>
                </div>

                <form onSubmit={submitAuth} className="auth-form">
                    <label>
                        <span>Email address</span>
                        <input
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@example.com"
                        />
                    </label>

                    <label>
                        <span>Password</span>
                        <input
                            type="password"
                            autoComplete={isSignup ? 'new-password' : 'current-password'}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Minimum 6 characters"
                        />
                    </label>

                    {isSignup && (
                        <label>
                            <span>Confirm password</span>
                            <input
                                type="password"
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                placeholder="Repeat your password"
                            />
                        </label>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Please wait...' : text.button}
                    </button>
                </form>

                {message && (
                    <p className={`auth-message auth-message-${messageType}`} role="status">
                        {message}
                    </p>
                )}

                <p className="auth-switch">
                    {text.switchText}{' '}
                    <Link href={text.switchHref}>{text.switchLabel}</Link>
                </p>
            </section>

            <aside className="auth-panel" aria-hidden="true">
                <div>
                    <span>Live queue</span>
                    <strong>50,000+</strong>
                    <p>URL discovery jobs processed with Redis-backed queues and Supabase history.</p>
                </div>
                <div>
                    <span>Discovery tracking</span>
                    <strong>Sitemaps + Search Console</strong>
                    <p>Submit in bulk and track crawl signal processing from your dashboard.</p>
                </div>
            </aside>
        </main>
    );
}
