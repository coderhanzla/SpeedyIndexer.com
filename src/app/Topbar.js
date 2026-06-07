'use client';
// components/dashboard/Topbar.js
// Speedy Indexer — Premium Dashboard Top Navigation Bar
// Pure JavaScript + React — search, queue status, notifications, user menu

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/* ─────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────── */
const T = {
    bgBase: 'rgba(2,6,23,0.92)',
    bgSurface: '#060e24',
    bgCard: 'rgba(255,255,255,0.04)',
    bgHover: 'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.07)',
    cyan: '#00d4ff',
    cyanDim: 'rgba(0,212,255,0.07)',
    cyanBorder: 'rgba(0,212,255,0.2)',
    purple: '#8b5cf6',
    green: '#10b981',
    amber: '#f59e0b',
    red: '#ef4444',
    txtPrimary: '#ffffff',
    txtSecond: '#94a3b8',
    txtMuted: '#475569',
    font: "'Bricolage Grotesque','Inter',sans-serif",
    fontMono: "'DM Mono','Fira Code',monospace",
};

const gradBrand = 'linear-gradient(135deg,#00d4ff 0%,#8b5cf6 100%)';

/* ─────────────────────────────────────────
   SVG ICON FACTORIES
───────────────────────────────────────── */
const ic = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '1.75', strokeLinecap: 'round', strokeLinejoin: 'round' };

function IconSearch() { return React.createElement('svg', { ...ic, width: 15, height: 15 }, React.createElement('circle', { cx: '11', cy: '11', r: '8' }), React.createElement('line', { x1: '21', y1: '21', x2: '16.65', y2: '16.65' })); }
function IconBell() { return React.createElement('svg', ic, React.createElement('path', { d: 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9' }), React.createElement('path', { d: 'M13.73 21a2 2 0 01-3.46 0' })); }
function IconChevD() { return React.createElement('svg', { ...ic, width: 13, height: 13 }, React.createElement('polyline', { points: '6 9 12 15 18 9' })); }
function IconX() { return React.createElement('svg', { ...ic, width: 13, height: 13 }, React.createElement('line', { x1: '18', y1: '6', x2: '6', y2: '18' }), React.createElement('line', { x1: '6', y1: '6', x2: '18', y2: '18' })); }
function IconGrid() { return React.createElement('svg', ic, React.createElement('rect', { x: '3', y: '3', width: '7', height: '7', rx: '1' }), React.createElement('rect', { x: '14', y: '3', width: '7', height: '7', rx: '1' }), React.createElement('rect', { x: '3', y: '14', width: '7', height: '7', rx: '1' }), React.createElement('rect', { x: '14', y: '14', width: '7', height: '7', rx: '1' })); }
function IconSettings() { return React.createElement('svg', ic, React.createElement('circle', { cx: '12', cy: '12', r: '3' }), React.createElement('path', { d: 'M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z' })); }
function IconSignOut() { return React.createElement('svg', ic, React.createElement('path', { d: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4' }), React.createElement('polyline', { points: '16 17 21 12 16 7' }), React.createElement('line', { x1: '21', y1: '12', x2: '9', y2: '12' })); }

/* ─────────────────────────────────────────
   BREADCRUMB BUILDER
───────────────────────────────────────── */
function buildBreadcrumbs(pathname) {
    const segments = pathname.replace('/dashboard', '').split('/').filter(Boolean);
    const crumbs = [{ label: 'Dashboard', href: '/dashboard' }];
    segments.forEach(function (seg, i) {
        const label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
        const href = '/dashboard/' + segments.slice(0, i + 1).join('/');
        crumbs.push({ label, href });
    });
    return crumbs;
}

/* ─────────────────────────────────────────
   LIVE QUEUE STATUS PILL
───────────────────────────────────────── */
function QueuePill() {
    const [count, setCount] = useState(892);

    useEffect(function () {
        const iv = setInterval(function () {
            setCount(function (n) { return Math.max(0, n + Math.floor(Math.random() * 7) - 3); });
        }, 2800);
        return function () { clearInterval(iv); };
    }, []);

    return React.createElement('div', {
        style: {
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 12px',
            background: T.cyanDim,
            border: `1px solid ${T.cyanBorder}`,
            borderRadius: 9999,
            fontSize: '0.75rem',
            fontWeight: 600,
            color: T.txtSecond,
            fontFamily: T.font,
            cursor: 'default',
            userSelect: 'none',
        }
    },
        // Animated live dot
        React.createElement('span', {
            style: {
                width: 6, height: 6,
                borderRadius: '50%',
                background: T.cyan,
                display: 'block',
                animation: 'queuePing 1.6s cubic-bezier(0,0,0.2,1) infinite',
                flexShrink: 0,
            }
        }),
        React.createElement('span', null, 'Queue:'),
        React.createElement('span', {
            style: {
                color: T.cyan,
                fontFamily: T.fontMono,
                fontWeight: 700,
                minWidth: 40,
                textAlign: 'right',
                transition: 'color 0.3s',
            }
        }, count.toLocaleString())
    );
}

/* ─────────────────────────────────────────
   SEARCH BAR
───────────────────────────────────────── */
function SearchBar() {
    const [focused, setFocused] = useState(false);
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);

    // Keyboard shortcut Cmd/Ctrl+K
    useEffect(function () {
        function handler(e) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (inputRef.current) inputRef.current.focus();
            }
        }
        window.addEventListener('keydown', handler);
        return function () { window.removeEventListener('keydown', handler); };
    }, []);

    return React.createElement('div', {
        style: {
            position: 'relative',
            width: focused ? 320 : 240,
            transition: 'width 0.3s cubic-bezier(0.16,1,0.3,1)',
            flexShrink: 0,
        }
    },
        React.createElement('div', {
            style: {
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: focused ? 'rgba(0,212,255,0.04)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${focused ? 'rgba(0,212,255,0.45)' : T.border}`,
                borderRadius: 10,
                padding: '8px 13px',
                transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
                boxShadow: focused ? '0 0 0 3px rgba(0,212,255,0.08)' : 'none',
                cursor: 'text',
            },
            onClick: function () { if (inputRef.current) inputRef.current.focus(); }
        },

            // Search icon
            React.createElement('span', { style: { color: focused ? T.cyan : T.txtMuted, flexShrink: 0, display: 'flex', transition: 'color 0.2s' } },
                React.createElement(IconSearch)
            ),

            // Input
            React.createElement('input', {
                ref: inputRef,
                value: query,
                onChange: function (e) { setQuery(e.target.value); },
                onFocus: function () { setFocused(true); },
                onBlur: function () { setFocused(false); },
                placeholder: 'Search URLs, projects…',
                style: {
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    color: T.txtPrimary,
                    fontSize: '0.8125rem',
                    fontFamily: T.font,
                    width: '100%',
                }
            }),

            // Clear button
            query && React.createElement('button', {
                onClick: function () { setQuery(''); if (inputRef.current) inputRef.current.focus(); },
                style: {
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: T.txtMuted, display: 'flex', flexShrink: 0, padding: 0,
                }
            }, React.createElement(IconX)),

            // Keyboard hint
            !query && focused && React.createElement('kbd', {
                style: {
                    fontSize: '0.5625rem',
                    fontFamily: T.fontMono,
                    color: T.txtMuted,
                    background: 'rgba(255,255,255,0.07)',
                    border: `1px solid rgba(255,255,255,0.1)`,
                    borderRadius: 4,
                    padding: '1px 5px',
                    flexShrink: 0,
                }
            }, '⌘K'),

            // Static hint
            !query && !focused && React.createElement('kbd', {
                style: {
                    fontSize: '0.5625rem',
                    fontFamily: T.fontMono,
                    color: T.txtMuted,
                    background: 'rgba(255,255,255,0.06)',
                    border: `1px solid ${T.border}`,
                    borderRadius: 4,
                    padding: '1px 5px',
                    flexShrink: 0,
                }
            }, '⌘K')
        )
    );
}

/* ─────────────────────────────────────────
   NOTIFICATION CENTER
───────────────────────────────────────── */
const NOTIFICATIONS = [
    { type: 'success', title: 'Bulk job complete', body: '2,400 URLs indexed successfully', time: '2m ago', color: '#10b981' },
    { type: 'warning', title: 'Google API at 82%', body: 'Approaching daily quota limit', time: '18m ago', color: '#f59e0b' },
    { type: 'info', title: 'Team member joined', body: 'sarah@agency.com accepted invite', time: '1h ago', color: '#00d4ff' },
    { type: 'success', title: 'Sitemap indexed', body: '980 URLs extracted from sitemap.xml', 'time': '2h ago', color: '#10b981' },
    { type: 'error', title: '3 jobs failed', body: 'Retry queue processing now', time: '3h ago', color: '#ef4444' },
];

function NotificationCenter() {
    const [open, setOpen] = useState(false);
    const [unread, setUnread] = useState(NOTIFICATIONS.length);
    const panelRef = useRef(null);

    // Close on outside click
    useEffect(function () {
        if (!open) return;
        function handler(e) {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handler);
        return function () { document.removeEventListener('mousedown', handler); };
    }, [open]);

    function handleOpen() {
        setOpen(function (o) { return !o; });
        setUnread(0);
    }

    const typeIcons = { success: '✓', warning: '⚠', info: 'i', error: '!' };

    return React.createElement('div', { ref: panelRef, style: { position: 'relative' } },

        // Bell button
        React.createElement('button', {
            onClick: handleOpen,
            'aria-label': 'Notifications',
            style: {
                position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36,
                background: open ? T.bgHover : 'none',
                border: `1px solid ${open ? T.border : 'transparent'}`,
                borderRadius: 9,
                cursor: 'pointer',
                color: unread > 0 ? T.txtPrimary : T.txtSecond,
                transition: 'all 0.18s',
            },
            onMouseEnter: function (e) {
                e.currentTarget.style.background = T.bgHover;
                e.currentTarget.style.borderColor = T.border;
            },
            onMouseLeave: function (e) {
                if (!open) {
                    e.currentTarget.style.background = 'none';
                    e.currentTarget.style.borderColor = 'transparent';
                }
            },
        },
            React.createElement(IconBell),
            unread > 0 && React.createElement('span', {
                style: {
                    position: 'absolute',
                    top: 5, right: 5,
                    width: 8, height: 8,
                    background: T.red,
                    borderRadius: '50%',
                    border: `2px solid ${T.bgBase}`,
                    animation: 'notifPulse 2s ease-in-out infinite',
                }
            })
        ),

        // Dropdown panel
        open && React.createElement('div', {
            style: {
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                width: 360,
                background: '#060e24',
                border: `1px solid ${T.border}`,
                borderRadius: 14,
                boxShadow: '0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04) inset',
                zIndex: 60,
                overflow: 'hidden',
                animation: 'dropIn 0.18s cubic-bezier(0.16,1,0.3,1)',
                transformOrigin: 'top right',
            }
        },

            // Panel header
            React.createElement('div', {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderBottom: `1px solid ${T.border}`,
                }
            },
                React.createElement('div', {
                    style: { display: 'flex', alignItems: 'center', gap: 10 }
                },
                    React.createElement('span', {
                        style: { fontSize: '0.9375rem', fontWeight: 700, color: T.txtPrimary, fontFamily: T.font }
                    }, 'Notifications'),
                    unread === 0 && React.createElement('span', {
                        style: {
                            fontSize: '0.5625rem', fontWeight: 700,
                            padding: '2px 7px', borderRadius: 9999,
                            background: 'rgba(16,185,129,0.12)',
                            color: '#10b981',
                            border: '1px solid rgba(16,185,129,0.2)',
                        }
                    }, 'ALL READ')
                ),
                React.createElement('button', {
                    style: {
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: '0.75rem', color: T.cyan, fontFamily: T.font, fontWeight: 600,
                        padding: '4px 8px', borderRadius: 6,
                        transition: 'background 0.15s',
                    },
                    onMouseEnter: function (e) { e.currentTarget.style.background = T.cyanDim; },
                    onMouseLeave: function (e) { e.currentTarget.style.background = 'none'; },
                }, 'Mark all read')
            ),

            // Notification list
            React.createElement('div', { style: { maxHeight: 340, overflowY: 'auto' } },
                NOTIFICATIONS.map(function (n, i) {
                    return React.createElement('div', {
                        key: i,
                        style: {
                            display: 'flex',
                            gap: 13,
                            padding: '13px 18px',
                            borderBottom: i < NOTIFICATIONS.length - 1 ? `1px solid rgba(255,255,255,0.04)` : 'none',
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                        },
                        onMouseEnter: function (e) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; },
                        onMouseLeave: function (e) { e.currentTarget.style.background = 'transparent'; },
                    },
                        // Icon circle
                        React.createElement('div', {
                            style: {
                                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                                background: `${n.color}15`,
                                border: `1px solid ${n.color}25`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.75rem', fontWeight: 700,
                                color: n.color,
                            }
                        }, typeIcons[n.type]),

                        // Text content
                        React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                            React.createElement('div', {
                                style: { fontSize: '0.8125rem', fontWeight: 600, color: T.txtPrimary, marginBottom: 3, fontFamily: T.font }
                            }, n.title),
                            React.createElement('div', {
                                style: { fontSize: '0.75rem', color: T.txtSecond, lineHeight: 1.5 }
                            }, n.body),
                            React.createElement('div', {
                                style: { fontSize: '0.6875rem', color: T.txtMuted, marginTop: 4, fontFamily: T.fontMono }
                            }, n.time)
                        )
                    );
                })
            ),

            // Panel footer
            React.createElement('div', {
                style: {
                    padding: '10px 18px',
                    borderTop: `1px solid ${T.border}`,
                    textAlign: 'center',
                }
            },
                React.createElement(Link, {
                    href: '/dashboard/notifications',
                    onClick: function () { setOpen(false); },
                    style: {
                        fontSize: '0.8125rem',
                        color: T.cyan,
                        textDecoration: 'none',
                        fontFamily: T.font,
                        fontWeight: 500,
                        transition: 'opacity 0.15s',
                    },
                    onMouseEnter: function (e) { e.currentTarget.style.opacity = '0.7'; },
                    onMouseLeave: function (e) { e.currentTarget.style.opacity = '1'; },
                }, 'View all notifications →')
            )
        )
    );
}

/* ─────────────────────────────────────────
   USER AVATAR MENU
───────────────────────────────────────── */
function UserMenu() {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(function () {
        if (!open) return;
        function handler(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener('mousedown', handler);
        return function () { document.removeEventListener('mousedown', handler); };
    }, [open]);

    const menuItems = [
        { label: 'Dashboard', href: '/dashboard', Icon: IconGrid, divider: false },
        { label: 'Settings', href: '/dashboard/settings', Icon: IconSettings, divider: false },
        { label: 'Sign out', href: '/logout', Icon: IconSignOut, divider: true, danger: true },
    ];

    return React.createElement('div', { ref, style: { position: 'relative' } },

        // Trigger
        React.createElement('button', {
            onClick: function () { setOpen(function (o) { return !o; }); },
            style: {
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 10px',
                background: open ? T.bgHover : 'none',
                border: `1px solid ${open ? T.border : 'transparent'}`,
                borderRadius: 10,
                cursor: 'pointer',
                transition: 'all 0.18s',
                fontFamily: T.font,
            },
            onMouseEnter: function (e) {
                e.currentTarget.style.background = T.bgHover;
                e.currentTarget.style.borderColor = T.border;
            },
            onMouseLeave: function (e) {
                if (!open) {
                    e.currentTarget.style.background = 'none';
                    e.currentTarget.style.borderColor = 'transparent';
                }
            },
        },

            // Avatar
            React.createElement('div', {
                style: {
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: gradBrand,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.625rem', fontWeight: 700, color: '#fff',
                }
            }, 'JD'),

            // Name (hidden on mobile via inline media)
            React.createElement('span', {
                style: { fontSize: '0.8125rem', fontWeight: 500, color: T.txtSecond }
            }, 'John D.'),

            React.createElement('div', {
                style: {
                    color: T.txtMuted, display: 'flex',
                    transition: 'transform 0.2s',
                    transform: open ? 'rotate(180deg)' : 'none',
                }
            }, React.createElement(IconChevD))
        ),

        // Dropdown
        open && React.createElement('div', {
            style: {
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                width: 220,
                background: '#060e24',
                border: `1px solid ${T.border}`,
                borderRadius: 12,
                padding: 8,
                boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                zIndex: 60,
                animation: 'dropIn 0.18s cubic-bezier(0.16,1,0.3,1)',
                transformOrigin: 'top right',
            }
        },

            // Profile info header
            React.createElement('div', {
                style: {
                    padding: '10px 10px 12px',
                    borderBottom: `1px solid ${T.border}`,
                    marginBottom: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                }
            },
                React.createElement('div', {
                    style: {
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        background: gradBrand,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 700, color: '#fff',
                    }
                }, 'JD'),
                React.createElement('div', null,
                    React.createElement('div', {
                        style: { fontSize: '0.875rem', fontWeight: 600, color: T.txtPrimary, fontFamily: T.font }
                    }, 'John Doe'),
                    React.createElement('div', {
                        style: { fontSize: '0.6875rem', color: T.txtMuted }
                    }, 'john@agency.com')
                )
            ),

            // Plan badge
            React.createElement('div', {
                style: {
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 10px 12px',
                    borderBottom: `1px solid ${T.border}`,
                    marginBottom: 6,
                }
            },
                React.createElement('span', { style: { fontSize: '0.75rem', color: T.txtMuted, fontFamily: T.font } }, 'Current plan'),
                React.createElement('span', {
                    style: {
                        fontSize: '0.6875rem', fontWeight: 700,
                        padding: '3px 8px', borderRadius: 6,
                        background: 'rgba(0,212,255,0.1)',
                        color: T.cyan,
                        border: `1px solid rgba(0,212,255,0.2)`,
                    }
                }, 'PRO')
            ),

            // Menu items
            menuItems.map(function (item, i) {
                return React.createElement(React.Fragment, { key: item.href },
                    item.divider && React.createElement('div', {
                        style: { height: 1, background: T.border, margin: '6px 0' }
                    }),
                    React.createElement(Link, {
                        href: item.href,
                        onClick: function () { setOpen(false); },
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 9,
                            padding: '8px 10px',
                            borderRadius: 8,
                            fontSize: '0.8125rem',
                            fontFamily: T.font,
                            textDecoration: 'none',
                            color: item.danger ? T.red : T.txtSecond,
                            transition: 'all 0.15s',
                        },
                        onMouseEnter: function (e) {
                            e.currentTarget.style.background = item.danger ? 'rgba(239,68,68,0.07)' : T.bgHover;
                            e.currentTarget.style.color = item.danger ? T.red : T.txtPrimary;
                        },
                        onMouseLeave: function (e) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = item.danger ? T.red : T.txtSecond;
                        },
                    },
                        React.createElement('span', { style: { display: 'flex', color: 'inherit' } },
                            React.createElement(item.Icon)
                        ),
                        item.label
                    )
                );
            })
        )
    );
}

/* ─────────────────────────────────────────
   BREADCRUMB NAV
───────────────────────────────────────── */
function Breadcrumbs() {
    const pathname = usePathname();
    const crumbs = buildBreadcrumbs(pathname);

    if (crumbs.length <= 1) {
        return React.createElement('h1', {
            style: {
                fontSize: '1rem',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: T.txtPrimary,
                fontFamily: T.font,
            }
        }, 'Dashboard');
    }

    return React.createElement('nav', {
        'aria-label': 'Breadcrumb',
        style: { display: 'flex', alignItems: 'center', gap: 6 }
    },
        crumbs.map(function (crumb, i) {
            const isLast = i === crumbs.length - 1;
            return React.createElement('span', {
                key: crumb.href,
                style: { display: 'flex', alignItems: 'center', gap: 6 }
            },
                i > 0 && React.createElement('span', {
                    style: { color: T.txtMuted, fontSize: '0.875rem' }
                }, '/'),
                isLast
                    ? React.createElement('span', {
                        style: {
                            fontSize: '0.875rem', fontWeight: 600,
                            color: T.txtPrimary, fontFamily: T.font,
                        }
                    }, crumb.label)
                    : React.createElement(Link, {
                        href: crumb.href,
                        style: {
                            fontSize: '0.875rem',
                            color: T.txtMuted,
                            textDecoration: 'none',
                            fontFamily: T.font,
                            transition: 'color 0.15s',
                        },
                        onMouseEnter: function (e) { e.currentTarget.style.color = T.txtPrimary; },
                        onMouseLeave: function (e) { e.currentTarget.style.color = T.txtMuted; },
                    }, crumb.label)
            );
        })
    );
}

/* ─────────────────────────────────────────
   MAIN TOPBAR EXPORT
───────────────────────────────────────── */
export default function Topbar() {
    return React.createElement(React.Fragment, null,

        // Keyframe injections
        React.createElement('style', null, `
      @keyframes queuePing {
        0%   { box-shadow: 0 0 0 0 rgba(0,212,255,0.55); }
        70%  { box-shadow: 0 0 0 7px rgba(0,212,255,0); }
        100% { box-shadow: 0 0 0 0 rgba(0,212,255,0); }
      }
      @keyframes notifPulse {
        0%,100% { transform: scale(1); }
        50%     { transform: scale(1.25); }
      }
      @keyframes dropIn {
        from { opacity: 0; transform: translateY(-6px) scale(0.97); }
        to   { opacity: 1; transform: none; }
      }
      @media (max-width: 640px) {
        .topbar-search  { display: none !important; }
        .topbar-queue   { display: none !important; }
        .topbar-username{ display: none !important; }
      }
    `),

        React.createElement('header', {
            style: {
                height: 60,
                borderBottom: `1px solid ${T.border}`,
                display: 'flex',
                alignItems: 'center',
                padding: '0 24px',
                gap: 12,
                position: 'sticky',
                top: 0,
                background: T.bgBase,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                zIndex: 30,
                flexShrink: 0,
            }
        },

            /* ── Left: Breadcrumbs ─────────────── */
            React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                React.createElement(Breadcrumbs)
            ),

            /* ── Right: Controls ───────────────── */
            React.createElement('div', {
                style: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }
            },

                // Queue status
                React.createElement('div', { className: 'topbar-queue' },
                    React.createElement(QueuePill)
                ),

                // Search bar
                React.createElement('div', { className: 'topbar-search' },
                    React.createElement(SearchBar)
                ),

                // Divider
                React.createElement('div', {
                    style: { width: 1, height: 22, background: T.border, flexShrink: 0 }
                }),

                // Notifications
                React.createElement(NotificationCenter),

                // Divider
                React.createElement('div', {
                    style: { width: 1, height: 22, background: T.border, flexShrink: 0 }
                }),

                // User menu
                React.createElement(UserMenu)
            )
        )
    );
}