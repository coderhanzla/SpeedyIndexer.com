'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Navbar from './Navbar'

const TRUST_ITEMS = [
    '✓ 1 Credit = 1 URL',
    '✓ Credits never expire',
    '✓ Manual credit activation',
]

const DASHBOARD_LOGS = [
    { t: '14:03:22', url: 'https://blog.io/post/nextjs-15', status: 'indexed', method: 'Google API' },
    { t: '14:03:19', url: 'https://store.com/products/widget-v2', status: 'indexed', method: 'IndexNow' },
    { t: '14:03:16', url: 'https://agency.co/services', status: 'pending', method: 'Sitemap' },
    { t: '14:03:12', url: 'https://docs.saas.io/api/v2', status: 'indexed', method: 'Google API' },
    { t: '14:03:08', url: 'https://portfolio.dev/works', status: 'failed', method: 'Google API' },
]

const DASHBOARD_LOG_UPDATES = [
    { t: '14:03:25', url: 'https://mysite.io/blog/post-184', status: 'indexed', method: 'Google API' },
    { t: '14:03:28', url: 'https://ecom.store/product-427', status: 'indexed', method: 'IndexNow' },
    { t: '14:03:31', url: 'https://news.dev/article-092', status: 'pending', method: 'Sitemap Ping' },
    { t: '14:03:34', url: 'https://app.saas/features-618', status: 'indexed', method: 'RSS Signal' },
    { t: '14:03:37', url: 'https://mysite.io/blog/post-731', status: 'failed', method: 'Google API' },
]

/* ══════════════════════════════════════════════════════════
   ANIMATED COUNTER
══════════════════════════════════════════════════════════ */
function AnimatedCounter({ target, suffix = '', duration = 2000, decimals = 0 }) {
    const [value, setValue] = useState(0)
    const ref = useRef(null)
    const once = useRef(false)

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !once.current) {
                once.current = true
                const start = performance.now()
                const tick = (now) => {
                    const progress = Math.min((now - start) / duration, 1)
                    const ease = 1 - Math.pow(1 - progress, 4)
                    setValue(+(ease * target).toFixed(decimals))
                    if (progress < 1) requestAnimationFrame(tick)
                }
                requestAnimationFrame(tick)
            }
        }, { threshold: 0.4 })
        if (ref.current) observer.observe(ref.current)
        return () => observer.disconnect()
    }, [target, duration, decimals])

    return (
        <span ref={ref}>
            {typeof target === 'number' && target >= 1000
                ? Math.round(value).toString()
                : value.toFixed(decimals)}
            {suffix}
        </span>
    )
}

/* ══════════════════════════════════════════════════════════
   LIVE TICKER
══════════════════════════════════════════════════════════ */
function LiveTicker() {
    const items = [
        'techcrunch.com/ai-weekly', 'vercel.com/blog/next-15',
        'shopify.dev/changelog', 'developer.chrome.com/docs',
        'web.dev/performance', 'moz.com/blog/seo-2025',
        'ahrefs.com/blog/backlinks', 'semrush.com/analytics',
        'searchengineland.com/core', 'backlinko.com/link-building',
        'neilpatel.com/blog/seo', 'hubspot.com/marketing',
    ]
    const doubled = [...items, ...items]

    return (
        <div style={{
            padding: '10px 0',
            background: 'rgba(0,212,255,0.03)',
            borderTop: '1px solid rgba(0,212,255,0.08)',
            borderBottom: '1px solid rgba(0,212,255,0.08)',
            overflow: 'hidden',
        }}>
            <div className="ticker-inner">
                {doubled.map((url, i) => (
                    <span key={i} style={{
                        display: 'inline-flex', alignItems: 'center',
                        gap: 8, fontSize: '0.75rem',
                        color: 'var(--txt-muted)', whiteSpace: 'nowrap',
                    }}>
                        <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: '0.625rem' }}>
                            ✓ INDEXED
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>{url}</span>
                    </span>
                ))}
            </div>
        </div>
    )
}

/* ══════════════════════════════════════════════════════════
   HERO
══════════════════════════════════════════════════════════ */
function Hero() {
    return (
        <section style={{
            minHeight: '92vh',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', padding: '80px 24px 60px',
            position: 'relative', overflow: 'hidden',
        }}>
            <div style={{ position: 'absolute', inset: 0 }} className="bg-dots" />
            <div style={{ position: 'absolute', inset: 0, background: 'var(--grad-glow-top)' }} />
            <div className="orb orb-cyan" style={{ width: 600, height: 600, top: -200, left: '50%', transform: 'translateX(-50%)', animation: 'float 8s ease-in-out infinite' }} />
            <div className="orb orb-purple" style={{ width: 400, height: 400, bottom: -100, right: '10%', animation: 'float 10s ease-in-out infinite 2s' }} />

            <div style={{ position: 'relative', maxWidth: 900, width: '100%' }}>

                {/* Eyebrow */}
                <div className="anim-fade-up" style={{ marginBottom: 28 }}>
                    <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>
                        <span className="status-dot dot-cyan live" style={{ width: 6, height: 6 }} />
                        Processing 50,000+ URLs per day — globally
                    </span>
                </div>

                {/* H1 */}
                <h1 className="anim-fade-up delay-1" style={{
                    fontSize: 'clamp(2.8rem, 6vw, 5.2rem)',
                    fontWeight: 900, lineHeight: 1.03, letterSpacing: '-0.045em',
                    marginBottom: 24, opacity: 0, animationFillMode: 'forwards',
                }}>
                    Get Your URLs{' '}
                    <span className="grad-text">Indexed Faster</span>
                    <br />Than Ever Before
                </h1>

                {/* Sub */}
                <p className="anim-fade-up delay-2" style={{
                    fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                    color: 'var(--txt-secondary)', maxWidth: 620,
                    margin: '0 auto 40px', lineHeight: 1.75,
                    opacity: 0, animationFillMode: 'forwards',
                }}>
                    Enterprise-grade URL indexing via Google Indexing API, IndexNow,
                    Sitemap Pings & RSS Signals — all from one powerful dashboard.
                    Built for SEO professionals, agencies, and enterprise teams.
                </p>

                {/* CTAs */}
                <div className="anim-fade-up delay-3" style={{
                    display: 'flex', justifyContent: 'center',
                    gap: 14, flexWrap: 'wrap', marginBottom: 60,
                    opacity: 0, animationFillMode: 'forwards',
                }}>
                    <Link href="/signup" className="btn btn-primary btn-xl">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                        Start
                    </Link>
                    <Link href="/pricing" className="btn btn-outline btn-xl">
                        View Pricing
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </Link>
                </div>

                {/* Stats */}
                <div className="anim-fade-up delay-4" style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 2, maxWidth: 640, margin: '0 auto',
                    opacity: 0, animationFillMode: 'forwards',
                }}>
                    {[
                        { value: 48230000, suffix: '+', label: 'URLs Indexed', color: 'var(--cyan)' },
                        { value: 12400, suffix: '+', label: 'Active Sites', color: 'var(--purple)' },
                        { value: 8700, suffix: '+', label: 'Happy Users', color: 'var(--green)' },
                    ].map(({ value, suffix, label, color }) => (
                        <div key={label} style={{
                            padding: '20px', background: 'var(--bg-card)',
                            border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', textAlign: 'center',
                        }}>
                            <div style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 900, letterSpacing: '-0.04em', color, fontFamily: 'var(--font-display)' }}>
                                <AnimatedCounter target={value} suffix={suffix} duration={2200} />
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--txt-muted)', marginTop: 4 }}>{label}</div>
                        </div>
                    ))}
                </div>

                {/* Trust micro-copy */}
                <div className="anim-fade-up delay-5" style={{
                    marginTop: 28, display: 'flex', justifyContent: 'center',
                    gap: 24, flexWrap: 'wrap', opacity: 0, animationFillMode: 'forwards',
                }}>
                    {TRUST_ITEMS.map((txt) => (
                        <span key={txt} style={{ fontSize: '0.8125rem', color: 'var(--txt-muted)' }}>
                            {txt}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    )
}

/* ══════════════════════════════════════════════════════════
   BRAND STRIP
══════════════════════════════════════════════════════════ */
function BrandStrip() {
    const brands = [
        { name: 'Shopify', emoji: '🛒' }, { name: 'WordPress', emoji: '📝' },
        { name: 'Webflow', emoji: '🌊' }, { name: 'HubSpot', emoji: '🧡' },
        { name: 'Ahrefs', emoji: '📈' }, { name: 'Semrush', emoji: '🔍' },
        { name: 'Moz', emoji: '🟣' }, { name: 'Wix', emoji: '🎨' },
    ]

    return (
        <div style={{ padding: '40px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
            <div className="container">
                <p style={{ textAlign: 'center', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--txt-muted)', textTransform: 'uppercase', marginBottom: 28 }}>
                    Trusted by teams at
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
                    {brands.map(b => (
                        <div key={b.name} style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.5, transition: 'opacity 0.2s', cursor: 'default' }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
                        >
                            <span style={{ fontSize: 20 }}>{b.emoji}</span>
                            <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--txt-secondary)', fontFamily: 'var(--font-display)' }}>{b.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

/* ══════════════════════════════════════════════════════════
   FEATURE CARD
══════════════════════════════════════════════════════════ */
function FeatureCard({ icon, title, description, color, delay = 0, points = [] }) {
    const [hovered, setHovered] = useState(false)

    return (
        <div className="anim-fade-up" style={{ animationDelay: `${delay}ms`, opacity: 0, animationFillMode: 'forwards' }}
            onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            <div style={{
                padding: '28px',
                background: hovered ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                border: `1px solid ${hovered ? `${color}30` : 'var(--border)'}`,
                borderRadius: 'var(--r-xl)', height: '100%',
                transition: 'all 0.3s var(--ease)',
                transform: hovered ? 'translateY(-4px)' : 'none',
                boxShadow: hovered ? `0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px ${color}20` : 'none',
                position: 'relative', overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                    background: hovered ? `linear-gradient(90deg, transparent, ${color}60, transparent)` : 'transparent',
                    transition: 'all 0.3s var(--ease)',
                }} />

                <div style={{
                    width: 50, height: 50, borderRadius: 14,
                    background: `${color}12`, border: `1px solid ${color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 18, fontSize: 24,
                    transition: 'all 0.3s var(--ease)',
                    boxShadow: hovered ? `0 0 24px ${color}35` : 'none',
                }}>
                    {icon}
                </div>

                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: 10, letterSpacing: '-0.02em', color: 'var(--txt-primary)' }}>
                    {title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--txt-secondary)', lineHeight: 1.7, marginBottom: points.length ? 16 : 0 }}>
                    {description}
                </p>

                {points.length > 0 && (
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {points.map(pt => (
                            <li key={pt} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: 'var(--txt-secondary)' }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                {pt}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

/* ══════════════════════════════════════════════════════════
   FEATURES SECTION
══════════════════════════════════════════════════════════ */
function Features() {
    const features = [
        {
            icon: '🔵', color: '#3b82f6', title: 'Google Indexing API',
            description: 'Direct integration with Google\'s official Indexing API for instant crawl signals and rapid URL discovery.',
            points: ['Multi-account rotation', 'Auto quota management', 'Request batching & retry'],
        },
        {
            icon: '⚡', color: '#00d4ff', title: 'IndexNow Protocol',
            description: 'Notify Bing, Yandex, and all IndexNow-compatible engines simultaneously with one submission.',
            points: ['Sub-second delivery', 'Bing + Yandex support', 'Bulk batch submissions'],
        },
        {
            icon: '📡', color: '#8b5cf6', title: 'Bulk URL Processing',
            description: 'Submit 50,000+ URLs via CSV, XML sitemap, or direct paste. Our queue handles any volume.',
            points: ['CSV up to 50k rows', 'XML sitemap crawl', 'Drip-feed scheduling'],
        },
        {
            icon: '🤖', color: '#10b981', title: 'AI SEO Assistant',
            description: 'Every URL gets crawlability scoring, duplicate detection, and actionable recommendations.',
            points: ['Crawlability score', 'Duplicate detection', 'Canonical analysis'],
        },
        {
            icon: '📊', color: '#f59e0b', title: 'Real-Time Analytics',
            description: 'Live dashboards with queue depth, success rates, and 90-day trend analysis via Socket.io.',
            points: ['Socket.io live updates', 'Success rate charts', 'API usage graphs'],
        },
        {
            icon: '🔗', color: '#ec4899', title: 'Public REST API',
            description: 'Full-featured API with webhooks, multi-language SDKs, and rate limiting built in.',
            points: ['Webhook integrations', 'Multi-language SDKs', 'OpenAPI spec included'],
        },
    ]

    return (
        <section style={{ padding: '100px 0' }}>
            <div className="container">
                <div style={{ textAlign: 'center', maxWidth: 660, margin: '0 auto 64px' }}>
                    <span className="badge badge-purple" style={{ marginBottom: 16, display: 'inline-flex' }}>Platform Features</span>
                    <h2 style={{ marginBottom: 16 }}>
                        Everything You Need to{' '}
                        <span className="grad-text">Dominate Indexing</span>
                    </h2>
                    <p style={{ fontSize: '1.0625rem' }}>
                        Built for SEO professionals, growth teams, and enterprise agencies who demand reliable, high-volume URL indexing at speed.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                    {features.map((f, i) => <FeatureCard key={f.title} {...f} delay={i * 60} />)}
                </div>

                <div style={{ textAlign: 'center', marginTop: 44 }}>
                    <Link href="/features" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.9375rem', color: 'var(--cyan)', fontWeight: 600, textDecoration: 'none' }}>
                        Explore all features →
                    </Link>
                </div>
            </div>
        </section>
    )
}

/* ══════════════════════════════════════════════════════════
   HOW IT WORKS
══════════════════════════════════════════════════════════ */
function HowItWorks() {
    const steps = [
        { num: '01', color: '#00d4ff', title: 'Submit Your URLs', desc: 'Paste URLs, upload a CSV, point us at a sitemap, or call our REST API. We accept any volume — from 1 to 50,000+ URLs per batch.' },
        { num: '02', color: '#8b5cf6', title: 'Queue & Process', desc: 'Our BullMQ + Redis worker cluster picks up your job instantly. Parallel workers distribute indexing across Google API, IndexNow, Sitemap, and RSS.' },
        { num: '03', color: '#10b981', title: 'Watch Live Results', desc: 'The real-time dashboard updates via Socket.io as each URL processes. Track success, failures, and queue depth — all live.' },
        { num: '04', color: '#f59e0b', title: 'Analyse & Optimise', desc: 'Review 90-day trend charts, AI crawlability scores, and per-URL reports. Export everything as CSV or PDF for clients.' },
    ]

    return (
        <section style={{ padding: '100px 0', background: 'rgba(255,255,255,0.012)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
            <div className="container">
                <div style={{ textAlign: 'center', maxWidth: 580, margin: '0 auto 72px' }}>
                    <span className="badge badge-cyan" style={{ marginBottom: 16, display: 'inline-flex' }}>How It Works</span>
                    <h2 style={{ marginBottom: 14 }}>
                        From Submission to{' '}
                        <span className="grad-text">Indexed in Hours</span>
                    </h2>
                    <p>Four simple steps stand between you and a fully indexed URL.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 2 }}>
                    {steps.map(step => <StepCard key={step.num} step={step} />)}
                </div>
            </div>
        </section>
    )
}

function StepCard({ step }) {
    const [hov, setHov] = useState(false)
    return (
        <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{
                padding: '36px 28px',
                background: hov ? 'var(--bg-card-hover)' : 'transparent',
                border: `1px solid ${hov ? step.color + '30' : 'var(--border)'}`,
                borderRadius: 'var(--r-xl)',
                transition: 'all 0.28s var(--ease)',
            }}
        >
            <div style={{
                fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.05em',
                lineHeight: 1, marginBottom: 20,
                background: `linear-gradient(135deg, ${step.color}55, ${step.color}15)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text', fontFamily: 'var(--font-display)',
            }}>
                {step.num}
            </div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: 10, fontFamily: 'var(--font-display)' }}>
                {step.title}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--txt-secondary)', lineHeight: 1.75 }}>
                {step.desc}
            </p>
        </div>
    )
}

/* ══════════════════════════════════════════════════════════
   DASHBOARD PREVIEW — LIVE LOG
══════════════════════════════════════════════════════════ */
function DashboardPreview() {
    const [mounted, setMounted] = useState(false)
    const [logs, setLogs] = useState(DASHBOARD_LOGS)
    const updateIndex = useRef(0)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted) return undefined
        const iv = setInterval(() => {
            const nextLog = DASHBOARD_LOG_UPDATES[updateIndex.current % DASHBOARD_LOG_UPDATES.length]
            updateIndex.current += 1
            setLogs(prev => [nextLog, ...prev.slice(0, 8)])
        }, 2200)
        return () => clearInterval(iv)
    }, [mounted])

    const sc = { indexed: '#10b981', pending: '#f59e0b', failed: '#ef4444' }

    return (
        <section style={{ padding: '100px 0' }}>
            <div className="container">
                <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 52px' }}>
                    <span className="badge badge-green" style={{ marginBottom: 16, display: 'inline-flex' }}>
                        <span className="status-dot dot-green live" style={{ width: 6, height: 6 }} />
                        Live Dashboard Preview
                    </span>
                    <h2 style={{ marginBottom: 14 }}>
                        Watch Your URLs Get{' '}
                        <span className="grad-text">Indexed in Real Time</span>
                    </h2>
                    <p>The same live feed your team will see — powered by Socket.io.</p>
                </div>

                {/* Fake browser */}
                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset' }}>
                    {/* Chrome bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                            {['#ef4444', '#f59e0b', '#10b981'].map(c => <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />)}
                        </div>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '5px 12px', fontSize: '0.75rem', color: 'var(--txt-muted)', fontFamily: 'var(--font-mono)', maxWidth: 320 }}>
                            app.speedyindexer.com/dashboard
                        </div>
                    </div>

                    {/* Stats row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                        {[['Submitted', '48,234', 'var(--cyan)'], ['Indexed', '41,870', 'var(--green)'], ['In Queue', '892', 'var(--amber)'], ['Failed', '3,124', 'var(--red)']].map(([l, v, c], i) => (
                            <div key={l} style={{ padding: '18px 20px', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
                                <div style={{ fontSize: '0.625rem', color: 'var(--txt-muted)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{l}</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: c, letterSpacing: '-0.04em', fontFamily: 'var(--font-display)' }}>{v}</div>
                            </div>
                        ))}
                    </div>

                    {/* Live log */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', fontWeight: 600 }}>
                                <span className="status-dot dot-green live" />
                                Live Indexing Feed
                            </div>
                            <span className="badge badge-green" style={{ fontSize: '0.5625rem' }}>LIVE</span>
                        </div>
                        {logs.map((log, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '9px 20px', fontSize: '0.75rem',
                                borderBottom: i < logs.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                                animation: i === 0 ? 'fadeIn 0.3s ease forwards' : 'none',
                            }}>
                                <span style={{ color: 'var(--txt-muted)', fontFamily: 'var(--font-mono)', minWidth: 62, flexShrink: 0 }}>{log.t}</span>
                                <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: sc[log.status], flexShrink: 0 }} />
                                <span style={{ flex: 1, color: 'var(--txt-secondary)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.url}</span>
                                <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: '0.5625rem', fontWeight: 700, background: `${sc[log.status]}15`, color: sc[log.status], border: `1px solid ${sc[log.status]}25`, flexShrink: 0 }}>{log.status}</span>
                                <span style={{ color: 'var(--txt-muted)', minWidth: 80, textAlign: 'right', flexShrink: 0 }}>{log.method}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: 32 }}>
                    <Link href="/signup" className="btn btn-primary">Open Your Dashboard →</Link>
                </div>
            </div>
        </section>
    )
}

/* ══════════════════════════════════════════════════════════
   PRICING PREVIEW
══════════════════════════════════════════════════════════ */
function PricingPreview() {
    const plans = [
        { name: 'Starter', price: '$3', urls: '40 credits', features: ['40 URL submissions', '1 Credit = 1 URL', 'Credits never expire', 'Manual activation'], cta: 'Buy Credits', popular: false },
        { name: 'Basic', price: '$12', urls: '250 credits', features: ['250 URL submissions', 'Bulk URL submission', 'Dashboard tracking', 'Manual activation'], cta: 'Buy Credits', popular: false },
        { name: 'Pro', price: '$45', urls: '1,000 credits', features: ['1,000 URL submissions', 'Google discovery pipeline', 'Sitemap submission tracking', 'Credits never expire'], cta: 'Buy Credits', popular: true },
        { name: 'Growth', price: '$87', urls: '2,000 credits', features: ['2,000 URL submissions', 'Large batch handling', 'Search Console sitemap signals', 'Manual activation'], cta: 'Buy Credits', popular: false },
        { name: 'Agency', price: '$199', urls: '5,000 credits', features: ['5,000 URL submissions', 'Agency batch workflows', 'Dashboard status tracking', 'Credits never expire'], cta: 'Buy Credits', popular: false },
        { name: 'Enterprise', price: '$350', urls: '15,000 credits', features: ['15,000 URL submissions', 'Best bulk value', 'Manual/local payment', 'No fake indexing promises'], cta: 'Contact Admin', popular: false },
    ]

    return (
        <section style={{ padding: '100px 0', background: 'rgba(255,255,255,0.012)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
            <div className="container">
                <div style={{ textAlign: 'center', maxWidth: 540, margin: '0 auto 50px' }}>
                    <span className="badge badge-cyan" style={{ marginBottom: 16, display: 'inline-flex' }}>Pricing</span>
                    <h2 style={{ marginBottom: 14 }}>Simple, <span className="grad-text">Transparent</span> Pricing</h2>
                    <p style={{ marginBottom: 0 }}>1 Credit = 1 URL submission. Credits never expire.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, alignItems: 'start' }}>
                    {plans.map(plan => <PricingCard key={plan.name} plan={plan} />)}
                </div>

                <div style={{ textAlign: 'center', marginTop: 32 }}>
                    <Link href="/pricing" style={{ fontSize: '0.9rem', color: 'var(--cyan)', fontWeight: 600, textDecoration: 'none' }}>View full feature comparison →</Link>
                </div>
            </div>
        </section>
    )
}

function PricingCard({ plan }) {
    const [hov, setHov] = useState(false)

    return (
        <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
            padding: '26px 22px',
            background: plan.popular ? 'rgba(0,212,255,0.04)' : hov ? 'var(--bg-card-hover)' : 'var(--bg-card)',
            border: `1px solid ${plan.popular ? 'rgba(0,212,255,0.35)' : hov ? 'rgba(255,255,255,0.12)' : 'var(--border)'}`,
            borderRadius: 'var(--r-xl)', position: 'relative',
            transition: 'all 0.28s var(--ease)',
            transform: hov ? 'translateY(-3px)' : 'none',
            boxShadow: plan.popular ? '0 0 40px rgba(0,212,255,0.07)' : hov ? '0 16px 40px rgba(0,0,0,0.4)' : 'none',
            display: 'flex', flexDirection: 'column',
        }}>
            {plan.popular && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, borderRadius: '20px 20px 0 0', background: 'linear-gradient(135deg,#00d4ff,#8b5cf6)' }} />}
            {plan.popular && (
                <div style={{ marginBottom: 14 }}>
                    <span style={{ fontSize: '0.625rem', fontWeight: 800, padding: '3px 9px', borderRadius: 9999, background: 'rgba(0,212,255,0.12)', color: 'var(--cyan)', border: '1px solid rgba(0,212,255,0.22)', letterSpacing: '0.06em' }}>
                        ⭐ MOST POPULAR
                    </span>
                </div>
            )}
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--txt-secondary)', marginBottom: 8 }}>{plan.name}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: '2.6rem', fontWeight: 900, letterSpacing: '-0.05em' }}>{plan.price}</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--txt-muted)' }}> / {plan.urls}</span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--cyan)', fontFamily: 'var(--font-mono)', marginBottom: 20 }}>Credits never expire</div>
            <Link href={plan.name === 'Enterprise' ? '/contact' : '/signup'} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '10px 18px', borderRadius: 'var(--r-md)', marginBottom: 20,
                fontSize: '0.875rem', fontWeight: 700, textDecoration: 'none',
                color: plan.popular ? '#fff' : 'var(--txt-secondary)',
                background: plan.popular ? 'linear-gradient(135deg,#00d4ff,#8b5cf6)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${plan.popular ? 'transparent' : 'var(--border)'}`,
                boxShadow: plan.popular ? '0 4px 20px rgba(0,212,255,0.28)' : 'none',
            }}>{plan.cta}</Link>
            <div style={{ height: 1, background: 'var(--border)', marginBottom: 18 }} />
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
                {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: '0.8125rem', color: 'var(--txt-secondary)' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
                        {f}
                    </li>
                ))}
            </ul>
        </div>
    )
}

/* ══════════════════════════════════════════════════════════
   TESTIMONIALS
══════════════════════════════════════════════════════════ */
function Testimonials() {
    const list = [
        { quote: 'SpeedyIndexer cut our average indexing time from 3 weeks to under 6 hours. The Google API rotation alone is worth the entire credit cost.', name: 'Marcus Chen', role: 'SEO Director, TechScale Inc.', initials: 'MC', color: '#00d4ff' },
        { quote: 'We index 25,000 product pages daily across 8 client sites. The bulk CSV upload and drip-feed scheduling are exactly what a content agency needs.', name: 'Priya Sharma', role: 'Growth Lead, Ecom Labs', initials: 'PS', color: '#8b5cf6' },
        { quote: 'The real-time analytics dashboard is incredible. I can see exactly which URLs got indexed, via which method. AI recommendations are genuinely useful.', name: 'Jordan Wells', role: 'Founder, SEO Agency Pro', initials: 'JW', color: '#10b981' },
        { quote: 'Switched from a competitor and immediately saw a 40% improvement in indexing success rate. Setup took 3 minutes. I wish we\'d found this sooner.', name: 'Lena Kovač', role: 'Technical SEO, WebVelocity', initials: 'LK', color: '#f59e0b' },
        { quote: 'As an agency owner the white-label dashboard and team collaboration features are game-changing. Our clients love seeing live indexing progress.', name: 'Alex Rivera', role: 'CEO, RankBoost Agency', initials: 'AR', color: '#ec4899' },
        { quote: 'The API is incredibly well-documented. We integrated SpeedyIndexer into our CMS in under an hour. Every new page we publish gets indexed the same day.', name: 'Raj Patel', role: 'CTO, ContentEngine', initials: 'RP', color: '#3b82f6' },
    ]

    return (
        <section style={{ padding: '100px 0' }}>
            <div className="container">
                <div style={{ textAlign: 'center', maxWidth: 500, margin: '0 auto 60px' }}>
                    <span className="badge badge-purple" style={{ marginBottom: 16, display: 'inline-flex' }}>Testimonials</span>
                    <h2>Trusted by <span className="grad-text">8,700+ SEO Pros</span></h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                    {list.map(t => <TestimonialCard key={t.name} {...t} />)}
                </div>
            </div>
        </section>
    )
}

function TestimonialCard({ quote, name, role, initials, color }) {
    const [hov, setHov] = useState(false)
    return (
        <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
            padding: '28px',
            background: hov ? 'var(--bg-card-hover)' : 'var(--bg-card)',
            border: `1px solid ${hov ? 'rgba(255,255,255,0.12)' : 'var(--border)'}`,
            borderRadius: 'var(--r-xl)', display: 'flex', flexDirection: 'column', gap: 20,
            transition: 'all 0.28s var(--ease)',
            transform: hov ? 'translateY(-3px)' : 'none',
            boxShadow: hov ? '0 16px 40px rgba(0,0,0,0.4)' : 'none',
        }}>
            <div style={{ display: 'flex', gap: 3 }}>
                {[...Array(5)].map((_, i) => <span key={i} style={{ color: '#f59e0b', fontSize: 15 }}>★</span>)}
            </div>
            <p style={{ fontSize: '0.9375rem', color: 'var(--txt-secondary)', lineHeight: 1.75, fontStyle: 'italic', flex: 1 }}>"{quote}"</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color }}>
                    {initials}
                </div>
                <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--txt-primary)' }}>{name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>{role}</div>
                </div>
            </div>
        </div>
    )
}

/* ══════════════════════════════════════════════════════════
   INTEGRATIONS
══════════════════════════════════════════════════════════ */
function Integrations() {
    const list = [
        { name: 'Google Search Console', emoji: '🔵', color: '#4285f4' },
        { name: 'WordPress', emoji: '📝', color: '#21759b' },
        { name: 'Chrome Extension', emoji: '🟡', color: '#f59e0b' },
        { name: 'Zapier', emoji: '🔶', color: '#ff4a00' },
        { name: 'Slack', emoji: '💬', color: '#4a154b' },
        { name: 'Telegram Bot', emoji: '✈️', color: '#2ca5e0' },
        { name: 'Webhooks', emoji: '🔗', color: '#10b981' },
        { name: 'REST API', emoji: '⚡', color: '#00d4ff' },
        { name: 'Ahrefs', emoji: '📈', color: '#ef4444' },
        { name: 'Semrush', emoji: '🔍', color: '#ff642d' },
    ]

    return (
        <section style={{ padding: '100px 0', background: 'rgba(255,255,255,0.012)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
            <div className="container">
                <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 56px' }}>
                    <span className="badge badge-amber" style={{ marginBottom: 16, display: 'inline-flex' }}>Integrations</span>
                    <h2 style={{ marginBottom: 14 }}>Works With Your <span className="grad-text">Entire Stack</span></h2>
                    <p>Native integrations with the tools your team already uses.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: 12, maxWidth: 900, margin: '0 auto' }}>
                    {list.map(int => <IntegrationCard key={int.name} {...int} />)}
                </div>
            </div>
        </section>
    )
}

function IntegrationCard({ name, emoji, color }) {
    const [hov, setHov] = useState(false)
    return (
        <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
            padding: '20px 16px', textAlign: 'center',
            background: hov ? 'var(--bg-card-hover)' : 'var(--bg-card)',
            border: `1px solid ${hov ? color + '35' : 'var(--border)'}`,
            borderRadius: 'var(--r-lg)', cursor: 'default',
            transition: 'all 0.25s var(--ease)',
            transform: hov ? 'translateY(-3px)' : 'none',
            boxShadow: hov ? `0 12px 28px rgba(0,0,0,0.4),0 0 0 1px ${color}18` : 'none',
        }}>
            <div style={{ fontSize: 28, marginBottom: 10, filter: hov ? `drop-shadow(0 0 10px ${color}60)` : 'none', transition: 'filter 0.25s' }}>{emoji}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: hov ? 'var(--txt-primary)' : 'var(--txt-secondary)', transition: 'color 0.2s' }}>{name}</div>
        </div>
    )
}

/* ══════════════════════════════════════════════════════════
   BLOG PREVIEW
══════════════════════════════════════════════════════════ */
const BLOG_POSTS = [
    { emoji: '🔵', category: 'Tutorial', color: '#00d4ff', title: 'The Complete Guide to Google Indexing API in 2025', excerpt: 'Setup, multi-account rotation, quota management, and indexing 5,000+ URLs per day.', date: 'May 12', readTime: '9 min', slug: '/blog' },
    { emoji: '⚡', category: 'Comparison', color: '#8b5cf6', title: 'IndexNow vs Google API: Which Is Faster in 2025?', excerpt: 'We tested both protocols on 10,000 URLs. The results will change your indexing strategy.', date: 'May 8', readTime: '7 min', slug: '/blog' },
    { emoji: '🤖', category: 'AI & ML', color: '#f59e0b', title: 'How AI is Changing SEO Crawlability Analysis', excerpt: 'ML models that predict indexability before you even submit a URL.', date: 'Apr 28', readTime: '8 min', slug: '/blog' },
]

function BlogPreview() {
    return (
        <section style={{ padding: '100px 0' }}>
            <div className="container">
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 52 }}>
                    <div>
                        <span className="badge badge-blue" style={{ marginBottom: 14, display: 'inline-flex' }}>Blog & Resources</span>
                        <h2 style={{ margin: 0 }}>Latest from the <span className="grad-text">SpeedyIndexer Blog</span></h2>
                    </div>
                    <Link href="/blog" style={{ fontSize: '0.9rem', color: 'var(--cyan)', fontWeight: 600, textDecoration: 'none' }}>View all articles →</Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 16 }}>
                    {BLOG_POSTS.map(post => <BlogCard key={post.title} post={post} />)}
                </div>
            </div>
        </section>
    )
}

function BlogCard({ post }) {
    const [hov, setHov] = useState(false)
    return (
        <Link href={post.slug} style={{ textDecoration: 'none' }}>
            <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
                padding: '24px',
                background: hov ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                border: `1px solid ${hov ? 'rgba(255,255,255,0.12)' : 'var(--border)'}`,
                borderRadius: 'var(--r-xl)', height: '100%',
                transition: 'all 0.25s var(--ease)',
                transform: hov ? 'translateY(-3px)' : 'none',
                boxShadow: hov ? '0 14px 36px rgba(0,0,0,0.4)' : 'none',
                display: 'flex', flexDirection: 'column', gap: 14, cursor: 'pointer',
            }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${post.color}12`, border: `1px solid ${post.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: hov ? `0 0 16px ${post.color}30` : 'none', transition: 'box-shadow 0.25s' }}>{post.emoji}</div>
                <span style={{ display: 'inline-flex', padding: '3px 9px', borderRadius: 9999, fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.06em', background: `${post.color}12`, color: post.color, border: `1px solid ${post.color}22`, width: 'fit-content' }}>{post.category}</span>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.35, letterSpacing: '-0.02em', color: 'var(--txt-primary)', flex: 1, margin: 0 }}>{post.title}</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--txt-muted)', lineHeight: 1.65, margin: 0 }}>{post.excerpt}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--txt-muted)', borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                    <span>{post.date}</span><span>{post.readTime} read</span>
                </div>
            </div>
        </Link>
    )
}

/* ══════════════════════════════════════════════════════════
   FAQ
══════════════════════════════════════════════════════════ */
const FAQS = [
    { q: 'How fast does Google actually index submitted URLs?', a: 'Google Indexing API submissions typically trigger a crawl within 1–48 hours, compared to 1–6 weeks for organic discovery. Results vary by domain authority and crawl budget.' },
    { q: 'What is IndexNow and why should I use it?', a: 'IndexNow is an open protocol allowing you to notify Bing, Yandex, and all participating engines simultaneously with a single API call — instant crawl signal, no separate accounts needed.' },
    { q: 'Can I upload a sitemap to submit all URLs at once?', a: 'Yes. Paste your sitemap.xml URL and we\'ll crawl it, extract every URL, and queue them all. Supports nested sitemaps and sitemap indexes up to 500,000 URLs.' },
    { q: 'What is drip-feed scheduling?', a: 'Drip-feed lets you spread submissions over time (e.g. 200 URLs/hour) to appear natural to search engines, avoid quota spikes, and stay within daily rate limits on large batches.' },
    { q: 'How do SpeedyIndexer credits work?', a: 'SpeedyIndexer uses credit packs. Packs start at $3 for 40 credits, 1 Credit = 1 accepted URL submission, and credits never expire.' },
    { q: 'How does multi-account Google API rotation work?', a: 'Each Google Cloud project is limited to 200 submissions/day. You can add multiple service account JSON files, and SpeedyIndexer automatically rotates requests across them to maximise daily throughput.' },
    { q: 'Can I use SpeedyIndexer via API in my own application?', a: 'Yes. Every plan includes REST API access. Higher-volume credit packs support larger workflows, webhook support, and access to all endpoints. Full SDK documentation is available.' },
    { q: 'What happens when a URL fails to index?', a: 'Failed URLs are logged with an error code and automatically added to a retry queue. You can also manually retry individual URLs or entire batches from the History page.' },
]

function FAQ() {
    const [open, setOpen] = useState(null)
    return (
        <section style={{ padding: '100px 0', background: 'rgba(255,255,255,0.012)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
            <div className="container" style={{ maxWidth: 760 }}>
                <div style={{ textAlign: 'center', marginBottom: 56 }}>
                    <span className="badge badge-cyan" style={{ marginBottom: 16, display: 'inline-flex' }}>FAQ</span>
                    <h2>Common Questions</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {FAQS.map((f, i) => (
                        <div key={i} style={{ background: 'var(--bg-card)', border: `1px solid ${open === i ? 'rgba(0,212,255,0.25)' : 'var(--border)'}`, borderRadius: 'var(--r-lg)', overflow: 'hidden', transition: 'border-color 0.2s' }}>
                            <button onClick={() => setOpen(open === i ? null : i)} style={{ width: '100%', padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-display)' }}>
                                <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--txt-primary)' }}>{f.q}</span>
                                <span style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: open === i ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={open === i ? 'var(--cyan)' : 'var(--txt-muted)'} strokeWidth="2.5" strokeLinecap="round" style={{ transition: 'transform 0.2s', transform: open === i ? 'rotate(45deg)' : 'none' }}>
                                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                </span>
                            </button>
                            {open === i && (
                                <div style={{ padding: '0 22px 20px' }}>
                                    <p style={{ fontSize: '0.9375rem', color: 'var(--txt-secondary)', lineHeight: 1.8 }}>{f.a}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

/* ══════════════════════════════════════════════════════════
   CTA BANNER
══════════════════════════════════════════════════════════ */
function CTABanner() {
    return (
        <section style={{ padding: '80px 0 120px' }}>
            <div className="container" style={{ maxWidth: 800 }}>
                <div style={{
                    padding: '64px 56px', textAlign: 'center',
                    background: 'linear-gradient(135deg,rgba(0,212,255,0.07) 0%,rgba(139,92,246,0.07) 100%)',
                    border: '1px solid rgba(0,212,255,0.18)',
                    borderRadius: 'var(--r-xl)', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 0 60px rgba(0,212,255,0.06)',
                }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(0,212,255,0.6),transparent)' }} />
                    <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', background: 'rgba(0,212,255,0.05)', filter: 'blur(60px)', top: -100, right: -60, pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', width: 240, height: 240, borderRadius: '50%', background: 'rgba(139,92,246,0.06)', filter: 'blur(60px)', bottom: -80, left: -40, pointerEvents: 'none' }} />

                    <div style={{ position: 'relative' }}>
                        <span className="badge badge-cyan" style={{ marginBottom: 22, display: 'inline-flex' }}>Start Today with Credits</span>
                        <h2 style={{ marginBottom: 18, fontSize: 'clamp(1.8rem,3.5vw,2.8rem)' }}>
                            Ready to <span className="grad-text">Accelerate</span> Your Indexing?
                        </h2>
                        <p style={{ fontSize: '1.0625rem', maxWidth: 500, margin: '0 auto 36px', color: 'var(--txt-secondary)', lineHeight: 1.75 }}>
                            Join 8,700+ SEO professionals who trust SpeedyIndexer for bulk URL indexing. Get started with flexible credit packs.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}>
                            <Link href="/signup" className="btn btn-primary btn-lg">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                                Buy Credits
                            </Link>
                            <Link href="/pricing" className="btn btn-outline btn-lg">View Full Pricing</Link>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 24 }}>
                            {['🔒 SOC2 Compliant', '🌍 99.97% Uptime', '⚡ Sub-4hr Indexing', '💳 Cancel Anytime'].map(b => (
                                <span key={b} style={{ fontSize: '0.8125rem', color: 'var(--txt-muted)' }}>{b}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

/* ══════════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════════ */
function Footer() {
    const cols = [
        { title: 'Product', links: [['Features', '/features'], ['Pricing', '/pricing'], ['API Docs', '/api-docs'], ['Changelog', '#'], ['Status', '#']] },
        { title: 'Company', links: [['About', '/about'], ['Blog', '/blog'], ['Careers', '#'], ['Contact', '/contact'], ['Press', '#']] },
        { title: 'Legal', links: [['Privacy Policy', '#'], ['Terms of Service', '#'], ['Cookie Policy', '#'], ['GDPR', '#']] },
    ]

    return (
        <footer style={{ borderTop: '1px solid var(--border)', padding: '60px 0 40px' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 52 }}>
                    <div>
                        <div style={{ marginBottom: 16 }}>
                            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.03em', fontFamily: 'var(--font-display)' }}>
                                <span style={{ color: 'var(--txt-primary)' }}>Speedy</span>
                                <span className="grad-text">Indexer</span>
                            </span>
                        </div>
                        <p style={{ fontSize: '0.875rem', lineHeight: 1.75, maxWidth: 260, marginBottom: 22 }}>
                            The enterprise SEO indexing platform. Bulk URL indexing via Google API, IndexNow, Sitemap, and RSS signals.
                        </p>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {['𝕏', '📘', '💼'].map((icon, i) => (
                                <button key={i} style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--bg-card)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--txt-muted)', transition: 'all 0.18s' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)'; e.currentTarget.style.color = 'var(--cyan)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--txt-muted)'; }}
                                >{icon}</button>
                            ))}
                        </div>
                    </div>
                    {cols.map(col => (
                        <div key={col.title}>
                            <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--txt-muted)', marginBottom: 18 }}>{col.title}</div>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 11 }}>
                                {col.links.map(([label, href]) => (
                                    <li key={label}>
                                        <Link href={href} style={{ fontSize: '0.875rem', color: 'var(--txt-secondary)', textDecoration: 'none', transition: 'color 0.15s' }}
                                            onMouseEnter={e => e.target.style.color = 'var(--txt-primary)'}
                                            onMouseLeave={e => e.target.style.color = 'var(--txt-secondary)'}
                                        >{label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <p style={{ fontSize: '0.8125rem' }}>© 2026 SpeedyIndexer. All rights reserved.</p>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>All systems operational</span>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--txt-muted)' }}>© Created by Hanbotix AI</p>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from{opacity:0} to{opacity:1} }
                @media(max-width:900px){ footer .container > div:first-of-type{grid-template-columns:1fr 1fr!important} }
                @media(max-width:600px){ footer .container > div:first-of-type{grid-template-columns:1fr!important} }
            `}</style>
        </footer>
    )
}

/* ══════════════════════════════════════════════════════════
   PAGE EXPORT
══════════════════════════════════════════════════════════ */
export default function HomePage() {
    return (
        <>
            <Navbar />
            <main>
                <Hero />
                <LiveTicker />
                <BrandStrip />
                <Features />
                <HowItWorks />
                <DashboardPreview />
                <PricingPreview />
                <Testimonials />
                <Integrations />
                <BlogPreview />
                <FAQ />
                <CTABanner />
            </main>
            <Footer />
        </>
    )
}
