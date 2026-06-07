'use client';


import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '../Navbar';

/* ─────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────── */
const T = {
    bg: '#020617',
    bgSurface: '#060e24',
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
const gradPurple = 'linear-gradient(135deg,#8b5cf6 0%,#ec4899 100%)';
const gradGreen = 'linear-gradient(135deg,#10b981 0%,#3b82f6 100%)';

/* ─────────────────────────────────────────
   KEYFRAMES — injected once
───────────────────────────────────────── */
const KEYFRAMES = `
  @keyframes fadeUp   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:none} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes scanLine { from{transform:translateY(-100%)} to{transform:translateY(300%)} }
  @keyframes livePing {
    0%   { box-shadow:0 0 0 0 rgba(16,185,129,0.6); }
    70%  { box-shadow:0 0 0 8px rgba(16,185,129,0); }
    100% { box-shadow:0 0 0 0 rgba(16,185,129,0); }
  }
  @keyframes countUp  { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:none} }
  @keyframes shimmerBar {
    0%   { background-position:200% 0; }
    100% { background-position:-200% 0; }
  }
`;

/* ─────────────────────────────────────────
   REUSABLE ATOMS
───────────────────────────────────────── */
function GradText(props) {
    return React.createElement('span', {
        style: {
            background: props.g || grad,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
        },
    }, props.children);
}

function Pill(props) {
    const palettes = {
        cyan: { bg: 'rgba(0,212,255,0.09)', color: '#00d4ff', border: 'rgba(0,212,255,0.22)' },
        purple: { bg: 'rgba(139,92,246,0.09)', color: '#8b5cf6', border: 'rgba(139,92,246,0.22)' },
        green: { bg: 'rgba(16,185,129,0.09)', color: '#10b981', border: 'rgba(16,185,129,0.22)' },
        amber: { bg: 'rgba(245,158,11,0.09)', color: '#f59e0b', border: 'rgba(245,158,11,0.22)' },
        blue: { bg: 'rgba(59,130,246,0.09)', color: '#3b82f6', border: 'rgba(59,130,246,0.22)' },
        pink: { bg: 'rgba(236,72,153,0.09)', color: '#ec4899', border: 'rgba(236,72,153,0.22)' },
    };
    const c = palettes[props.color || 'cyan'];
    return React.createElement('span', {
        style: {
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 11px', borderRadius: 9999,
            fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em',
            fontFamily: T.font,
            background: c.bg, color: c.color, border: `1px solid ${c.border}`,
        },
    }, props.children);
}

function CheckIcon(props) {
    return React.createElement('svg', {
        width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none',
        stroke: props.color || T.green, strokeWidth: '2.5',
        strokeLinecap: 'round', strokeLinejoin: 'round',
        style: { flexShrink: 0 },
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
   ANIMATED COUNTER
───────────────────────────────────────── */
function AnimCounter(props) {
    const { target, suffix = '', prefix = '', duration = 2000, decimals = 0 } = props;
    const [val, setVal] = useState(0);
    const [done, setDone] = useState(false);
    const ref = useRef(null);
    const once = useRef(false);

    useEffect(function () {
        const obs = new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting && !once.current) {
                once.current = true;
                const start = performance.now();
                function tick(now) {
                    const prog = Math.min((now - start) / duration, 1);
                    const ease = 1 - Math.pow(1 - prog, 4);
                    setVal(+(ease * target).toFixed(decimals));
                    if (prog < 1) requestAnimationFrame(tick);
                    else setDone(true);
                }
                requestAnimationFrame(tick);
            }
        }, { threshold: 0.3 });
        if (ref.current) obs.observe(ref.current);
        return function () { obs.disconnect(); };
    }, [target, duration, decimals]);

    const display = target >= 1000 ? Math.round(val).toLocaleString() : val.toFixed(decimals);
    return React.createElement('span', { ref }, prefix + display + suffix);
}

/* ─────────────────────────────────────────
   SECTION WRAPPER
───────────────────────────────────────── */
function Sec(props) {
    return React.createElement('section', {
        style: { padding: props.slim ? '60px 0' : '96px 0', ...props.style },
    },
        React.createElement('div', {
            style: { maxWidth: props.wide ? 1200 : 1080, margin: '0 auto', padding: '0 24px' },
        }, props.children)
    );
}

/* ─────────────────────────────────────────
   SECTION HEADER HELPER
───────────────────────────────────────── */
function SectionHeader(props) {
    return React.createElement('div', {
        style: { textAlign: 'center', maxWidth: 620, margin: '0 auto', marginBottom: props.mb || 64 },
    },
        React.createElement('div', { style: { marginBottom: 18 } },
            React.createElement(Pill, { color: props.badgeColor || 'cyan' }, props.badge)
        ),
        React.createElement('h2', {
            style: { fontSize: 'clamp(1.8rem,3.5vw,2.9rem)', fontWeight: 900, letterSpacing: '-0.035em', marginBottom: 16, lineHeight: 1.12, fontFamily: T.font },
        }, props.title),
        props.sub && React.createElement('p', {
            style: { fontSize: '1.0625rem', color: T.txt1, lineHeight: 1.75, fontFamily: T.font },
        }, props.sub)
    );
}

/* ═════════════════════════════════════════
   1. HERO
═════════════════════════════════════════ */
function Hero() {
    return React.createElement('section', {
        style: { padding: '120px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' },
    },
        /* glow layers */
        React.createElement('div', { style: { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 85% 55% at 50% -10%, rgba(0,212,255,0.13) 0%, transparent 65%)', pointerEvents: 'none' } }),
        React.createElement('div', { style: { position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(0,212,255,0.08) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none', opacity: 0.55 } }),

        /* floating orbs */
        React.createElement('div', { style: { position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'rgba(0,212,255,0.05)', filter: 'blur(90px)', top: -180, left: 'calc(50% - 250px)', animation: 'float 9s ease-in-out infinite', pointerEvents: 'none' } }),
        React.createElement('div', { style: { position: 'absolute', width: 320, height: 320, borderRadius: '50%', background: 'rgba(139,92,246,0.07)', filter: 'blur(70px)', bottom: -100, right: '8%', animation: 'float 11s ease-in-out infinite 3s', pointerEvents: 'none' } }),

        React.createElement('div', { style: { position: 'relative', maxWidth: 820, margin: '0 auto' } },

            /* eyebrow */
            React.createElement('div', { style: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 9999, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', fontSize: '0.75rem', fontWeight: 700, color: T.cyan, fontFamily: T.font, marginBottom: 28, letterSpacing: '0.05em' } },
                React.createElement('span', { style: { width: 7, height: 7, borderRadius: '50%', background: T.cyan, animation: 'livePing 1.8s ease-in-out infinite' } }),
                'Our Story'
            ),

            /* headline */
            React.createElement('h1', {
                style: { fontSize: 'clamp(2.8rem,6vw,5rem)', fontWeight: 900, lineHeight: 1.03, letterSpacing: '-0.045em', marginBottom: 26, fontFamily: T.font },
            },
                'Built by SEO Engineers,', React.createElement('br'),
                React.createElement(GradText, null, 'Obsessed with Speed')
            ),

            /* sub */
            React.createElement('p', {
                style: { fontSize: 'clamp(1rem,1.8vw,1.2rem)', color: T.txt1, maxWidth: 640, margin: '0 auto 44px', lineHeight: 1.8, fontFamily: T.font },
            }, 'Speedy Indexer was born out of a simple frustration — waiting weeks for Google to discover new URLs. We built the platform we always wished existed: multi-channel, high-volume, AI-powered URL indexing for professionals.'),

            /* CTA row */
            React.createElement('div', { style: { display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' } },
                React.createElement(Link, {
                    href: '/signup',
                    style: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 30px', borderRadius: 12, fontSize: '0.9375rem', fontWeight: 700, fontFamily: T.font, color: '#fff', background: grad, boxShadow: '0 4px 26px rgba(0,212,255,0.32)', textDecoration: 'none', transition: 'all 0.2s' },
                    onMouseEnter: function (e) { e.currentTarget.style.boxShadow = '0 8px 36px rgba(0,212,255,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)'; },
                    onMouseLeave: function (e) { e.currentTarget.style.boxShadow = '0 4px 26px rgba(0,212,255,0.32)'; e.currentTarget.style.transform = 'none'; },
                }, '⚡ Buy Credits'),
                React.createElement(Link, {
                    href: '/features',
                    style: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 26px', borderRadius: 12, fontSize: '0.9375rem', fontWeight: 600, fontFamily: T.font, color: T.txt1, background: T.bgCard, border: `1px solid ${T.border}`, textDecoration: 'none', transition: 'all 0.2s' },
                    onMouseEnter: function (e) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = T.txt0; },
                    onMouseLeave: function (e) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.txt1; },
                }, 'Explore Features')
            )
        )
    );
}

/* ═════════════════════════════════════════
   2. STATS BAR
═════════════════════════════════════════ */
const STATS = [
    { value: 48230000, suffix: '+', label: 'URLs Indexed', color: T.cyan, prefix: '' },
    { value: 12400, suffix: '+', label: 'Active Sites', color: T.purple, prefix: '' },
    { value: 8700, suffix: '+', label: 'Happy Users', color: T.green, prefix: '' },
    { value: 99.97, suffix: '%', label: 'Platform Uptime', color: T.amber, prefix: '', decimals: 2 },
    { value: 14, suffix: '', label: 'Team Members', color: T.blue, prefix: '' },
    { value: 2023, suffix: '', label: 'Year Founded', color: T.pink, prefix: '' },
];

function StatsBar() {
    return React.createElement(Sec, { slim: true, style: { background: 'rgba(255,255,255,0.015)', borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` } },
        React.createElement('div', {
            style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 0 },
        },
            STATS.map(function (s, i) {
                return React.createElement('div', {
                    key: s.label,
                    style: {
                        textAlign: 'center', padding: '28px 16px',
                        borderRight: i < STATS.length - 1 ? `1px solid ${T.border}` : 'none',
                    },
                },
                    React.createElement('div', {
                        style: { fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 900, letterSpacing: '-0.045em', color: s.color, fontFamily: T.font, lineHeight: 1, marginBottom: 8 },
                    },
                        React.createElement(AnimCounter, { target: s.value, suffix: s.suffix, prefix: s.prefix, decimals: s.decimals || 0, duration: 2200 })
                    ),
                    React.createElement('div', { style: { fontSize: '0.75rem', color: T.txt2, fontFamily: T.font, fontWeight: 600 } }, s.label)
                );
            })
        )
    );
}

/* ═════════════════════════════════════════
   3. MISSION
═════════════════════════════════════════ */
function Mission() {
    const pillars = [
        { icon: '⚡', color: T.cyan, title: 'Speed First', desc: 'Every decision we make starts with a single question: does this make indexing faster? Speed is our north star.' },
        { icon: '🔒', color: T.purple, title: 'Reliability', desc: 'Enterprise teams depend on us for mission-critical workflows. We maintain 99.97% uptime with zero-downtime deploys.' },
        { icon: '🧠', color: T.amber, title: 'AI-Driven', desc: 'Our SEO analysis engine learns from millions of indexed URLs to give you the most accurate crawlability scores in the industry.' },
        { icon: '🌍', color: T.green, title: 'Built to Scale', desc: 'The same infrastructure supports small credit packs, agency batches, and enterprise discovery operations.' },
    ];

    return React.createElement(Sec, null,
        React.createElement('div', { className: 'collapse-on-mobile', style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' } },

            /* Left — text */
            React.createElement('div', null,
                React.createElement('div', { style: { marginBottom: 20 } }, React.createElement(Pill, { color: 'purple' }, 'Our Mission')),
                React.createElement('h2', {
                    style: { fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 22, fontFamily: T.font },
                },
                    'We Exist to Make', React.createElement('br'),
                    React.createElement(GradText, { g: gradPurple }, 'Every URL Discoverable')
                ),
                React.createElement('p', { style: { color: T.txt1, fontSize: '1.0625rem', lineHeight: 1.85, marginBottom: 20 } },
                    'Search engines index a fraction of the web on their own schedules. We believe every piece of quality content deserves to be found — immediately, not weeks from now.'
                ),
                React.createElement('p', { style: { color: T.txt1, fontSize: '1rem', lineHeight: 1.85, marginBottom: 32 } },
                    'Speedy Indexer was founded in 2023 by a team of SEO engineers and infrastructure specialists who had spent years fighting slow discovery times. We built the solution we needed — and made it available to the world.'
                ),
                React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
                    ['Direct Google Indexing API integration with multi-account rotation',
                        'IndexNow protocol for instant multi-engine notification',
                        'BullMQ + Redis queue handling 200,000+ URLs per day',
                        'AI crawlability scoring on every submitted URL'].map(function (point) {
                            return React.createElement('div', {
                                key: point, style: { display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.9375rem', color: T.txt1 },
                            },
                                React.createElement(CheckIcon, { color: T.purple }),
                                point
                            );
                        })
                )
            ),

            /* Right — pillars grid */
            React.createElement('div', {
                className: 'collapse-on-mobile',
                style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
            },
                pillars.map(function (p) {
                    const [hov, setHov] = useState(false);
                    return React.createElement('div', {
                        key: p.title,
                        onMouseEnter: function () { setHov(true); },
                        onMouseLeave: function () { setHov(false); },
                        style: {
                            padding: '24px 20px',
                            background: hov ? T.bgCardHov : T.bgCard,
                            border: `1px solid ${hov ? p.color + '30' : T.border}`,
                            borderRadius: 16,
                            transition: 'all 0.28s ' + T.ease,
                            transform: hov ? 'translateY(-3px)' : 'none',
                            boxShadow: hov ? `0 16px 36px rgba(0,0,0,0.4), 0 0 0 1px ${p.color}20` : 'none',
                        },
                    },
                        React.createElement('div', {
                            style: { width: 46, height: 46, borderRadius: 13, background: `${p.color}12`, border: `1px solid ${p.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 14, transition: 'box-shadow 0.28s', boxShadow: hov ? `0 0 18px ${p.color}30` : 'none' },
                        }, p.icon),
                        React.createElement('h3', { style: { fontSize: '0.9375rem', fontWeight: 700, marginBottom: 8, fontFamily: T.font } }, p.title),
                        React.createElement('p', { style: { fontSize: '0.8125rem', color: T.txt2, lineHeight: 1.7 } }, p.desc)
                    );
                })
            )
        )
    );
}

/* ═════════════════════════════════════════
   4. TEAM
═════════════════════════════════════════ */
const TEAM = [
    { name: 'Jordan Wells', role: 'Co-Founder & CEO', initials: 'JW', color: T.cyan, bio: '10 years building SEO infrastructure at scale. Former Head of Search Engineering at a Fortune 500 media company.' },
    { name: 'Sarah Chen', role: 'Co-Founder & CTO', initials: 'SC', color: T.purple, bio: 'Distributed systems engineer. Led queue infrastructure serving 1B+ events/day at a top-tier cloud provider.' },
    { name: 'Marcus Tate', role: 'Head of Product', initials: 'MT', color: T.green, bio: 'Product leader with a background in SEO tooling. Built and scaled two SaaS products from 0 to $5M ARR.' },
    { name: 'Priya Mehta', role: 'Lead ML Engineer', initials: 'PM', color: T.amber, bio: 'Machine learning specialist focusing on NLP and web crawling. PhD in Computer Science, Stanford University.' },
    { name: 'Alex Rivers', role: 'Head of Growth', initials: 'AR', color: T.blue, bio: 'Growth strategist. Previously at Ahrefs and SEMrush, helping SEO tools reach 500k+ user communities.' },
    { name: 'Lena Kovač', role: 'Senior Backend Engineer', initials: 'LK', color: T.pink, bio: 'Node.js and Redis specialist. Designed the BullMQ worker architecture that powers our 200k URLs/day throughput.' },
    { name: 'Raj Patel', role: 'Senior Frontend Engineer', initials: 'RP', color: T.cyan, bio: 'React and Next.js expert. Crafted the real-time dashboard experience used by 8,700+ daily active users.' },
    { name: 'Mei Zhang', role: 'DevOps & Infrastructure', initials: 'MZ', color: T.purple, bio: 'Infrastructure engineer managing our Docker/Kubernetes deployment across 3 data centres with 99.97% uptime.' },
];

function TeamCard(props) {
    const { member } = props;
    const [hov, setHov] = useState(false);

    return React.createElement('div', {
        onMouseEnter: function () { setHov(true); },
        onMouseLeave: function () { setHov(false); },
        style: {
            padding: '26px 22px',
            background: hov ? T.bgCardHov : T.bgCard,
            border: `1px solid ${hov ? member.color + '35' : T.border}`,
            borderRadius: 18,
            transition: 'all 0.28s ' + T.ease,
            transform: hov ? 'translateY(-4px)' : 'none',
            boxShadow: hov ? `0 18px 40px rgba(0,0,0,0.45), 0 0 0 1px ${member.color}18` : 'none',
        },
    },
        /* Avatar */
        React.createElement('div', {
            style: {
                width: 56, height: 56, borderRadius: '50%', marginBottom: 16,
                background: `${member.color}16`,
                border: `2px solid ${member.color}35`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', fontWeight: 800, color: member.color,
                fontFamily: T.font,
                boxShadow: hov ? `0 0 20px ${member.color}30` : 'none',
                transition: 'box-shadow 0.28s',
            },
        }, member.initials),

        /* Name + role */
        React.createElement('h3', { style: { fontSize: '1rem', fontWeight: 700, marginBottom: 4, fontFamily: T.font } }, member.name),
        React.createElement('div', {
            style: { fontSize: '0.75rem', fontWeight: 600, color: member.color, marginBottom: 12, fontFamily: T.font },
        }, member.role),

        /* Bio */
        React.createElement('p', { style: { fontSize: '0.8125rem', color: T.txt2, lineHeight: 1.7 } }, member.bio),

        /* Social links */
        React.createElement('div', {
            style: { display: 'flex', gap: 8, marginTop: 16 },
        },
            ['𝕏', '💼'].map(function (icon, i) {
                return React.createElement('button', {
                    key: i,
                    style: {
                        width: 30, height: 30, borderRadius: 8,
                        background: 'rgba(255,255,255,0.05)',
                        border: `1px solid ${T.border}`,
                        cursor: 'pointer', fontSize: 13,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: T.txt2, transition: 'all 0.18s',
                    },
                    onMouseEnter: function (e) { e.currentTarget.style.borderColor = member.color + '50'; e.currentTarget.style.color = member.color; },
                    onMouseLeave: function (e) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.txt2; },
                }, icon);
            })
        )
    );
}

function Team() {
    return React.createElement(Sec, { wide: true },
        React.createElement(SectionHeader, {
            badge: 'The Team', badgeColor: 'green',
            title: React.createElement(React.Fragment, null, 'Meet the People', React.createElement('br'), React.createElement(GradText, { g: gradGreen }, 'Behind Speedy Indexer')),
            sub: 'A distributed team of 14 engineers, designers, and SEO specialists across 8 countries — united by an obsession with indexing speed.',
            mb: 60,
        }),
        React.createElement('div', {
            style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 },
        },
            TEAM.map(function (member) {
                return React.createElement(TeamCard, { key: member.name, member });
            })
        ),

        /* Hiring CTA */
        React.createElement('div', {
            style: {
                marginTop: 48, padding: '36px 40px',
                background: 'rgba(16,185,129,0.05)',
                border: '1px solid rgba(16,185,129,0.18)',
                borderRadius: 20, textAlign: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 20,
            },
        },
            React.createElement('div', null,
                React.createElement('h3', { style: { fontSize: '1.2rem', fontWeight: 800, marginBottom: 6, fontFamily: T.font } }, "We're Hiring 🚀"),
                React.createElement('p', { style: { color: T.txt1, fontSize: '0.9375rem', fontFamily: T.font } }, 'Join our remote-first team and help index the web, faster.')
            ),
            React.createElement(Link, {
                href: '/careers',
                style: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px', borderRadius: 12, background: gradGreen, color: '#fff', fontSize: '0.9375rem', fontWeight: 700, fontFamily: T.font, textDecoration: 'none', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' },
            }, 'View Open Roles', React.createElement(ArrowRight))
        )
    );
}

/* ═════════════════════════════════════════
   5. TIMELINE / STORY
═════════════════════════════════════════ */
const TIMELINE = [
    { year: 'Q1 2023', color: T.cyan, icon: '💡', title: 'The Idea', desc: 'After struggling with 3-week indexing delays on a client site, Jordan and Sarah sketched the architecture for what would become Speedy Indexer on a napkin in San Francisco.' },
    { year: 'Q2 2023', color: T.purple, icon: '🔨', title: 'Building the Core', desc: 'The first BullMQ + Redis queue system went live, powering credit-based URL discovery workflows. The team grew from 2 to 6 engineers across 4 countries.' },
    { year: 'Q3 2023', color: T.green, icon: '🚀', title: 'Private Beta', desc: '200 hand-picked SEO agencies joined the private beta. Average indexing time dropped from 18 days to under 4 hours. NPS score: 72.' },
    { year: 'Q4 2023', color: T.amber, icon: '📈', title: 'Public Launch', desc: 'Speedy Indexer launched publicly. 1,200 users signed up in the first 48 hours. Processed 2.4 million URLs in the first month.' },
    { year: 'Q1 2024', color: T.blue, icon: '🤖', title: 'AI Engine v1', desc: 'Launched our AI crawlability scoring engine, trained on 10 million indexed URLs. Immediately became the most-used feature among Pro subscribers.' },
    { year: 'Q3 2024', color: T.pink, icon: '🌍', title: 'Scale Milestone', desc: 'Crossed 10,000 active users and 100 million URLs indexed. Expanded infrastructure to 3 data centres for sub-100ms API responses globally.' },
    { year: 'Q1 2025', color: T.cyan, icon: '⚡', title: 'IndexNow + Webhooks', desc: 'Added IndexNow protocol support (Bing, Yandex) and a full webhook system. White-label dashboard launched for Agency plan customers.' },
    { year: 'Today', color: T.purple, icon: '🔮', title: 'What\'s Next', desc: 'Building towards 500,000 URLs/day throughput, a Chrome extension, WordPress plugin, and an enterprise API with sub-50ms SLAs.' },
];

function Timeline() {
    return React.createElement(Sec, { style: { background: 'rgba(255,255,255,0.012)', borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` } },
        React.createElement(SectionHeader, {
            badge: 'Our Journey', badgeColor: 'amber',
            title: React.createElement(React.Fragment, null, 'From Napkin Sketch to', React.createElement('br'), React.createElement(GradText, { g: 'linear-gradient(135deg,#f59e0b,#ef4444)' }, '48M+ URLs Indexed')),
            sub: 'Two years of building, shipping, and scaling — in the open.',
            mb: 72,
        }),

        React.createElement('div', { style: { position: 'relative', maxWidth: 780, margin: '0 auto' } },
            /* Vertical line */
            React.createElement('div', {
                style: { position: 'absolute', left: 29, top: 0, bottom: 0, width: 1, background: `linear-gradient(to bottom, transparent, ${T.border} 10%, ${T.border} 90%, transparent)` },
            }),

            /* Events */
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 0 } },
                TIMELINE.map(function (event, i) {
                    const [hov, setHov] = useState(false);
                    return React.createElement('div', {
                        key: event.year,
                        style: { display: 'flex', gap: 24, paddingBottom: 40, position: 'relative' },
                    },
                        /* Node */
                        React.createElement('div', {
                            style: {
                                width: 60, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
                            },
                        },
                            React.createElement('div', {
                                style: {
                                    width: 38, height: 38, borderRadius: '50%', zIndex: 1, flexShrink: 0,
                                    background: `${event.color}15`,
                                    border: `2px solid ${event.color}40`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 16, fontFamily: T.font,
                                    boxShadow: `0 0 16px ${event.color}25`,
                                    transition: 'all 0.25s',
                                },
                            }, event.icon)
                        ),

                        /* Content */
                        React.createElement('div', {
                            onMouseEnter: function () { setHov(true); },
                            onMouseLeave: function () { setHov(false); },
                            style: {
                                flex: 1, paddingBottom: 8,
                                background: hov ? T.bgCardHov : 'transparent',
                                border: `1px solid ${hov ? event.color + '30' : 'transparent'}`,
                                borderRadius: 14,
                                padding: '16px 20px',
                                transition: 'all 0.25s ' + T.ease,
                            },
                        },
                            /* Year tag */
                            React.createElement('div', {
                                style: { fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', color: event.color, marginBottom: 6, fontFamily: T.font },
                            }, event.year),

                            /* Title */
                            React.createElement('h3', {
                                style: { fontSize: '1.0625rem', fontWeight: 700, marginBottom: 8, fontFamily: T.font },
                            }, event.title),

                            /* Description */
                            React.createElement('p', {
                                style: { color: T.txt2, fontSize: '0.9rem', lineHeight: 1.75 },
                            }, event.desc)
                        )
                    );
                })
            )
        )
    );
}

/* ═════════════════════════════════════════
   6. VALUES
═════════════════════════════════════════ */
const VALUES = [
    { icon: '🔭', color: T.cyan, title: 'Transparency', desc: 'We publish our uptime, error rates, and queue stats publicly. No spin, no vague SLAs.' },
    { icon: '🚀', color: T.purple, title: 'Ship Fast, Fix Fast', desc: 'We deploy multiple times per day. When something breaks, we own it and fix it — publicly.' },
    { icon: '🤝', color: T.green, title: 'Customer Obsession', desc: 'Every feature we build starts with a real customer problem. We answer support tickets ourselves.' },
    { icon: '♾️', color: T.amber, title: 'Infinite Scalability', desc: 'Architecture decisions are made with 100× growth in mind. We never want to limit your scale.' },
    { icon: '🌱', color: T.blue, title: 'Long-Term Thinking', desc: 'We optimise for trust and retention, not short-term conversion hacks or dark patterns.' },
    { icon: '🔐', color: T.pink, title: 'Security by Default', desc: 'Zero customer data is ever sold. We exceed GDPR requirements and are working toward SOC2 Type II.' },
];

function Values() {
    return React.createElement(Sec, { wide: true },
        React.createElement(SectionHeader, {
            badge: 'Our Values', badgeColor: 'blue',
            title: React.createElement(React.Fragment, null, 'The Principles That', React.createElement('br'), React.createElement(GradText, null, 'Guide Every Decision')),
            mb: 60,
        }),
        React.createElement('div', {
            style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 },
        },
            VALUES.map(function (v) {
                const [hov, setHov] = useState(false);
                return React.createElement('div', {
                    key: v.title,
                    onMouseEnter: function () { setHov(true); },
                    onMouseLeave: function () { setHov(false); },
                    style: {
                        padding: '28px 24px',
                        background: hov ? T.bgCardHov : T.bgCard,
                        border: `1px solid ${hov ? v.color + '35' : T.border}`,
                        borderRadius: 18,
                        transition: 'all 0.28s ' + T.ease,
                        transform: hov ? 'translateY(-4px)' : 'none',
                        boxShadow: hov ? `0 20px 44px rgba(0,0,0,0.42), 0 0 0 1px ${v.color}18` : 'none',
                        position: 'relative', overflow: 'hidden',
                    },
                },
                    /* Top accent */
                    React.createElement('div', { style: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: hov ? v.color : 'transparent', borderRadius: '18px 18px 0 0', transition: 'all 0.28s' } }),

                    React.createElement('div', {
                        style: { width: 50, height: 50, borderRadius: 14, background: `${v.color}12`, border: `1px solid ${v.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16, boxShadow: hov ? `0 0 20px ${v.color}30` : 'none', transition: 'box-shadow 0.28s' },
                    }, v.icon),
                    React.createElement('h3', { style: { fontSize: '1rem', fontWeight: 700, marginBottom: 10, fontFamily: T.font } }, v.title),
                    React.createElement('p', { style: { fontSize: '0.875rem', color: T.txt2, lineHeight: 1.72 } }, v.desc)
                );
            })
        )
    );
}

/* ═════════════════════════════════════════
   7. PRESS / LOGOS
═════════════════════════════════════════ */
const PRESS = [
    { name: 'TechCrunch', quote: '"The fastest URL indexing tool we\'ve tested — period."' },
    { name: 'Search Engine Land', quote: '"Speedy Indexer is changing how agencies approach bulk indexing."' },
    { name: 'Moz Blog', quote: '"A genuinely useful tool that fills a real gap in the SEO stack."' },
    { name: 'Ahrefs Digest', quote: '"Impressive throughput. The AI scoring is surprisingly accurate."' },
];

function Press() {
    return React.createElement(Sec, { slim: true, style: { background: 'rgba(255,255,255,0.012)', borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` } },
        React.createElement('div', { style: { textAlign: 'center', marginBottom: 40 } },
            React.createElement('p', { style: { fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', color: T.txt2, textTransform: 'uppercase', fontFamily: T.font } }, 'Featured In')
        ),
        React.createElement('div', {
            style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 },
        },
            PRESS.map(function (p) {
                return React.createElement('div', {
                    key: p.name,
                    style: { padding: '22px 20px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, textAlign: 'center' },
                },
                    React.createElement('div', { style: { fontSize: '0.9rem', fontWeight: 800, color: T.txt0, marginBottom: 10, fontFamily: T.font } }, p.name),
                    React.createElement('p', { style: { fontSize: '0.8125rem', color: T.txt2, lineHeight: 1.6, fontStyle: 'italic' } }, p.quote)
                );
            })
        )
    );
}

/* ═════════════════════════════════════════
   8. CONTACT / CTA FOOTER
═════════════════════════════════════════ */
function ContactCTA() {
    return React.createElement(Sec, null,
        React.createElement('div', {
            style: {
                padding: '64px 56px', textAlign: 'center',
                background: 'linear-gradient(135deg,rgba(0,212,255,0.06) 0%,rgba(139,92,246,0.06) 100%)',
                border: '1px solid rgba(0,212,255,0.18)',
                borderRadius: 28, position: 'relative', overflow: 'hidden',
            },
        },
            /* Top shimmer */
            React.createElement('div', { style: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(0,212,255,0.65),transparent)' } }),

            /* Orbs */
            React.createElement('div', { style: { position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(0,212,255,0.05)', filter: 'blur(60px)', top: -120, right: -60, pointerEvents: 'none' } }),
            React.createElement('div', { style: { position: 'absolute', width: 260, height: 260, borderRadius: '50%', background: 'rgba(139,92,246,0.05)', filter: 'blur(60px)', bottom: -80, left: -40, pointerEvents: 'none' } }),

            React.createElement('div', { style: { position: 'relative' } },
                React.createElement('h2', {
                    style: { fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 16, fontFamily: T.font },
                },
                    'Ready to Index ', React.createElement(GradText, null, '10× Faster?')
                ),
                React.createElement('p', {
                    style: { color: T.txt1, fontSize: '1.0625rem', maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.75, fontFamily: T.font },
                }, 'Join 8,700+ SEO professionals who trust Speedy Indexer for bulk URL indexing at scale.'),

                /* Buttons */
                React.createElement('div', { style: { display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 32 } },
                    React.createElement(Link, {
                        href: '/signup',
                        style: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 30px', borderRadius: 12, fontSize: '0.9375rem', fontWeight: 700, fontFamily: T.font, color: '#fff', background: grad, boxShadow: '0 4px 24px rgba(0,212,255,0.32)', textDecoration: 'none' },
                    }, '⚡ Buy Credits — Credits Never Expire'),
                    React.createElement(Link, {
                        href: '/contact',
                        style: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 26px', borderRadius: 12, fontSize: '0.9375rem', fontWeight: 600, fontFamily: T.font, color: T.txt1, border: `1px solid ${T.border}`, textDecoration: 'none' },
                    }, 'Talk to Sales')
                ),

                /* Trust badges */
                React.createElement('div', { style: { display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 24 } },
                    ['🔒 SOC2 Compliant', '🌍 99.97% Uptime', '⚡ Sub-4hr Indexing', '💳 Cancel Anytime'].map(function (badge) {
                        return React.createElement('span', {
                            key: badge, style: { fontSize: '0.8125rem', color: T.txt2, fontFamily: T.font },
                        }, badge);
                    })
                )
            )
        )
    );
}

/* ═════════════════════════════════════════
   FOOTER (mini)
═════════════════════════════════════════ */
function Footer() {
    return React.createElement('footer', {
        style: { borderTop: `1px solid ${T.border}`, padding: '40px 24px' },
    },
        React.createElement('div', { style: { maxWidth: 1080, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
                /* Mini logo */
                React.createElement('div', {
                    style: { width: 28, height: 28, borderRadius: 8, background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, boxShadow: '0 2px 10px rgba(0,212,255,0.3)' },
                }, '⚡'),
                React.createElement('span', { style: { fontWeight: 800, fontSize: 15, fontFamily: T.font } },
                    React.createElement('span', { style: { background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } }, 'Index'),
                    React.createElement('span', { style: { color: T.txt0 } }, 'Flow'),
                    React.createElement('span', { style: { color: T.txt2, fontWeight: 400, fontSize: 12 } }, ' AI')
                )
            ),
            React.createElement('p', { style: { fontSize: '0.8125rem', color: T.txt2, fontFamily: T.font } }, '© 2025 Speedy Indexer · Built for SEO professionals worldwide'),
            React.createElement('div', { style: { display: 'flex', gap: 4 } },
                [['Features', '/features'], ['Pricing', '/pricing'], ['Blog', '/blog'], ['Contact', '/contact']].map(function ([label, href]) {
                    return React.createElement(Link, {
                        key: href, href,
                        style: { padding: '5px 10px', fontSize: '0.8125rem', color: T.txt2, fontFamily: T.font, textDecoration: 'none', borderRadius: 7, transition: 'color 0.15s' },
                        onMouseEnter: function (e) { e.currentTarget.style.color = T.txt0; },
                        onMouseLeave: function (e) { e.currentTarget.style.color = T.txt2; },
                    }, label);
                })
            )
        )
    );
}

/* ═════════════════════════════════════════
   PAGE EXPORT
═════════════════════════════════════════ */
export default function AboutPage() {
    return React.createElement('div', { style: { background: T.bg, minHeight: '100vh' } },
        React.createElement('style', null, KEYFRAMES),
        React.createElement(Navbar),
        React.createElement(Hero),
        React.createElement(StatsBar),
        React.createElement(Mission),
        React.createElement(Team),
        React.createElement(Timeline),
        React.createElement(Values),
        React.createElement(Press),
        React.createElement(ContactCTA),
        React.createElement(Footer)
    );
}
