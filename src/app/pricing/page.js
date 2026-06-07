'use client';
// app/pricing/page.js
// Speedy Indexer — Premium Pricing Page
// Pure JavaScript + React.createElement

import React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../Navbar';
import { supabase } from '../lib/supabase';

/* ─────────────────────────────────────────
   TOKENS
───────────────────────────────────────── */
const T = {
    bg: '#020617', bgCard: 'rgba(255,255,255,0.04)', bgHov: 'rgba(255,255,255,0.07)',
    border: 'rgba(255,255,255,0.07)',
    cyan: '#00d4ff', purple: '#8b5cf6', green: '#10b981', amber: '#f59e0b', red: '#ef4444',
    txt0: '#ffffff', txt1: '#94a3b8', txt2: '#475569',
    font: "'Bricolage Grotesque','Inter',sans-serif",
    mono: "'DM Mono','Fira Code',monospace",
};
const grad = 'linear-gradient(135deg,#00d4ff 0%,#8b5cf6 100%)';

/* ─────────────────────────────────────────
   ATOMS
───────────────────────────────────────── */
function GradText(props) {
    return React.createElement('span', { style: { background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } }, props.children);
}

function Check(props) {
    return React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: props.col || '#10b981', strokeWidth: '2.5', strokeLinecap: 'round', strokeLinejoin: 'round', style: { flexShrink: 0 } },
        React.createElement('polyline', { points: '20 6 9 17 4 12' })
    );
}

function Cross() {
    return React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: '#475569', strokeWidth: '2', strokeLinecap: 'round', style: { flexShrink: 0 } },
        React.createElement('line', { x1: '18', y1: '6', x2: '6', y2: '18' }),
        React.createElement('line', { x1: '6', y1: '6', x2: '18', y2: '18' })
    );
}

/* ─────────────────────────────────────────
   PLAN DATA
───────────────────────────────────────── */
const PLANS = [
    {
        name: 'Starter', price: 3,
        urlsDay: '40 Credits', badge: null,
        color: '#3b82f6',
        desc: 'Small manual credit pack for testing Google discovery submissions.',
        cta: 'Buy Credits', href: '/contact',
        features: ['40 URL submissions', '1 Credit = 1 URL submission', 'Credits never expire', 'Manual admin activation'],
    },
    {
        name: 'Basic', price: 12,
        urlsDay: '250 Credits', badge: null,
        color: '#10b981',
        desc: 'Useful for small websites and regular discovery batches.',
        cta: 'Buy Credits', href: '/contact',
        features: ['250 URL submissions', 'CSV/TXT/XML upload support', 'Persistent balance', 'Manual admin activation'],
    },
    {
        name: 'Pro', price: 45,
        urlsDay: '1,000 Credits', badge: 'Most Popular',
        color: '#00d4ff',
        desc: 'The standard pack for SEO operators submitting larger URL sets.',
        cta: 'Buy Credits', href: '/contact',
        popular: true,
        features: ['1,000 URL submissions', 'Google discovery pipeline', 'Sitemap submission tracking', 'Credits never reset daily'],
    },
    {
        name: 'Growth', price: 87,
        urlsDay: '2,000 Credits', badge: null,
        color: '#8b5cf6',
        desc: 'Built for recurring publishing and larger sitemap updates.',
        cta: 'Buy Credits', href: '/contact',
        features: ['2,000 URL submissions', 'Bulk upload support', 'Search Console sitemap signals', 'Manual admin activation'],
    },
    {
        name: 'Agency', price: 199,
        urlsDay: '5,000 Credits', badge: 'Best Value',
        color: '#f59e0b',
        desc: 'For agencies handling multiple client batches.',
        cta: 'Buy Credits', href: '/contact',
        features: ['5,000 URL submissions', 'Large batch handling', 'Dashboard status tracking', 'Credits never expire'],
    },
    {
        name: 'Enterprise', price: 350,
        urlsDay: '15,000 Credits', badge: null,
        color: '#ef4444',
        desc: 'High-volume manual credit pack for ongoing discovery operations.',
        cta: 'Contact Admin', href: '/contact',
        features: ['15,000 URL submissions', 'Best bulk value', 'Manual/local payment', 'No fake indexing promises'],
    },
];

/* ─────────────────────────────────────────
   COMPARISON TABLE DATA
───────────────────────────────────────── */
const TABLE_SECTIONS = [
    {
        title: 'Credit packs',
        rows: [
            { label: 'Credits included', vals: ['40', '250', '1,000', '2,000', '5,000', '15,000'] },
            { label: 'Price', vals: ['$3', '$12', '$45', '$87', '$199', '$350'] },
            { label: 'Credits expire', vals: ['Never', 'Never', 'Never', 'Never', 'Never', 'Never'] },
            { label: 'Manual admin activation', vals: [true, true, true, true, true, true] },
        ],
    },
    {
        title: 'Discovery pipeline',
        rows: [
            { label: 'URL validation', vals: [true, true, true, true, true, true] },
            { label: 'Sitemap generation', vals: [true, true, true, true, true, true] },
            { label: 'Search Console sitemap submission', vals: [true, true, true, true, true, true] },
            { label: 'Final indexing decision', vals: ['Google', 'Google', 'Google', 'Google', 'Google', 'Google'] },
        ],
    },
];

/* ─────────────────────────────────────────
   PRICING CARD
───────────────────────────────────────── */
function PricingCard(props) {
    const { plan, loggedIn } = props;
    const [hov, setHov] = useState(false);
    const price = plan.price;
    const orderHref = loggedIn ? '/dashboard?section=credits' : '/signup';

    return React.createElement('div', {
        onMouseEnter: function () { setHov(true); },
        onMouseLeave: function () { setHov(false); },
        style: {
            padding: '28px 24px',
            background: plan.popular ? 'rgba(0,212,255,0.04)' : (hov ? T.bgHov : T.bgCard),
            border: `1px solid ${plan.popular ? 'rgba(0,212,255,0.35)' : (hov ? 'rgba(255,255,255,0.12)' : T.border)}`,
            borderRadius: 20,
            position: 'relative',
            transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
            transform: hov ? 'translateY(-4px)' : 'none',
            boxShadow: plan.popular ? '0 0 48px rgba(0,212,255,0.07)' : (hov ? '0 16px 40px rgba(0,0,0,0.4)' : 'none'),
            display: 'flex', flexDirection: 'column',
        }
    },
        // Top accent line for popular
        plan.popular && React.createElement('div', { style: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, borderRadius: '20px 20px 0 0', background: grad } }),

        // Badge
        plan.badge && React.createElement('div', { style: { marginBottom: 16 } },
            React.createElement('span', {
                style: {
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '3px 10px', borderRadius: 9999,
                    fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.07em',
                    background: plan.popular ? 'rgba(0,212,255,0.12)' : 'rgba(139,92,246,0.12)',
                    color: plan.popular ? T.cyan : T.purple,
                    border: `1px solid ${plan.popular ? 'rgba(0,212,255,0.22)' : 'rgba(139,92,246,0.22)'}`,
                    fontFamily: T.font,
                }
            }, plan.badge === 'Most Popular' ? '⭐ ' + plan.badge : '🏆 ' + plan.badge)
        ),

        // Plan name
        React.createElement('div', { style: { fontSize: '0.9375rem', fontWeight: 700, color: plan.color, marginBottom: 6, fontFamily: T.font } }, plan.name),

        // Price
        React.createElement('div', { style: { display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 } },
            React.createElement('span', { style: { fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.05em', fontFamily: T.font } },
                `$${price}`
            ),
            price > 0 && React.createElement('span', { style: { fontSize: '0.875rem', color: T.txt2, fontFamily: T.font } }, '/pack')
        ),

        // URLs
        React.createElement('div', { style: { fontSize: '0.8125rem', color: T.cyan, fontFamily: T.mono, marginBottom: 8 } }, plan.urlsDay),

        // Description
        React.createElement('p', { style: { fontSize: '0.8125rem', color: T.txt2, marginBottom: 24, lineHeight: 1.6, fontFamily: T.font } }, plan.desc),

        // CTA
        React.createElement(Link, {
            href: orderHref,
            style: {
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '11px 20px', borderRadius: 12, marginBottom: 24,
                fontSize: '0.9rem', fontWeight: 700, fontFamily: T.font,
                textDecoration: 'none',
                color: plan.popular ? '#fff' : T.txt1,
                background: plan.popular ? grad : 'rgba(255,255,255,0.06)',
                border: `1px solid ${plan.popular ? 'transparent' : T.border}`,
                boxShadow: plan.popular ? '0 4px 20px rgba(0,212,255,0.3)' : 'none',
                transition: 'all 0.2s',
            }
        }, 'Buy Credits'),

        React.createElement('div', { style: { height: 1, background: T.border, marginBottom: 22 } }),

        // Features list
        React.createElement('ul', { style: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 } },
            plan.features.map(function (f) {
                return React.createElement('li', {
                    key: f, style: { display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: '0.8125rem', color: T.txt1, fontFamily: T.font }
                },
                    React.createElement(Check, { col: plan.color }),
                    f
                );
            })
        )
    );
}

/* ─────────────────────────────────────────
   COMPARISON TABLE
───────────────────────────────────────── */
function ComparisonTable() {
    const planNames = ['Starter', 'Basic', 'Pro', 'Growth', 'Agency', 'Enterprise'];
    const planColors = ['#3b82f6', '#10b981', T.cyan, T.purple, T.amber, T.red];

    function renderCell(val, planIdx) {
        if (typeof val === 'boolean') {
            return val
                ? React.createElement(Check, { col: planColors[planIdx] })
                : React.createElement(Cross);
        }
        return React.createElement('span', { style: { fontSize: '0.8125rem', fontWeight: 600, color: planColors[planIdx], fontFamily: T.mono } }, val);
    }

    return React.createElement('div', { style: { marginTop: 80 } },
        React.createElement('div', { style: { textAlign: 'center', marginBottom: 48 } },
            React.createElement('h2', { style: { fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.03em', fontFamily: T.font } },
                'Full Feature ', React.createElement(GradText, null, 'Comparison')
            )
        ),
        React.createElement('div', { style: { border: `1px solid ${T.border}`, borderRadius: 20, overflow: 'hidden' } },
            // Header
            React.createElement('div', {
                className: 'collapse-on-mobile',
                style: { display: 'grid', gridTemplateColumns: '2fr repeat(6, 1fr)', background: 'rgba(255,255,255,0.03)', borderBottom: `1px solid ${T.border}` }
            },
                React.createElement('div', { style: { padding: '16px 20px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', color: T.txt2, textTransform: 'uppercase', fontFamily: T.font } }, 'Feature'),
                planNames.map(function (name, i) {
                    return React.createElement('div', {
                        key: name, style: { padding: '16px 12px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 700, color: planColors[i], fontFamily: T.font }
                    }, name);
                })
            ),

            // Sections
            TABLE_SECTIONS.map(function (section) {
                return React.createElement('div', { key: section.title },
                    // Section header
                    React.createElement('div', {
                        style: { padding: '12px 20px', background: 'rgba(255,255,255,0.02)', borderBottom: `1px solid ${T.border}`, borderTop: `1px solid ${T.border}` }
                    },
                        React.createElement('span', { style: { fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', color: T.txt2, textTransform: 'uppercase', fontFamily: T.font } }, section.title)
                    ),
                    // Rows
                    section.rows.map(function (row, ri) {
                        return React.createElement('div', {
                            key: row.label,
                            className: 'collapse-on-mobile',
                            style: {
                                display: 'grid', gridTemplateColumns: '2fr repeat(6, 1fr)',
                                borderBottom: ri < section.rows.length - 1 ? `1px solid rgba(255,255,255,0.03)` : 'none',
                                transition: 'background 0.15s',
                            },
                            onMouseEnter: function (e) { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; },
                            onMouseLeave: function (e) { e.currentTarget.style.background = 'transparent'; },
                        },
                            React.createElement('div', { style: { padding: '13px 20px', fontSize: '0.875rem', color: T.txt1, fontFamily: T.font } }, row.label),
                            row.vals.map(function (val, vi) {
                                return React.createElement('div', {
                                    key: vi, style: { padding: '13px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
                                }, renderCell(val, vi));
                            })
                        );
                    })
                );
            })
        )
    );
}

/* ─────────────────────────────────────────
   FAQ
───────────────────────────────────────── */
const FAQS = [
    { q: 'How do credits work?', a: '1 Credit = 1 URL submission. Credits stay in your account until used.' },
    { q: 'Do credits reset daily?', a: 'No. Credits never reset daily and never expire.' },
    { q: 'How do I buy credits?', a: 'Payment is handled manually/local for now. After payment confirmation, admin adds credits to your account.' },
    { q: 'Can I submit URLs with zero credits?', a: 'No. Submissions are blocked until your account has enough credits for the URL count.' },
    { q: 'Who controls final indexing?', a: 'Google controls final indexing. SpeedyIndexer provides URL validation, sitemap generation, Search Console sitemap submission, discovery signals, and status tracking.' },
];

function FAQ() {
    const [open, setOpen] = useState(null);
    return React.createElement('div', { style: { maxWidth: 720, margin: '80px auto 0' } },
        React.createElement('h2', { style: { fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, textAlign: 'center', marginBottom: 36, letterSpacing: '-0.03em', fontFamily: T.font } }, 'Pricing FAQs'),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
            FAQS.map(function (f, i) {
                const isOpen = open === i;
                return React.createElement('div', {
                    key: i,
                    style: {
                        background: T.bgCard, border: `1px solid ${isOpen ? 'rgba(0,212,255,0.25)' : T.border}`,
                        borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.2s',
                    }
                },
                    React.createElement('button', {
                        onClick: function () { setOpen(isOpen ? null : i); },
                        style: { width: '100%', padding: '17px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: T.font }
                    },
                        React.createElement('span', { style: { fontSize: '0.9375rem', fontWeight: 600, color: T.txt0 } }, f.q),
                        React.createElement('span', {
                            style: { width: 24, height: 24, borderRadius: '50%', background: isOpen ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }
                        },
                            React.createElement('svg', { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: isOpen ? T.cyan : T.txt2, strokeWidth: '2.5', strokeLinecap: 'round', style: { transition: 'transform 0.2s', transform: isOpen ? 'rotate(45deg)' : 'none' } },
                                React.createElement('line', { x1: '12', y1: '5', x2: '12', y2: '19' }),
                                React.createElement('line', { x1: '5', y1: '12', x2: '19', y2: '12' })
                            )
                        )
                    ),
                    isOpen && React.createElement('div', { style: { padding: '0 22px 18px' } },
                        React.createElement('p', { style: { color: T.txt1, fontSize: '0.9375rem', lineHeight: 1.75, fontFamily: T.font } }, f.a)
                    )
                );
            })
        )
    );
}

/* ─────────────────────────────────────────
   PAGE EXPORT
───────────────────────────────────────── */
export default function PricingPage() {
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(function () {
        let mounted = true;
        supabase.auth.getUser().then(function ({ data }) {
            if (mounted) setLoggedIn(Boolean(data?.user));
        });
        return function () { mounted = false; };
    }, []);

    return React.createElement('div', { style: { background: T.bg, minHeight: '100vh' } },
        React.createElement(Navbar),

        // Hero
        React.createElement('section', { style: { padding: '100px 24px 70px', textAlign: 'center', position: 'relative', overflow: 'hidden' } },
            React.createElement('div', { style: { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 45% at 50% -5%, rgba(0,212,255,0.1) 0%, transparent 65%)', pointerEvents: 'none' } }),
            React.createElement('div', { style: { position: 'relative', maxWidth: 700, margin: '0 auto' } },
                React.createElement('div', { style: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 9999, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', fontSize: '0.75rem', fontWeight: 700, color: '#10b981', fontFamily: T.font, marginBottom: 22 } },
                    React.createElement('span', { style: { width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'block' } }),
                    'Manual credit packs'
                ),
                React.createElement('h1', { style: { fontSize: 'clamp(2.5rem,5vw,4rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: 18, fontFamily: T.font } },
                    'Google Discovery ', React.createElement(GradText, null, 'Credits')
                ),
                React.createElement('p', { style: { fontSize: '1.1rem', color: T.txt1, marginBottom: 36, lineHeight: 1.7, fontFamily: T.font } },
                    '1 Credit = 1 URL submission. Credits never expire and do not reset daily.'
                ),

                // Manual payment note
                React.createElement('div', {
                    style: { display: 'inline-flex', gap: 8, padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}`, borderRadius: 12, color: T.txt1, fontFamily: T.font, fontWeight: 700 }
                }, 'Manual/local payment. Admin activates credits after confirmation.')
            )
        ),

        // Plans grid
        React.createElement('div', { style: { maxWidth: 1160, margin: '0 auto', padding: '0 24px 100px' } },
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 14, alignItems: 'start' } },
                PLANS.map(function (plan) {
                    return React.createElement(PricingCard, { key: plan.name, plan, loggedIn });
                })
            ),
            React.createElement('p', { style: { textAlign: 'center', color: T.txt1, marginTop: 24, fontFamily: T.font, fontWeight: 700 } },
                '1 Credit = 1 URL submission. Credits never expire.'
            ),
            React.createElement(ComparisonTable),
            React.createElement(FAQ),

            // Trust strip
            React.createElement('div', {
                style: { display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 32, marginTop: 72, padding: '40px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 18 }
            },
                [['CR', '1 Credit = 1 URL'], ['NE', 'Credits Never Expire'], ['MA', 'Manual Activation'], ['SC', 'Search Console Tracking'], ['SM', 'Sitemap Submission']].map(function ([icon, label]) {
                    return React.createElement('div', {
                        key: label, style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }
                    },
                        React.createElement('span', { style: { fontSize: 28 } }, icon),
                        React.createElement('span', { style: { fontSize: '0.8125rem', color: T.txt1, fontFamily: T.font, fontWeight: 600 } }, label)
                    );
                })
            )
        )
    );
}



