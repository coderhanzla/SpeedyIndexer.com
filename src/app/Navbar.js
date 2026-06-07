'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */
const NAV_LINKS = [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'API Docs', href: '/api-docs' },
    { label: 'Blog', href: '/blog' },
    { label: 'About', href: '/about' },
];

/* ─────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────── */
const T = {
    bgBase: '#020617',
    bgSurface: 'rgba(6,14,36,0.82)',
    border: 'rgba(255,255,255,0.08)',
    cyan: '#00d4ff',
    purple: '#8b5cf6',
    green: '#10b981',
    txtPrimary: '#ffffff',
    txtSecond: '#cbd5e1',
    txtMuted: '#94a3b8',
    font: "'Inter', sans-serif",
    ease: 'cubic-bezier(0.16,1,0.3,1)',
};

const gradBrand = 'linear-gradient(135deg,#00d4ff 0%,#8b5cf6 100%)';

const baseIcon = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
};

function IconBolt() {
    return (
        <svg {...baseIcon}>
            <path
                d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                fill="white"
                stroke="none"
            />
        </svg>
    );
}

function IconMenu() {
    return (
        <svg {...baseIcon} width="20" height="20">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
    );
}

function IconClose() {
    return (
        <svg {...baseIcon} width="20" height="20">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

function IconChevronRight() {
    return (
        <svg {...baseIcon} width="12" height="12">
            <polyline points="9 18 15 12 9 6" />
        </svg>
    );
}

/* ─────────────────────────────────────────
   LOGO
───────────────────────────────────────── */
function Logo({ size = 18 }) {
    return (
        <Link
            href="/"
            className="site-logo"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                textDecoration: 'none',
            }}
        >
            <div
                style={{
                    width: size + 14,
                    height: size + 14,
                    borderRadius: 12,
                    background: gradBrand,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0,212,255,0.35)',
                    flexShrink: 0,
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                            'linear-gradient(transparent 0%,rgba(255,255,255,0.22) 50%,transparent 100%)',
                        animation: 'scanLine 2.5s linear infinite',
                    }}
                />

                <IconBolt />
            </div>

            <span
                className="site-logo-text"
                style={{
                    fontSize: size,
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                    fontFamily: T.font,
                }}
            >
                <span style={{ color: T.txtPrimary }}>Speedy</span>
                <span
                    style={{
                        background: gradBrand,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    Indexer
                </span>

                <span
                    className="site-logo-ai"
                    style={{
                        color: T.txtMuted,
                        fontWeight: 500,
                        fontSize: size * 0.72,
                        marginLeft: 3,
                    }}
                >
                    AI
                </span>
            </span>
        </Link>
    );
}

/* ─────────────────────────────────────────
   UPTIME BADGE
───────────────────────────────────────── */
function UptimeBadge() {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '5px 12px',
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: 999,
                fontSize: '0.72rem',
                fontWeight: 600,
                color: T.green,
                backdropFilter: 'blur(10px)',
            }}
        >
            <span
                style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: T.green,
                    animation: 'pulseDot 1.6s infinite',
                }}
            />
            99.97% uptime
        </div>
    );
}

/* ─────────────────────────────────────────
   MOBILE DRAWER
───────────────────────────────────────── */
function MobileDrawer({ open, onClose, pathname }) {
    const isActive = useCallback(
        (href) => pathname === href,
        [pathname]
    );

    if (!open) return null;

    return (
        <>
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.72)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 999,
                }}
            />

            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    width: 320,
                    maxWidth: '90vw',
                    height: '100vh',
                    background: '#071126',
                    borderLeft: `1px solid ${T.border}`,
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div
                    style={{
                        padding: 18,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: `1px solid ${T.border}`,
                    }}
                >
                    <Logo size={16} />

                    <button
                        onClick={onClose}
                        style={{
                            width: 38,
                            height: 38,
                            borderRadius: 10,
                            border: `1px solid ${T.border}`,
                            background: 'rgba(255,255,255,0.03)',
                            color: T.txtSecond,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <IconClose />
                    </button>
                </div>

                <div
                    style={{
                        padding: 14,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        flex: 1,
                    }}
                >
                    {NAV_LINKS.map((link) => {
                        const active = isActive(link.href);

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={onClose}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '14px 16px',
                                    borderRadius: 14,
                                    textDecoration: 'none',
                                    color: active ? '#fff' : T.txtSecond,
                                    background: active
                                        ? 'rgba(0,212,255,0.12)'
                                        : 'transparent',
                                    border: active
                                        ? '1px solid rgba(0,212,255,0.25)'
                                        : '1px solid transparent',
                                    transition: '0.2s',
                                    fontWeight: 600,
                                }}
                            >
                                {link.label}
                                <IconChevronRight />
                            </Link>
                        );
                    })}
                </div>

                <div className="mobile-drawer-auth">
                    <Link
                        href="/signin"
                        onClick={onClose}
                        className="mobile-drawer-login"
                    >
                        Log in
                    </Link>

                    <Link
                        href="/signup"
                        onClick={onClose}
                        className="mobile-drawer-cta"
                    >
                        <IconBolt />
                        Start
                    </Link>
                </div>
            </div>
        </>
    );
}

/* ─────────────────────────────────────────
   MAIN NAVBAR
───────────────────────────────────────── */
export default function Navbar() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [hovered, setHovered] = useState(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 15);
        window.addEventListener('scroll', onScroll);
        onScroll();

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        setDrawerOpen(false);
    }, [pathname]);

    useEffect(() => {
        document.body.style.overflow = drawerOpen ? 'hidden' : '';

        return () => {
            document.body.style.overflow = '';
        };
    }, [drawerOpen]);

    const isActive = useCallback(
        (href) => pathname === href,
        [pathname]
    );

    return (
        <>
            <style>{`
@keyframes scanLine {
    from { transform: translateY(-120%); }
    to { transform: translateY(250%); }
}

@keyframes pulseDot {
    0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
    70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}
`}</style>

            <header
                className="site-header"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 100,
                    height: 74,
                    transition: `all .35s ${T.ease}`,
                    backdropFilter: scrolled ? 'blur(18px)' : 'none',
                    WebkitBackdropFilter: scrolled ? 'blur(18px)' : 'none',
                    background: scrolled ? 'rgba(2,6,23,0.72)' : 'transparent',
                    borderBottom: scrolled
                        ? `1px solid ${T.border}`
                        : '1px solid transparent',
                    boxShadow: scrolled
                        ? '0 10px 40px rgba(0,0,0,0.35)'
                        : 'none',
                }}
            >
                <div
                    className="site-header-inner"
                    style={{
                        maxWidth: 1240,
                        margin: '0 auto',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 24px',
                    }}
                >
                    <Logo size={19} />

                    <nav
                        className="desktop-links"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            marginLeft: 38,
                        }}
                    >
                        {NAV_LINKS.map((link) => {
                            const active = isActive(link.href);
                            const isHovered = hovered === link.href;

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onMouseEnter={() => setHovered(link.href)}
                                    onMouseLeave={() => setHovered(null)}
                                    style={{
                                        position: 'relative',
                                        padding: '10px 16px',
                                        borderRadius: 12,
                                        fontSize: '0.92rem',
                                        fontWeight: 600,
                                        textDecoration: 'none',
                                        color:
                                            active || isHovered
                                                ? '#fff'
                                                : T.txtSecond,
                                        background: active
                                            ? 'rgba(255,255,255,0.06)'
                                            : isHovered
                                                ? 'rgba(255,255,255,0.03)'
                                                : 'transparent',
                                        transition: `all .22s ${T.ease}`,
                                        overflow: 'hidden',
                                    }}
                                >
                                    {active && (
                                        <span
                                            style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 10,
                                                right: 10,
                                                height: 2,
                                                borderRadius: 99,
                                                background: gradBrand,
                                            }}
                                        />
                                    )}

                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div style={{ flex: 1 }} />

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                        }}
                    >
                        <div className="desktop-uptime">
                            <UptimeBadge />
                        </div>

                        <Link
                            href="/signin"
                            className="desktop-auth"
                            style={{
                                color: T.txtSecond,
                                textDecoration: 'none',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                padding: '10px 14px',
                                borderRadius: 12,
                            }}
                        >
                            Log in
                        </Link>

                        <Link
                            href="/signup"
                            className="desktop-cta"
                            suppressHydrationWarning
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '11px 18px',
                                borderRadius: 14,
                                textDecoration: 'none',
                                color: '#fff',
                                fontWeight: 700,
                                background: gradBrand,
                                boxShadow: '0 10px 30px rgba(0,212,255,0.25)',
                            }}
                        >
                            <IconBolt />
                            Start
                        </Link>

                        <button
                            className="mobile-menu-btn"
                            type="button"
                            aria-label="Open menu"
                            aria-expanded={drawerOpen}
                            onClick={() => setDrawerOpen(true)}
                            style={{
                                display: 'none',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 42,
                                height: 42,
                                borderRadius: 12,
                                border: `1px solid ${T.border}`,
                                background: 'rgba(255,255,255,0.04)',
                                color: T.txtPrimary,
                                cursor: 'pointer',
                            }}
                        >
                            <IconMenu />
                        </button>
                    </div>
                </div>
            </header>

            <MobileDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                pathname={pathname}
            />

            <div className="site-header-spacer" style={{ height: 74 }} />
        </>
    );
}