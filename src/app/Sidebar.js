'use client';
// components/dashboard/Sidebar.js
// Speedy Indexer — Premium Dashboard Sidebar
// Pure JavaScript + React — collapsible, animated, with quota & user profile

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/* ─────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────── */
const T = {
    bgBase: '#020617',
    bgSurface: 'rgba(4,9,20,0.98)',
    bgCard: 'rgba(255,255,255,0.04)',
    bgHover: 'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.07)',
    cyan: '#00d4ff',
    cyanDim: 'rgba(0,212,255,0.08)',
    cyanBorder: 'rgba(0,212,255,0.18)',
    purple: '#8b5cf6',
    green: '#10b981',
    amber: '#f59e0b',
    red: '#ef4444',
    txtPrimary: '#ffffff',
    txtSecond: '#94a3b8',
    txtMuted: '#475569',
    font: "'Bricolage Grotesque','Inter',sans-serif",
    fontMono: "'DM Mono','Fira Code',monospace",
    ease: 'cubic-bezier(0.16,1,0.3,1)',
};

const gradBrand = 'linear-gradient(135deg,#00d4ff 0%,#8b5cf6 100%)';

/* ─────────────────────────────────────────
   NAV STRUCTURE
───────────────────────────────────────── */
const NAV_SECTIONS = [
    {
        section: 'WORKSPACE',
        items: [
            { label: 'Overview', href: '/dashboard', iconKey: 'overview' },
            { label: 'Submit URLs', href: '/dashboard/submit', iconKey: 'submit', badge: 'HOT' },
            { label: 'Projects', href: '/dashboard/projects', iconKey: 'projects' },
            { label: 'History', href: '/dashboard/history', iconKey: 'history' },
        ],
    },
    {
        section: 'INSIGHTS',
        items: [
            { label: 'Analytics', href: '/dashboard/analytics', iconKey: 'analytics' },
            { label: 'Reports', href: '/dashboard/reports', iconKey: 'reports' },
        ],
    },
    {
        section: 'PLATFORM',
        items: [
            { label: 'API Keys', href: '/dashboard/api-keys', iconKey: 'keys' },
            { label: 'Team', href: '/dashboard/team', iconKey: 'team' },
            { label: 'Billing', href: '/dashboard/billing', iconKey: 'billing' },
            { label: 'Settings', href: '/dashboard/settings', iconKey: 'settings' },
        ],
    },
];

/* ─────────────────────────────────────────
   SVG ICONS (React.createElement form)
───────────────────────────────────────── */
const iBase = {
    width: 16, height: 16, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor',
    strokeWidth: '1.75', strokeLinecap: 'round', strokeLinejoin: 'round',
};

function svgWrap(children) {
    return React.createElement('svg', iBase, ...children);
}

const ICONS = {
    overview: function () { return svgWrap([React.createElement('rect', { key: 'a', x: '3', y: '3', width: '7', height: '7', rx: '1' }), React.createElement('rect', { key: 'b', x: '14', y: '3', width: '7', height: '7', rx: '1' }), React.createElement('rect', { key: 'c', x: '3', y: '14', width: '7', height: '7', rx: '1' }), React.createElement('rect', { key: 'd', x: '14', y: '14', width: '7', height: '7', rx: '1' })]); },
    submit: function () { return svgWrap([React.createElement('path', { key: 'a', d: 'M12 19V5M5 12l7-7 7 7' })]); },
    projects: function () { return svgWrap([React.createElement('path', { key: 'a', d: 'M2 6a2 2 0 012-2h5l2 2h9a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6z' })]); },
    history: function () { return svgWrap([React.createElement('circle', { key: 'a', cx: '12', cy: '12', r: '10' }), React.createElement('path', { key: 'b', d: 'M12 6v6l4 2' })]); },
    analytics: function () { return svgWrap([React.createElement('polyline', { key: 'a', points: '22 12 18 12 15 21 9 3 6 12 2 12' })]); },
    reports: function () { return svgWrap([React.createElement('path', { key: 'a', d: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z' }), React.createElement('polyline', { key: 'b', points: '14 2 14 8 20 8' }), React.createElement('line', { key: 'c', x1: '16', y1: '13', x2: '8', y2: '13' }), React.createElement('line', { key: 'd', x1: '16', y1: '17', x2: '8', y2: '17' })]); },
    keys: function () { return svgWrap([React.createElement('circle', { key: 'a', cx: '7.5', cy: '15.5', r: '5.5' }), React.createElement('path', { key: 'b', d: 'M21 2l-9.6 9.6M15.5 7.5l3 3L22 7l-3-3' })]); },
    team: function () { return svgWrap([React.createElement('path', { key: 'a', d: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2' }), React.createElement('circle', { key: 'b', cx: '9', cy: '7', r: '4' }), React.createElement('path', { key: 'c', d: 'M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' })]); },
    billing: function () { return svgWrap([React.createElement('rect', { key: 'a', x: '1', y: '4', width: '22', height: '16', rx: '2' }), React.createElement('line', { key: 'b', x1: '1', y1: '10', x2: '23', y2: '10' })]); },
    settings: function () { return svgWrap([React.createElement('circle', { key: 'a', cx: '12', cy: '12', r: '3' }), React.createElement('path', { key: 'b', d: 'M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z' })]); },
    chevronL: function () { return React.createElement('svg', { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2.5', strokeLinecap: 'round' }, React.createElement('polyline', { points: '15 18 9 12 15 6' })); },
    chevronR: function () { return React.createElement('svg', { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2.5', strokeLinecap: 'round' }, React.createElement('polyline', { points: '9 18 15 12 9 6' })); },
    chevronD: function () { return React.createElement('svg', { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round' }, React.createElement('polyline', { points: '6 9 12 15 18 9' })); },
};

/* ─────────────────────────────────────────
   QUOTA WIDGET
───────────────────────────────────────── */
function QuotaWidget(props) {
    const { collapsed } = props;
    const used = 3350;
    const total = 5000;
    const pct = Math.round((used / total) * 100);

    if (collapsed) {
        // Mini version — just the percentage arc
        return React.createElement('div', {
            style: {
                margin: '0 8px 8px',
                padding: '10px 6px',
                background: T.cyanDim,
                border: `1px solid ${T.cyanBorder}`,
                borderRadius: 10,
                textAlign: 'center',
            }
        },
            React.createElement('div', {
                style: { fontSize: '0.625rem', fontWeight: 700, color: T.cyan, fontFamily: T.fontMono }
            }, `${pct}%`)
        );
    }

    return React.createElement('div', {
        style: {
            margin: '0 10px 10px',
            padding: '14px',
            background: T.cyanDim,
            border: `1px solid ${T.cyanBorder}`,
            borderRadius: 12,
        }
    },
        // Header row
        React.createElement('div', {
            style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }
        },
            React.createElement('span', {
                style: { fontSize: '0.75rem', fontWeight: 600, color: T.cyan, fontFamily: T.font }
            }, 'Pro Plan'),
            React.createElement('span', {
                style: { fontSize: '0.6875rem', color: T.txtMuted, fontFamily: T.fontMono }
            }, `${pct}%`)
        ),

        // Progress track
        React.createElement('div', {
            style: {
                width: '100%', height: 4,
                background: 'rgba(255,255,255,0.07)',
                borderRadius: 9999, overflow: 'hidden',
                marginBottom: 8,
            }
        },
            React.createElement('div', {
                style: {
                    height: '100%',
                    width: `${pct}%`,
                    borderRadius: 9999,
                    background: gradBrand,
                    transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)',
                }
            })
        ),

        // Labels
        React.createElement('div', {
            style: { display: 'flex', justifyContent: 'space-between' }
        },
            React.createElement('span', {
                style: { fontSize: '0.625rem', color: T.txtMuted, fontFamily: T.fontMono }
            }, `${used.toLocaleString()} used`),
            React.createElement('span', {
                style: { fontSize: '0.625rem', color: T.txtMuted, fontFamily: T.fontMono }
            }, `${total.toLocaleString()} / day`)
        )
    );
}

/* ─────────────────────────────────────────
   USER PROFILE STRIP
───────────────────────────────────────── */
function UserProfile(props) {
    const { collapsed } = props;
    const [dropOpen, setDropOpen] = useState(false);

    const menuItems = [
        { label: 'Profile Settings', href: '/dashboard/settings' },
        { label: 'Billing', href: '/dashboard/billing' },
        { label: 'API Keys', href: '/dashboard/api-keys' },
        { label: 'Sign out', href: '/logout' },
    ];

    return React.createElement('div', { style: { position: 'relative' } },

        // Trigger button
        React.createElement('button', {
            onClick: function () { setDropOpen(function (o) { return !o; }); },
            style: {
                width: '100%',
                padding: collapsed ? '10px 8px' : '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 10,
                transition: 'background 0.18s',
                fontFamily: T.font,
            },
            onMouseEnter: function (e) { e.currentTarget.style.background = T.bgHover; },
            onMouseLeave: function (e) { e.currentTarget.style.background = 'none'; },
        },

            // Avatar
            React.createElement('div', {
                style: {
                    width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                    background: gradBrand,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6875rem', fontWeight: 700, color: '#fff',
                }
            }, 'JD'),

            // Name + email
            !collapsed && React.createElement(React.Fragment, null,
                React.createElement('div', {
                    style: { flex: 1, textAlign: 'left', minWidth: 0 }
                },
                    React.createElement('div', {
                        style: {
                            fontSize: '0.8125rem', fontWeight: 600,
                            color: T.txtPrimary,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }
                    }, 'John Doe'),
                    React.createElement('div', {
                        style: {
                            fontSize: '0.6875rem', color: T.txtMuted,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }
                    }, 'john@agency.com')
                ),
                React.createElement('div', {
                    style: {
                        transition: 'transform 0.2s',
                        transform: dropOpen ? 'rotate(180deg)' : 'none',
                        color: T.txtMuted,
                        display: 'flex',
                    }
                },
                    React.createElement(ICONS.chevronD)
                )
            )
        ),

        // Dropdown menu
        dropOpen && React.createElement(React.Fragment, null,
            // Outside click layer
            React.createElement('div', {
                style: { position: 'fixed', inset: 0, zIndex: 49 },
                onClick: function () { setDropOpen(false); }
            }),

            React.createElement('div', {
                style: {
                    position: 'absolute',
                    bottom: 'calc(100% + 8px)',
                    left: 8, right: 8,
                    background: T.bgSurface,
                    border: `1px solid ${T.border}`,
                    borderRadius: 12,
                    padding: 6,
                    zIndex: 50,
                    boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                    animation: 'popIn 0.15s cubic-bezier(0.16,1,0.3,1)',
                }
            },
                menuItems.map(function (item) {
                    const isSignOut = item.href === '/logout';
                    return React.createElement(Link, {
                        key: item.href,
                        href: item.href,
                        onClick: function () { setDropOpen(false); },
                        style: {
                            display: 'block',
                            padding: '8px 10px',
                            borderRadius: 8,
                            fontSize: '0.8125rem',
                            fontFamily: T.font,
                            textDecoration: 'none',
                            color: isSignOut ? T.red : T.txtSecond,
                            transition: 'all 0.15s',
                        },
                        onMouseEnter: function (e) {
                            e.currentTarget.style.background = isSignOut ? 'rgba(239,68,68,0.08)' : T.bgHover;
                            e.currentTarget.style.color = isSignOut ? T.red : T.txtPrimary;
                        },
                        onMouseLeave: function (e) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = isSignOut ? T.red : T.txtSecond;
                        },
                    }, item.label);
                })
            )
        )
    );
}

/* ─────────────────────────────────────────
   NAV ITEM
───────────────────────────────────────── */
function NavItem(props) {
    const { label, href, iconKey, badge, active, collapsed } = props;
    const [hovered, setHovered] = useState(false);

    const IconComp = ICONS[iconKey];

    return React.createElement(Link, {
        href,
        title: collapsed ? label : undefined,
        onMouseEnter: function () { setHovered(true); },
        onMouseLeave: function () { setHovered(false); },
        style: {
            display: 'flex',
            alignItems: 'center',
            gap: collapsed ? 0 : 10,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '9px' : '9px 12px',
            borderRadius: 10,
            marginBottom: 2,
            fontSize: '0.875rem',
            fontWeight: 500,
            fontFamily: T.font,
            textDecoration: 'none',
            transition: 'all 0.18s cubic-bezier(0.16,1,0.3,1)',
            border: `1px solid ${active ? T.cyanBorder : 'transparent'}`,
            color: active ? T.cyan : hovered ? T.txtPrimary : T.txtSecond,
            background: active ? T.cyanDim : hovered ? T.bgHover : 'transparent',
            position: 'relative',
            overflow: 'hidden',
        }
    },
        // Active indicator bar
        active && React.createElement('div', {
            style: {
                position: 'absolute',
                left: 0, top: '20%', bottom: '20%',
                width: 3, borderRadius: '0 2px 2px 0',
                background: gradBrand,
            }
        }),

        // Icon
        React.createElement('span', {
            style: {
                display: 'flex',
                color: active ? T.cyan : 'inherit',
                flexShrink: 0,
                transition: 'color 0.18s',
            }
        },
            React.createElement(IconComp)
        ),

        // Label + badge
        !collapsed && React.createElement(React.Fragment, null,
            React.createElement('span', { style: { flex: 1, whiteSpace: 'nowrap' } }, label),
            badge && React.createElement('span', {
                style: {
                    fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.06em',
                    padding: '2px 6px', borderRadius: 4,
                    background: 'rgba(0,212,255,0.15)', color: T.cyan,
                }
            }, badge)
        )
    );
}

/* ─────────────────────────────────────────
   MAIN SIDEBAR EXPORT
───────────────────────────────────────── */
export default function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const sideWidth = collapsed ? 60 : 220;

    const isActive = useCallback(function (href) {
        return href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(href);
    }, [pathname]);

    return React.createElement(React.Fragment, null,

        // Keyframes
        React.createElement('style', null, `
      @keyframes popIn {
        from { opacity: 0; transform: translateY(6px) scale(0.97); }
        to   { opacity: 1; transform: none; }
      }
    `),

        React.createElement('aside', {
            style: {
                width: sideWidth,
                minWidth: sideWidth,
                height: '100vh',
                position: 'sticky',
                top: 0,
                display: 'flex',
                flexDirection: 'column',
                background: T.bgSurface,
                borderRight: `1px solid ${T.border}`,
                transition: 'width 0.25s cubic-bezier(0.16,1,0.3,1), min-width 0.25s cubic-bezier(0.16,1,0.3,1)',
                flexShrink: 0,
                overflow: 'hidden',
                zIndex: 40,
            }
        },

            /* ── Logo / Toggle Row ──────────────── */
            React.createElement('div', {
                style: {
                    height: 60,
                    padding: '0 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'space-between',
                    borderBottom: `1px solid ${T.border}`,
                    flexShrink: 0,
                }
            },

                // Word-mark (hidden when collapsed)
                !collapsed && React.createElement(Link, {
                    href: '/',
                    style: { textDecoration: 'none', userSelect: 'none' }
                },
                    React.createElement('span', {
                        style: {
                            fontSize: 16, fontWeight: 800,
                            letterSpacing: '-0.03em',
                            fontFamily: T.font,
                        }
                    },
                        React.createElement('span', {
                            style: {
                                background: gradBrand,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }
                        }, 'Index'),
                        React.createElement('span', { style: { color: T.txtPrimary } }, 'Flow')
                    )
                ),

                // Collapse toggle
                React.createElement('button', {
                    onClick: function () { setCollapsed(function (c) { return !c; }); },
                    'aria-label': 'Toggle sidebar',
                    style: {
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 28, height: 28,
                        background: 'none',
                        border: `1px solid ${T.border}`,
                        borderRadius: 7,
                        cursor: 'pointer',
                        color: T.txtMuted,
                        flexShrink: 0,
                        transition: 'all 0.18s',
                    },
                    onMouseEnter: function (e) {
                        e.currentTarget.style.background = T.bgHover;
                        e.currentTarget.style.color = T.txtPrimary;
                    },
                    onMouseLeave: function (e) {
                        e.currentTarget.style.background = 'none';
                        e.currentTarget.style.color = T.txtMuted;
                    },
                },
                    React.createElement('div', {
                        style: {
                            transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
                            transform: collapsed ? 'rotate(180deg)' : 'none',
                            display: 'flex',
                        }
                    },
                        React.createElement(ICONS.chevronL)
                    )
                )
            ),

            /* ── Nav Sections ───────────────────── */
            React.createElement('div', {
                style: { flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '10px 8px' }
            },
                NAV_SECTIONS.map(function (section) {
                    return React.createElement('div', { key: section.section, style: { marginBottom: 4 } },

                        // Section label
                        !collapsed && React.createElement('div', {
                            style: {
                                padding: '10px 12px 4px',
                                fontSize: '0.5625rem',
                                fontWeight: 700,
                                letterSpacing: '0.12em',
                                color: T.txtMuted,
                                textTransform: 'uppercase',
                                fontFamily: T.font,
                            }
                        }, section.section),

                        collapsed && React.createElement('div', { style: { height: 8 } }),

                        // Items
                        section.items.map(function (item) {
                            return React.createElement(NavItem, {
                                key: item.href,
                                label: item.label,
                                href: item.href,
                                iconKey: item.iconKey,
                                badge: item.badge,
                                active: isActive(item.href),
                                collapsed,
                            });
                        })
                    );
                })
            ),

            /* ── Bottom Zone ────────────────────── */
            React.createElement('div', { style: { flexShrink: 0, borderTop: `1px solid ${T.border}` } },
                React.createElement(QuotaWidget, { collapsed }),
                React.createElement('div', { style: { height: 1, background: T.border, margin: '0 10px' } }),
                React.createElement('div', { style: { padding: '6px 0' } },
                    React.createElement(UserProfile, { collapsed })
                )
            )
        )
    );
}