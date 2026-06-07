'use client';
// app/api-docs/page.js
// Speedy Indexer — API Documentation Page
// Pure JavaScript + React.createElement

import React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '../Navbar';

/* ─────────────────────────────────────────
   TOKENS
───────────────────────────────────────── */
const T = {
    bg: '#020617', bgSurface: '#060e24', bgCard: 'rgba(255,255,255,0.04)', bgHov: 'rgba(255,255,255,0.07)',
    bgCode: '#010409', border: 'rgba(255,255,255,0.07)',
    cyan: '#00d4ff', purple: '#8b5cf6', green: '#10b981', amber: '#f59e0b', red: '#ef4444', blue: '#3b82f6',
    txt0: '#ffffff', txt1: '#94a3b8', txt2: '#475569',
    font: "'Bricolage Grotesque','Inter',sans-serif",
    mono: "'DM Mono','Fira Code',monospace",
};
const grad = 'linear-gradient(135deg,#00d4ff 0%,#8b5cf6 100%)';

/* ─────────────────────────────────────────
   SIDEBAR NAV DATA
───────────────────────────────────────── */
const DOC_SECTIONS = [
    { id: 'intro', label: 'Introduction' },
    { id: 'auth', label: 'Authentication' },
    { id: 'submit', label: 'Submit URLs', method: 'POST' },
    { id: 'status', label: 'Job Status', method: 'GET' },
    { id: 'history', label: 'URL History', method: 'GET' },
    { id: 'quota', label: 'Quota Usage', method: 'GET' },
    { id: 'projects', label: 'Projects', method: 'GET' },
    { id: 'webhooks', label: 'Webhooks' },
    { id: 'errors', label: 'Error Codes' },
    { id: 'sdks', label: 'SDKs & Libraries' },
];

/* ─────────────────────────────────────────
   ATOMS
───────────────────────────────────────── */
function GradText(props) {
    return React.createElement('span', { style: { background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } }, props.children);
}

function MethodBadge(props) {
    const cfg = {
        GET: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
        POST: { bg: 'rgba(0,212,255,0.12)', color: '#00d4ff' },
        DELETE: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
        PUT: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
    };
    const c = cfg[props.method] || cfg.GET;
    return React.createElement('span', {
        style: { display: 'inline-flex', padding: '2px 8px', borderRadius: 6, fontSize: '0.625rem', fontWeight: 800, letterSpacing: '0.07em', background: c.bg, color: c.color, fontFamily: T.mono, flexShrink: 0 }
    }, props.method);
}

function CodeBlock(props) {
    const [copied, setCopied] = useState(false);

    function copy() {
        navigator.clipboard && navigator.clipboard.writeText(props.code);
        setCopied(true);
        setTimeout(function () { setCopied(false); }, 2000);
    }

    const lines = props.code.trim().split('\n');
    const highlight = props.highlight || {};

    return React.createElement('div', { style: { position: 'relative', borderRadius: 14, overflow: 'hidden', border: `1px solid rgba(255,255,255,0.07)` } },
        // Top bar
        React.createElement('div', {
            style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)' }
        },
            React.createElement('div', { style: { display: 'flex', gap: 6 } },
                ...['#ef4444', '#f59e0b', '#10b981'].map(function (c) {
                    return React.createElement('div', { key: c, style: { width: 10, height: 10, borderRadius: '50%', background: c } });
                })
            ),
            React.createElement('span', { style: { fontSize: '0.6875rem', color: T.txt2, fontFamily: T.font, fontWeight: 500 } }, props.lang || 'bash'),
            React.createElement('button', {
                onClick: copy,
                style: { background: 'none', border: `1px solid ${copied ? T.green : T.border}`, borderRadius: 6, cursor: 'pointer', padding: '3px 10px', fontSize: '0.625rem', fontWeight: 700, color: copied ? T.green : T.txt2, fontFamily: T.font, transition: 'all 0.2s' }
            }, copied ? '✓ Copied' : 'Copy')
        ),
        // Code
        React.createElement('pre', {
            style: { background: T.bgCode, margin: 0, padding: '18px 20px', overflowX: 'auto', fontSize: '0.8125rem', lineHeight: 1.85, fontFamily: T.mono }
        },
            lines.map(function (line, i) {
                let color = T.txt1;
                if (line.startsWith('#')) color = T.txt2;
                else if (line.includes('Authorization') || line.includes('Bearer')) color = '#a5d6a7';
                else if (line.includes('POST') || line.includes('GET') || line.includes('curl')) color = T.cyan;
                else if (line.includes('"') && line.includes(':')) color = T.txt1;
                else if (line.startsWith('{') || line.startsWith('}') || line.startsWith('[') || line.startsWith(']')) color = T.txt1;
                else if (line.includes('error') || line.includes('Error')) color = T.red;
                else if (line.includes('true') || line.includes('indexed') || line.includes('success')) color = T.green;
                return React.createElement('div', {
                    key: i,
                    style: { color, display: 'flex', gap: 12 }
                },
                    React.createElement('span', { style: { color: T.txt2, userSelect: 'none', minWidth: 20, textAlign: 'right', fontFamily: T.mono } }, String(i + 1).padStart(2, ' ')),
                    React.createElement('span', null, line)
                );
            })
        )
    );
}

function ParamRow(props) {
    const typeColors = { string: T.green, integer: T.cyan, boolean: T.amber, array: T.purple, object: T.blue };
    return React.createElement('div', {
        className: 'collapse-on-mobile',
        style: { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 0.6fr 2fr', gap: 16, padding: '13px 18px', borderBottom: `1px solid rgba(255,255,255,0.04)`, alignItems: 'start', fontSize: '0.8125rem' }
    },
        React.createElement('span', { style: { fontFamily: T.mono, color: T.cyan } }, props.name),
        React.createElement('span', { style: { color: typeColors[props.type] || T.txt1, fontFamily: T.mono } }, props.type),
        React.createElement('span', { style: { color: props.required ? T.red : T.txt2, fontWeight: 600 } }, props.required ? 'Required' : 'Optional'),
        React.createElement('span', { style: { color: T.txt1, lineHeight: 1.6 } }, props.desc)
    );
}

/* ─────────────────────────────────────────
   DOC CONTENT SECTIONS
───────────────────────────────────────── */
function SectionIntro() {
    return React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 14, fontFamily: T.font } }, 'Introduction'),
        React.createElement('p', { style: { color: T.txt1, lineHeight: 1.8, marginBottom: 18, fontSize: '0.9375rem' } },
            'The Speedy Indexer REST API gives you programmatic access to all indexing capabilities — submit URLs, check job status, monitor quotas, and manage projects from any language or platform.'
        ),
        React.createElement('p', { style: { color: T.txt1, lineHeight: 1.8, marginBottom: 28, fontSize: '0.9375rem' } },
            'All API requests must be made over HTTPS. The base URL for all endpoints is:'
        ),
        React.createElement(CodeBlock, { lang: 'Base URL', code: 'https://api.speedyindexer.com/v1' }),
        React.createElement('div', {
            className: 'collapse-on-mobile',
            style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginTop: 28 }
        },
            [['⚡', 'JSON API', 'All requests and responses use JSON'], ['🔒', 'JWT Auth', 'Secure token-based authentication'], ['🔄', 'Rate Limited', 'Per-plan limits with 429 responses']].map(function ([icon, title, desc]) {
                return React.createElement('div', {
                    key: title, style: { padding: '18px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12 }
                },
                    React.createElement('div', { style: { fontSize: 24, marginBottom: 10 } }, icon),
                    React.createElement('div', { style: { fontSize: '0.875rem', fontWeight: 700, color: T.txt0, marginBottom: 5, fontFamily: T.font } }, title),
                    React.createElement('div', { style: { fontSize: '0.8125rem', color: T.txt2 } }, desc)
                );
            })
        )
    );
}

function SectionAuth() {
    return React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 14, fontFamily: T.font } }, 'Authentication'),
        React.createElement('p', { style: { color: T.txt1, lineHeight: 1.8, marginBottom: 20 } },
            'All API requests require a valid API key passed in the Authorization header. Generate your key from the API Keys section of the dashboard.'
        ),
        React.createElement(CodeBlock, {
            lang: 'bash',
            code:
                `# Include in every request
Authorization: Bearer ifai_live_YOUR_API_KEY_HERE

# Example with curl
curl https://api.speedyindexer.com/v1/quota \\
  -H "Authorization: Bearer ifai_live_x9K2mNpQr4tYvWz8aB"`
        }),
        React.createElement('div', { style: { marginTop: 22 } },
            React.createElement('div', { style: { padding: '16px 18px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, fontSize: '0.875rem', color: T.amber, lineHeight: 1.7 } },
                '⚠️ Never expose your API key in client-side code, public repositories, or browser JavaScript. Always make API requests from your server.'
            )
        )
    );
}

function SectionSubmit() {
    return React.createElement('div', null,
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 } },
            React.createElement(MethodBadge, { method: 'POST' }),
            React.createElement('code', { style: { fontSize: '1rem', fontFamily: T.mono, color: T.txt1 } }, '/v1/submit')
        ),
        React.createElement('h2', { style: { fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 14, fontFamily: T.font } }, 'Submit URLs'),
        React.createElement('p', { style: { color: T.txt1, lineHeight: 1.8, marginBottom: 24 } },
            'Submit one or more URLs for indexing. Each URL will be queued and processed via your selected channels (Google API, IndexNow, Sitemap ping, RSS signal).'
        ),

        // Request params
        React.createElement('h3', { style: { fontSize: '1rem', fontWeight: 700, marginBottom: 14, fontFamily: T.font, color: T.txt0 } }, 'Request Parameters'),
        React.createElement('div', { style: { border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 28 } },
            React.createElement('div', {
                className: 'collapse-on-mobile',
                style: { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 0.6fr 2fr', gap: 16, padding: '10px 18px', background: 'rgba(255,255,255,0.03)', borderBottom: `1px solid ${T.border}`, fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em', color: T.txt2, textTransform: 'uppercase' }
            }, 'Parameter', 'Type', 'Required', 'Description'),
            React.createElement(ParamRow, { name: 'urls', type: 'array', required: true, desc: 'Array of URLs to submit. Max 10,000 per request.' }),
            React.createElement(ParamRow, { name: 'method', type: 'string', required: false, desc: 'Indexing channel: "google", "indexnow", "sitemap", "rss", or "all". Default: "all"' }),
            React.createElement(ParamRow, { name: 'priority', type: 'string', required: false, desc: 'Queue priority: "low", "normal", "high", "urgent". Default: "normal"' }),
            React.createElement(ParamRow, { name: 'project', type: 'string', required: false, desc: 'Project slug to associate this batch with.' }),
            React.createElement(ParamRow, { name: 'drip', type: 'integer', required: false, desc: 'Drip-feed rate in URLs/hour. Omit for immediate processing.' }),
        ),

        // Request example
        React.createElement('h3', { style: { fontSize: '1rem', fontWeight: 700, marginBottom: 14, fontFamily: T.font, color: T.txt0 } }, 'Request Example'),
        React.createElement(CodeBlock, {
            lang: 'bash',
            code:
                `curl -X POST https://api.speedyindexer.com/v1/submit \\
  -H "Authorization: Bearer ifai_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "urls": [
      "https://yoursite.com/blog/new-post",
      "https://yoursite.com/products/widget-v2"
    ],
    "method": "all",
    "priority": "high",
    "project": "my-blog"
  }'`
        }),

        // Response
        React.createElement('h3', { style: { fontSize: '1rem', fontWeight: 700, margin: '28px 0 14px', fontFamily: T.font, color: T.txt0 } }, 'Response'),
        React.createElement(CodeBlock, {
            lang: 'json',
            code:
                `{
  "job_id": "job_x9K2mNpQr4tYvWz8",
  "queued": 2,
  "method": "all",
  "priority": "high",
  "estimated_time": "< 2 minutes",
  "status": "queued",
  "created_at": "2025-05-14T09:22:11.000Z"
}`
        })
    );
}

function SectionStatus() {
    return React.createElement('div', null,
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 } },
            React.createElement(MethodBadge, { method: 'GET' }),
            React.createElement('code', { style: { fontSize: '1rem', fontFamily: T.mono, color: T.txt1 } }, '/v1/jobs/:job_id')
        ),
        React.createElement('h2', { style: { fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 14, fontFamily: T.font } }, 'Job Status'),
        React.createElement('p', { style: { color: T.txt1, lineHeight: 1.8, marginBottom: 24 } }, 'Retrieve the current status and per-URL results for a previously submitted indexing job.'),
        React.createElement(CodeBlock, {
            lang: 'bash',
            code: 'curl https://api.speedyindexer.com/v1/jobs/job_x9K2mNpQr4tYvWz8 \\\n  -H "Authorization: Bearer ifai_live_YOUR_KEY"'
        }),
        React.createElement('h3', { style: { fontSize: '1rem', fontWeight: 700, margin: '28px 0 14px', fontFamily: T.font, color: T.txt0 } }, 'Response'),
        React.createElement(CodeBlock, {
            lang: 'json',
            code:
                `{
  "job_id": "job_x9K2mNpQr4tYvWz8",
  "status": "completed",
  "total": 2,
  "indexed": 2,
  "failed": 0,
  "pending": 0,
  "results": [
    {
      "url": "https://yoursite.com/blog/new-post",
      "status": "indexed",
      "method": "google",
      "indexed_at": "2025-05-14T09:24:05.000Z"
    },
    {
      "url": "https://yoursite.com/products/widget-v2",
      "status": "indexed",
      "method": "indexnow",
      "indexed_at": "2025-05-14T09:23:58.000Z"
    }
  ]
}`
        })
    );
}

function SectionErrors() {
    const codes = [
        { code: '400', title: 'Bad Request', desc: 'Invalid request body or missing required parameters.' },
        { code: '401', title: 'Unauthorized', desc: 'Missing or invalid API key in the Authorization header.' },
        { code: '403', title: 'Forbidden', desc: 'Your plan does not include access to this endpoint or feature.' },
        { code: '404', title: 'Not Found', desc: 'The requested resource (job_id, project slug, etc.) does not exist.' },
        { code: '422', title: 'Unprocessable', desc: 'URL validation failed — one or more submitted URLs are malformed.' },
        { code: '429', title: 'Rate Limited', desc: 'You have exceeded your plan\'s request rate. Check the Retry-After header.' },
        { code: '500', title: 'Server Error', desc: 'Unexpected server error. Contact support if this persists.' },
    ];
    const codeColors = { '400': T.amber, '401': T.red, '403': T.red, '404': T.txt2, '422': T.amber, '429': T.amber, '500': T.red };

    return React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 14, fontFamily: T.font } }, 'Error Codes'),
        React.createElement('p', { style: { color: T.txt1, lineHeight: 1.8, marginBottom: 24 } }, 'All errors follow a consistent JSON structure with a machine-readable code and a human-readable message.'),
        React.createElement(CodeBlock, {
            lang: 'json',
            code:
                `{
  "error": {
    "code": "rate_limited",
    "message": "Too many requests. Your plan allows 60 req/min.",
    "retry_after": 12
  }
}`
        }),
        React.createElement('div', { style: { border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden', marginTop: 24 } },
            codes.map(function (e, i) {
                return React.createElement('div', {
                    key: e.code,
                    className: 'collapse-on-mobile',
                    style: { display: 'grid', gridTemplateColumns: '80px 1fr 3fr', gap: 16, padding: '13px 18px', borderBottom: i < codes.length - 1 ? `1px solid rgba(255,255,255,0.04)` : 'none', alignItems: 'center', fontSize: '0.875rem' }
                },
                    React.createElement('span', { style: { fontFamily: T.mono, fontWeight: 700, color: codeColors[e.code] || T.txt1 } }, e.code),
                    React.createElement('span', { style: { fontWeight: 600, color: T.txt0, fontFamily: T.font } }, e.title),
                    React.createElement('span', { style: { color: T.txt2 } }, e.desc)
                );
            })
        )
    );
}

function SectionWebhooks() {
    return React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 14, fontFamily: T.font } }, 'Webhooks'),
        React.createElement('p', { style: { color: T.txt1, lineHeight: 1.8, marginBottom: 24 } },
            'Register a webhook URL in your dashboard settings to receive real-time POST notifications when indexing jobs complete, fail, or hit quota limits.'
        ),
        React.createElement(CodeBlock, {
            lang: 'json — Webhook Payload',
            code:
                `{
  "event": "job.completed",
  "job_id": "job_x9K2mNpQr4tYvWz8",
  "timestamp": "2025-05-14T09:24:05.000Z",
  "data": {
    "total": 50,
    "indexed": 48,
    "failed": 2,
    "duration_ms": 14200
  }
}`
        }),
        React.createElement('div', { style: { marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 } },
            ['job.completed', 'job.failed', 'job.quota_warning', 'url.indexed', 'url.failed'].map(function (evt) {
                return React.createElement('div', {
                    key: evt, style: { display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10 }
                },
                    React.createElement('div', { style: { width: 8, height: 8, borderRadius: '50%', background: T.cyan, flexShrink: 0 } }),
                    React.createElement('code', { style: { fontSize: '0.8125rem', fontFamily: T.mono, color: T.cyan, flex: 1 } }, evt),
                    React.createElement('span', { style: { fontSize: '0.75rem', color: T.txt2, fontFamily: T.font } },
                        evt.includes('completed') ? 'When all URLs in a job finish' :
                            evt.includes('failed') ? 'When a job or URL fails permanently' :
                                evt.includes('quota') ? 'When usage hits 80% of daily limit' :
                                    evt.includes('indexed') ? 'Per-URL success event' : 'Per-URL failure event'
                    )
                );
            })
        )
    );
}

function SectionSDKs() {
    const sdks = [
        { lang: 'Node.js', icon: '📦', pkg: 'npm install @speedyindexer/sdk', cmd: 'const Speedy Indexer = require("@speedyindexer/sdk");\nconst client = new Speedy Indexer("YOUR_API_KEY");\nawait client.submit(["https://site.com/page"]);', color: T.green },
        { lang: 'Python', icon: '🐍', pkg: 'pip install speedyindexer', cmd: 'from speedyindexer import Speedy Indexer\nclient = Speedy Indexer("YOUR_API_KEY")\nclient.submit(["https://site.com/page"])', color: T.blue },
        { lang: 'PHP', icon: '🐘', pkg: 'composer require speedyindexer/sdk', cmd: '$client = new Speedy Indexer("YOUR_API_KEY");\n$client->submit(["https://site.com/page"]);', color: T.purple },
    ];
    return React.createElement('div', null,
        React.createElement('h2', { style: { fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 14, fontFamily: T.font } }, 'SDKs & Libraries'),
        React.createElement('p', { style: { color: T.txt1, lineHeight: 1.8, marginBottom: 28 } }, 'Official SDKs for popular languages, with more coming soon.'),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 18 } },
            sdks.map(function (sdk) {
                return React.createElement('div', {
                    key: sdk.lang, style: { border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden' }
                },
                    React.createElement('div', {
                        style: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', background: 'rgba(255,255,255,0.03)', borderBottom: `1px solid ${T.border}` }
                    },
                        React.createElement('span', { style: { fontSize: 20 } }, sdk.icon),
                        React.createElement('span', { style: { fontSize: '0.9rem', fontWeight: 700, color: sdk.color, fontFamily: T.font } }, sdk.lang),
                        React.createElement('code', { style: { marginLeft: 'auto', fontSize: '0.75rem', fontFamily: T.mono, color: T.txt2, background: 'rgba(255,255,255,0.05)', padding: '3px 10px', borderRadius: 6 } }, sdk.pkg)
                    ),
                    React.createElement(CodeBlock, { lang: sdk.lang.toLowerCase(), code: sdk.cmd })
                );
            })
        )
    );
}

/* ─────────────────────────────────────────
   RATE LIMITS TABLE
───────────────────────────────────────── */
function RateLimits() {
    return React.createElement('div', { style: { marginTop: 32 } },
        React.createElement('h3', { style: { fontSize: '1rem', fontWeight: 700, marginBottom: 16, fontFamily: T.font, color: T.txt0 } }, 'Credit Packs'),
        React.createElement('div', { style: { border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' } },
            React.createElement('div', {
                className: 'collapse-on-mobile',
                style: { display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', background: 'rgba(255,255,255,0.04)', borderBottom: `1px solid ${T.border}` }
            },
                ['Pack', 'Credits', 'Price', 'Batch Size', 'History'].map(function (h) {
                    return React.createElement('div', { key: h, style: { padding: '10px 14px', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em', color: T.txt2, textTransform: 'uppercase', fontFamily: T.font } }, h);
                })
            ),
            [
                { plan: 'Starter', urls: '40', rpm: '$3', batch: '40', hist: 'Never expires', col: '#3b82f6' },
                { plan: 'Basic', urls: '250', rpm: '$12', batch: '250', hist: 'Never expires', col: T.green },
                { plan: 'Pro', urls: '1,000', rpm: '$45', batch: '1,000', hist: 'Never expires', col: T.cyan },
                { plan: 'Growth', urls: '2,000', rpm: '$87', batch: '2,000', hist: 'Never expires', col: T.purple },
                { plan: 'Agency', urls: '5,000', rpm: '$199', batch: '5,000', hist: 'Never expires', col: T.amber },
                { plan: 'Enterprise', urls: '15,000', rpm: '$350', batch: '15,000', hist: 'Never expires', col: T.red },
            ].map(function (r, i) {
                return React.createElement('div', {
                    key: r.plan,
                    className: 'collapse-on-mobile',
                    className: 'collapse-on-mobile',
                    style: { display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', borderTop: `1px solid ${T.border}` }
                },
                    React.createElement('div', { style: { padding: '12px 14px', fontWeight: 700, color: r.col, fontFamily: T.font, fontSize: '0.875rem' } }, r.plan),
                    ...[r.urls, r.rpm, r.batch, r.hist].map(function (v, j) {
                        return React.createElement('div', { key: j, style: { padding: '12px 14px', fontFamily: T.mono, fontSize: '0.8125rem', color: T.txt1 } }, v);
                    })
                );
            })
        )
    );
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
const SECTION_CONTENT = {
    intro: function () { return React.createElement(SectionIntro); },
    auth: function () { return React.createElement(SectionAuth); },
    submit: function () { return React.createElement(SectionSubmit); },
    status: function () { return React.createElement(SectionStatus); },
    history: function () { return React.createElement('div', null, React.createElement('h2', { style: { fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 14, fontFamily: T.font } }, 'URL History'), React.createElement('p', { style: { color: T.txt1, lineHeight: 1.8 } }, 'Retrieve paginated history of all submitted URLs with filtering by status, project, and date range.')); },
    quota: function () { return React.createElement('div', null, React.createElement('h2', { style: { fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 14, fontFamily: T.font } }, 'Quota Usage'), React.createElement('p', { style: { color: T.txt1, lineHeight: 1.8, marginBottom: 24 } }, 'Check your current API usage and remaining quota for today.'), React.createElement(CodeBlock, { lang: 'bash', code: 'curl https://api.speedyindexer.com/v1/quota \\\n  -H "Authorization: Bearer ifai_live_YOUR_KEY"' }), React.createElement(RateLimits)); },
    projects: function () { return React.createElement('div', null, React.createElement('h2', { style: { fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 14, fontFamily: T.font } }, 'Projects'), React.createElement('p', { style: { color: T.txt1, lineHeight: 1.8 } }, 'List, create, and manage projects via the API.')); },
    webhooks: function () { return React.createElement(SectionWebhooks); },
    errors: function () { return React.createElement(SectionErrors); },
    sdks: function () { return React.createElement(SectionSDKs); },
};

export default function ApiDocsPage() {
    const [active, setActive] = useState('intro');
    const Content = SECTION_CONTENT[active] || SECTION_CONTENT.intro;

    return React.createElement('div', { style: { background: T.bg, minHeight: '100vh' } },
        React.createElement(Navbar),

        // Hero strip
        React.createElement('div', {
            style: { padding: '60px 24px 40px', textAlign: 'center', borderBottom: `1px solid ${T.border}`, position: 'relative', overflow: 'hidden' }
        },
            React.createElement('div', { style: { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% -10%,rgba(0,212,255,0.1) 0%,transparent 60%)', pointerEvents: 'none' } }),
            React.createElement('div', { style: { position: 'relative' } },
                React.createElement('div', { style: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 9999, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', fontSize: '0.75rem', fontWeight: 700, color: T.cyan, fontFamily: T.font, marginBottom: 18 } },
                    'v1 API'
                ),
                React.createElement('h1', { style: { fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 14, fontFamily: T.font } },
                    'API ', React.createElement(GradText, null, 'Documentation')
                ),
                React.createElement('p', { style: { color: T.txt1, fontSize: '1rem', maxWidth: 500, margin: '0 auto', fontFamily: T.font } },
                    'Everything you need to integrate Speedy Indexer into your stack.'
                )
            )
        ),

        // Docs layout
        React.createElement('div', {
            className: 'collapse-on-mobile',
            style: { maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 40, paddingTop: 40, paddingBottom: 80 }
        },
            // Left sidebar
            React.createElement('aside', { style: { position: 'sticky', top: 90, alignSelf: 'start', height: 'fit-content' } },
                React.createElement('div', { style: { fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em', color: T.txt2, textTransform: 'uppercase', fontFamily: T.font, marginBottom: 12, padding: '0 10px' } }, 'Documentation'),
                React.createElement('nav', { style: { display: 'flex', flexDirection: 'column', gap: 2 } },
                    DOC_SECTIONS.map(function (sec) {
                        const isActive = active === sec.id;
                        return React.createElement('button', {
                            key: sec.id,
                            onClick: function () { setActive(sec.id); },
                            style: {
                                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                                borderRadius: 10, background: 'none', border: `1px solid ${isActive ? 'rgba(0,212,255,0.2)' : 'transparent'}`,
                                cursor: 'pointer', fontFamily: T.font, fontSize: '0.875rem', fontWeight: 500,
                                color: isActive ? T.cyan : T.txt1,
                                background: isActive ? 'rgba(0,212,255,0.07)' : 'transparent',
                                textAlign: 'left', width: '100%',
                                transition: 'all 0.18s',
                            },
                            onMouseEnter: function (e) { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = T.txt0; } },
                            onMouseLeave: function (e) { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.txt1; } },
                        },
                            sec.method && React.createElement(MethodBadge, { method: sec.method }),
                            sec.label
                        );
                    })
                ),

                // API Key CTA
                React.createElement('div', {
                    style: { marginTop: 28, padding: '16px', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 12 }
                },
                    React.createElement('div', { style: { fontSize: '0.875rem', fontWeight: 700, color: T.cyan, marginBottom: 8, fontFamily: T.font } }, '🔑 Get API Key'),
                    React.createElement('p', { style: { fontSize: '0.75rem', color: T.txt2, marginBottom: 12, lineHeight: 1.6 } }, 'Create an account to get your API key instantly.'),
                    React.createElement(Link, {
                        href: '/signup',
                        style: { display: 'block', textAlign: 'center', padding: '8px 14px', borderRadius: 9, background: grad, color: '#fff', fontSize: '0.8125rem', fontWeight: 700, fontFamily: T.font, textDecoration: 'none' }
                    }, 'Get Started →')
                )
            ),

            // Main content
            React.createElement('main', {
                style: { minHeight: 600, lineHeight: 1.7 }
            },
                React.createElement(Content)
            )
        )
    );
}
