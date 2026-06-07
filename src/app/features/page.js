'use client';
// app/features/page.js
// Speedy Indexer — Premium Features Page
// Pure JavaScript + React.createElement — no JSX

import React from 'react';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '../Navbar';

/* ─────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────── */
const T = {
    bg: '#020617',
    bgCard: 'rgba(255,255,255,0.04)',
    bgCardHov: 'rgba(255,255,255,0.07)',
    border: 'rgba(255,255,255,0.07)',
    cyan: '#00d4ff',
    purple: '#8b5cf6',
    green: '#10b981',
    amber: '#f59e0b',
    blue: '#3b82f6',
    pink: '#ec4899',
    red: '#ef4444',
    txt0: '#ffffff',
    txt1: '#94a3b8',
    txt2: '#475569',
    font: "'Bricolage Grotesque','Inter',sans-serif",
    mono: "'DM Mono','Fira Code',monospace",
    ease: 'cubic-bezier(0.16,1,0.3,1)',
};
const grad = 'linear-gradient(135deg,#00d4ff 0%,#8b5cf6 100%)';

/* ─────────────────────────────────────────
   SHARED ATOMS
───────────────────────────────────────── */
function GradText(props) {
    return React.createElement('span', {
        style: { background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }
    }, props.children);
}

function Badge(props) {
    const colors = {
        cyan: { bg: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: 'rgba(0,212,255,0.2)' },
        purple: { bg: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: 'rgba(139,92,246,0.2)' },
        green: { bg: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'rgba(16,185,129,0.2)' },
        amber: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.2)' },
        blue: { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: 'rgba(59,130,246,0.2)' },
        pink: { bg: 'rgba(236,72,153,0.1)', color: '#ec4899', border: 'rgba(236,72,153,0.2)' },
    };
    const c = colors[props.color || 'cyan'];
    return React.createElement('span', {
        style: {
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 11px', borderRadius: 9999,
            fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em',
            fontFamily: T.font,
            background: c.bg, color: c.color, border: `1px solid ${c.border}`,
        }
    }, props.children);
}

function CheckIcon(props) {
    return React.createElement('svg', {
        width: props.size || 14, height: props.size || 14,
        viewBox: '0 0 24 24', fill: 'none',
        stroke: props.color || '#10b981',
        strokeWidth: '2.5', strokeLinecap: 'round', strokeLinejoin: 'round',
        style: { flexShrink: 0, marginTop: 1 },
    }, React.createElement('polyline', { points: '20 6 9 17 4 12' }));
}

function ArrowRight() {
    return React.createElement('svg', {
        width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 2.5,
        strokeLinecap: 'round', strokeLinejoin: 'round',
    }, React.createElement('path', { d: 'M5 12h14M12 5l7 7-7 7' }));
}

/* ─────────────────────────────────────────
   SECTION WRAPPER
───────────────────────────────────────── */
function Section(props) {
    return React.createElement('section', {
        style: { padding: props.slim ? '60px 0' : '90px 0', ...props.style }
    }, React.createElement('div', { style: { maxWidth: 1160, margin: '0 auto', padding: '0 24px' } }, props.children));
}

/* ─────────────────────────────────────────
   HERO
───────────────────────────────────────── */
function Hero() {
    return React.createElement('section', {
        style: {
            padding: '110px 24px 80px',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
        }
    },
        // Background glow
        React.createElement('div', { style: { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,212,255,0.12) 0%, transparent 65%)', pointerEvents: 'none' } }),
        React.createElement('div', { style: { position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(0,212,255,0.1) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none', opacity: 0.5 } }),

        React.createElement('div', { style: { position: 'relative', maxWidth: 860, margin: '0 auto' } },
            React.createElement('div', { style: { marginBottom: 20 } }, React.createElement(Badge, { color: 'cyan' }, '⚡ Platform Features')),

            React.createElement('h1', {
                style: { fontSize: 'clamp(2.5rem,5.5vw,4.5rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: 22, fontFamily: T.font }
            },
                'Everything You Need to',
                React.createElement('br'),
                React.createElement(GradText, null, 'Dominate Search Indexing')
            ),

            React.createElement('p', {
                style: { fontSize: 'clamp(1rem,2vw,1.2rem)', color: T.txt1, maxWidth: 620, margin: '0 auto 40px', lineHeight: 1.75, fontFamily: T.font }
            }, 'Google Indexing API, IndexNow, Sitemap Pings, RSS Signals, AI SEO analysis, bulk processing, real-time analytics — all in one unified platform.'),

            React.createElement('div', { style: { display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' } },
                React.createElement(Link, {
                    href: '/signup',
                    style: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 12, fontSize: '0.9375rem', fontWeight: 700, fontFamily: T.font, color: '#fff', background: grad, boxShadow: '0 4px 24px rgba(0,212,255,0.3)', textDecoration: 'none', transition: 'all 0.2s' }
                }, '⚡ Start'),
                React.createElement(Link, {
                    href: '/pricing',
                    style: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px', borderRadius: 12, fontSize: '0.9375rem', fontWeight: 600, fontFamily: T.font, color: T.txt1, background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}`, textDecoration: 'none' }
                }, 'View Pricing')
            )
        )
    );
}

/* ─────────────────────────────────────────
   FEATURE ROWS
───────────────────────────────────────── */
const FEATURE_ROWS = [
    {
        badge: 'Core', badgeColor: 'cyan',
        tag: 'Google Indexing API', color: '#00d4ff',
        icon: '🔵',
        title: 'Direct Google Indexing API',
        desc: 'Bypass organic discovery entirely. Our direct integration with Google\'s official Indexing API submits URLs for crawling within hours — not weeks. Multi-account rotation ensures you never hit rate limits.',
        points: ['Up to 200 requests per minute', 'Automatic service account rotation', 'Smart request batching & queuing', 'Quota management & alerts', 'Instant retry on failure', 'Real-time status per URL'],
        visual: 'google',
    },
    {
        badge: 'Instant', badgeColor: 'purple',
        tag: 'IndexNow Protocol', color: '#8b5cf6',
        icon: '⚡',
        title: 'IndexNow — Bing, Yandex & More',
        desc: 'One submission, multiple search engines. The IndexNow protocol lets you notify Bing, Yandex, and all participating engines simultaneously in milliseconds — no separate API accounts required.',
        points: ['Single call, multiple engines', 'Bing & Yandex support', 'Sub-second notification delivery', 'Automatic key management', 'Bulk batch submissions', 'Submission confirmation logs'],
        visual: 'indexnow',
    },
    {
        badge: 'High Volume', badgeColor: 'green',
        tag: 'Bulk Processing Engine', color: '#10b981',
        icon: '📡',
        title: 'Bulk URL Processing at Scale',
        desc: 'Built for enterprise volume. Submit 50,000+ URLs in a single operation via paste, CSV upload, or XML sitemap URL. Our BullMQ + Redis queue architecture distributes work across parallel worker clusters.',
        points: ['CSV upload up to 50,000 rows', 'XML sitemap auto-crawl', 'Drip-feed scheduling (rate control)', 'Job priority levels (Low → Urgent)', 'Failed job auto-recovery', 'Real-time worker health monitor'],
        visual: 'bulk',
    },
    {
        badge: 'AI-Powered', badgeColor: 'amber',
        tag: 'AI SEO Assistant', color: '#f59e0b',
        icon: '🤖',
        title: 'AI-Powered SEO Analysis',
        desc: 'Every submitted URL gets scored by our AI engine. Crawlability analysis, duplicate content detection, canonical issue flagging, redirect chain detection — all surfaced before you submit.',
        points: ['Crawlability probability score', 'Duplicate content detection', 'Canonical tag analysis', 'Redirect chain detection', 'Mobile-friendliness check', 'Actionable fix recommendations'],
        visual: 'ai',
    },
];

function CodePreview(props) {
    const { type } = props;
    const snippets = {
        google: [
            { c: '#475569', t: '# Submit via Google Indexing API' },
            { c: '#00d4ff', t: 'POST', rest: ' /v1/index' },
            { c: '#94a3b8', t: 'Authorization: Bearer YOUR_KEY' },
            { c: '#94a3b8', t: 'Content-Type: application/json' },
            { c: '', t: '' },
            { c: '#10b981', t: '{ "urls": ["https://site.com/new-post"], "method": "google" }' },
        ],
        indexnow: [
            { c: '#475569', t: '# IndexNow — notify 4 engines at once' },
            { c: '#8b5cf6', t: 'POST', rest: ' /v1/indexnow/submit' },
            { c: '#94a3b8', t: 'engines: bing, yandex, naver, seznam' },
            { c: '', t: '' },
            { c: '#10b981', t: '✓ Bing notified in 120ms' },
            { c: '#10b981', t: '✓ Yandex notified in 94ms' },
        ],
        bulk: [
            { c: '#475569', t: '# 1,000 credits queued in 1.2s' },
            { c: '#10b981', t: 'Job ID: job_x9K2mNpQr4' },
            { c: '#94a3b8', t: 'Workers: 4 active' },
            { c: '#00d4ff', t: 'Progress: ████████░░ 78%' },
            { c: '#94a3b8', t: 'Submitted: 780  Pending: 220' },
            { c: '#f59e0b', t: 'ETA: ~4 minutes' },
        ],
        ai: [
            { c: '#475569', t: '# AI SEO Analysis Result' },
            { c: '#10b981', t: 'Crawlability Score: 94/100' },
            { c: '#94a3b8', t: 'Duplicate Risk: Low' },
            { c: '#94a3b8', t: 'Canonical: OK' },
            { c: '#f59e0b', t: '⚠ Redirect chain: 2 hops detected' },
            { c: '#00d4ff', t: 'Recommendation: Fix → direct URL' },
        ],
    };
    const lines = snippets[type] || snippets.google;
    return React.createElement('div', {
        style: { background: '#010409', border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 14, padding: '20px 22px', fontFamily: T.mono, fontSize: '0.8125rem', lineHeight: 1.9 }
    },
        // Dot row
        React.createElement('div', { style: { display: 'flex', gap: 6, marginBottom: 14 } },
            ...['#ef4444', '#f59e0b', '#10b981'].map(function (c) {
                return React.createElement('div', { key: c, style: { width: 10, height: 10, borderRadius: '50%', background: c } });
            })
        ),
        lines.map(function (l, i) {
            return React.createElement('div', { key: i, style: { display: 'flex', gap: 6 } },
                React.createElement('span', { style: { color: '#2a3548', userSelect: 'none', minWidth: 20, fontFamily: T.mono } }, String(i + 1).padStart(2, ' ')),
                React.createElement('span', { style: { color: l.c || T.txt1 } },
                    l.t,
                    l.rest && React.createElement('span', { style: { color: T.txt1 } }, l.rest)
                )
            );
        })
    );
}

function FeatureRow(props) {
    const { badge, badgeColor, tag, color, icon, title, desc, points, visual, index } = props;
    const isEven = index % 2 === 0;
    const [hov, setHov] = useState(false);

    return React.createElement('div', {
        className: 'collapse-on-mobile',
        style: {
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center',
            padding: '72px 0', borderBottom: `1px solid ${T.border}`,
        }
    },
        // Text col
        React.createElement('div', { style: { order: isEven ? 0 : 1 } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 } },
                React.createElement(Badge, { color: badgeColor }, badge),
                React.createElement('span', { style: { fontSize: '0.75rem', color: T.txt2, fontFamily: T.font } }, tag)
            ),
            React.createElement('h2', {
                style: { fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 18, fontFamily: T.font, lineHeight: 1.15 }
            }, title),
            React.createElement('p', {
                style: { fontSize: '1rem', color: T.txt1, lineHeight: 1.8, marginBottom: 28 }
            }, desc),
            React.createElement('ul', { className: 'collapse-on-mobile', style: { listStyle: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px' } },
                points.map(function (pt) {
                    return React.createElement('li', {
                        key: pt,
                        style: { display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.875rem', color: T.txt1 }
                    },
                        React.createElement(CheckIcon, { color }),
                        pt
                    );
                })
            )
        ),

        // Visual col
        React.createElement('div', {
            onMouseEnter: function () { setHov(true); },
            onMouseLeave: function () { setHov(false); },
            style: { order: isEven ? 1 : 0 }
        },
            React.createElement('div', {
                style: {
                    background: `linear-gradient(135deg, ${color}08 0%, rgba(0,0,0,0) 100%)`,
                    border: `1px solid ${color}25`,
                    borderRadius: 18,
                    padding: 28,
                    transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
                    transform: hov ? 'translateY(-4px)' : 'none',
                    boxShadow: hov ? `0 20px 48px rgba(0,0,0,0.5), 0 0 0 1px ${color}30` : 'none',
                }
            },
                // Icon header
                React.createElement('div', {
                    style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }
                },
                    React.createElement('div', {
                        style: { width: 44, height: 44, borderRadius: 12, background: `${color}15`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }
                    }, icon),
                    React.createElement('div', null,
                        React.createElement('div', { style: { fontSize: '0.875rem', fontWeight: 700, color: T.txt0, fontFamily: T.font } }, tag),
                        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 } },
                            React.createElement('div', { style: { width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'livePulse 1.5s ease-in-out infinite' } }),
                            React.createElement('span', { style: { fontSize: '0.625rem', color: '#10b981', fontWeight: 600, fontFamily: T.font } }, 'LIVE')
                        )
                    )
                ),
                React.createElement(CodePreview, { type: visual })
            )
        )
    );
}

/* ─────────────────────────────────────────
   EXTRA FEATURES GRID
───────────────────────────────────────── */
const EXTRA = [
    { icon: '📊', title: 'Real-Time Analytics', desc: 'Live dashboards, queue depth charts, success rates, and 90-day trend analysis all powered by Socket.io.', color: '#3b82f6' },
    { icon: '🔗', title: 'Public REST API', desc: 'Full-featured API with webhooks, SDK support, and rate limiting. Build indexing directly into your workflow.', color: '#ec4899' },
    { icon: '🗂️', title: 'Project Organisation', desc: 'Group URLs by domain, client, or campaign. Per-project analytics and access controls for agencies.', color: '#8b5cf6' },
    { icon: '🔔', title: 'Smart Alerts', desc: 'Telegram, Slack, email, and webhook notifications for quota warnings, batch completions, and failures.', color: '#f59e0b' },
    { icon: '🛡️', title: 'Enterprise Security', desc: 'JWT auth, CSRF protection, rate limiting, secure headers, and full audit logs on every action.', color: '#ef4444' },
    { icon: '👥', title: 'Team Collaboration', desc: 'Invite teammates, assign roles (Owner / Admin / Editor / Viewer), and share projects across your agency.', color: '#10b981' },
    { icon: '📋', title: 'CSV & Sitemap Import', desc: 'Paste URLs, upload CSV files up to 50k rows, or point us at a sitemap URL — we extract and submit everything.', color: '#00d4ff' },
    { icon: '⏱️', title: 'Drip-Feed Scheduling', desc: 'Set a submission rate (e.g. 200 URLs/hr) to distribute naturally and avoid triggering rate-limit heuristics.', color: '#a78bfa' },
];

function ExtraGrid() {
    return React.createElement(Section, null,
        React.createElement('div', { style: { textAlign: 'center', marginBottom: 60 } },
            React.createElement(Badge, { color: 'blue' }, 'More Features'),
            React.createElement('h2', { style: { fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 800, letterSpacing: '-0.03em', marginTop: 16, marginBottom: 12, fontFamily: T.font } },
                'Built for Teams That Move ', React.createElement(GradText, null, 'Fast')
            )
        ),
        React.createElement('div', {
            style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 14 }
        },
            EXTRA.map(function (f) {
                const [hov, setHov] = useState(false);
                return React.createElement('div', {
                    key: f.title,
                    onMouseEnter: function () { setHov(true); },
                    onMouseLeave: function () { setHov(false); },
                    style: {
                        padding: '24px 22px',
                        background: hov ? T.bgCardHov : T.bgCard,
                        border: `1px solid ${hov ? f.color + '30' : T.border}`,
                        borderRadius: 16,
                        transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
                        transform: hov ? 'translateY(-3px)' : 'none',
                    }
                },
                    React.createElement('div', {
                        style: { width: 44, height: 44, borderRadius: 12, background: `${f.color}12`, border: `1px solid ${f.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 14 }
                    }, f.icon),
                    React.createElement('h3', { style: { fontSize: '1rem', fontWeight: 700, marginBottom: 8, fontFamily: T.font } }, f.title),
                    React.createElement('p', { style: { fontSize: '0.875rem', color: T.txt1, lineHeight: 1.7 } }, f.desc)
                );
            })
        )
    );
}

/* ─────────────────────────────────────────
   CTA STRIP
───────────────────────────────────────── */
function CtaStrip() {
    return React.createElement(Section, null,
        React.createElement('div', {
            style: {
                padding: '56px 48px', textAlign: 'center',
                background: 'linear-gradient(135deg,rgba(0,212,255,0.07) 0%,rgba(139,92,246,0.07) 100%)',
                border: '1px solid rgba(0,212,255,0.18)',
                borderRadius: 24,
                position: 'relative', overflow: 'hidden',
            }
        },
            React.createElement('div', { style: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(0,212,255,0.6),transparent)' } }),
            React.createElement('h2', { style: { fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 14, fontFamily: T.font } },
                'Ready to Index at ', React.createElement(GradText, null, '10× Speed?')
            ),
            React.createElement('p', { style: { color: T.txt1, fontSize: '1rem', marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' } },
                'Join 8,700+ SEO professionals who trust Speedy Indexer for bulk URL indexing.'
            ),
            React.createElement('div', { style: { display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' } },
                React.createElement(Link, {
                    href: '/signup',
                    style: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 12, fontSize: '0.9375rem', fontWeight: 700, fontFamily: T.font, color: '#fff', background: grad, boxShadow: '0 4px 24px rgba(0,212,255,0.3)', textDecoration: 'none' }
                }, '⚡ Buy Credits — Credits Never Expire'),
                React.createElement(Link, {
                    href: '/pricing',
                    style: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px', borderRadius: 12, fontSize: '0.9375rem', fontWeight: 600, fontFamily: T.font, color: T.txt1, border: `1px solid ${T.border}`, textDecoration: 'none' }
                }, 'See Pricing')
            )
        )
    );
}

/* ─────────────────────────────────────────
   PAGE EXPORT
───────────────────────────────────────── */
export default function FeaturesPage() {
    return React.createElement('div', { style: { background: T.bg, minHeight: '100vh' } },
        React.createElement('style', null, `
      @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      @media(max-width:768px){
        .feat-row-grid { grid-template-columns:1fr !important; }
        .feat-row-grid > div { order:0 !important; }
      }
    `),
        React.createElement(Navbar),
        React.createElement(Hero),

        // Feature rows
        React.createElement('div', { style: { maxWidth: 1160, margin: '0 auto', padding: '0 24px' } },
            FEATURE_ROWS.map(function (f, i) {
                return React.createElement(FeatureRow, { key: f.title, ...f, index: i });
            })
        ),

        React.createElement(ExtraGrid),
        React.createElement(CtaStrip)
    );
}
