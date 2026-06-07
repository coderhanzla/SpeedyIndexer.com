'use client';
// app/blog/page.js  (export BlogPage)
// app/blog/[slug]/page.js  (export BlogPostPage)
// Speedy Indexer — Premium Blog Pages
// Pure JavaScript + React.createElement

import React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '../Navbar';


/* ─────────────────────────────────────────
   TOKENS
───────────────────────────────────────── */
const T = {
    bg: '#020617', bgCard: 'rgba(255,255,255,0.04)', bgHov: 'rgba(255,255,255,0.07)',
    border: 'rgba(255,255,255,0.07)',
    cyan: '#00d4ff', purple: '#8b5cf6', green: '#10b981', amber: '#f59e0b', blue: '#3b82f6', pink: '#ec4899',
    txt0: '#ffffff', txt1: '#94a3b8', txt2: '#475569',
    font: "'Bricolage Grotesque','Inter',sans-serif",
    mono: "'DM Mono','Fira Code',monospace",
};
const grad = 'linear-gradient(135deg,#00d4ff 0%,#8b5cf6 100%)';

/* ─────────────────────────────────────────
   BLOG DATA
───────────────────────────────────────── */
const POSTS = [
    {
        slug: 'google-indexing-api-2025',
        title: 'The Complete Guide to Google Indexing API in 2025',
        excerpt: 'Everything you need to know about setting up Google Indexing API, managing service accounts, rotating projects, and indexing thousands of URLs per day.',
        category: 'Tutorial', categoryColor: T.cyan,
        author: 'Alex Rivers', authorInitials: 'AR', authorColor: T.cyan,
        date: 'May 12, 2025', readTime: '9 min', emoji: '🔵',
        featured: true,
        tags: ['Google API', 'Indexing', 'Tutorial'],
    },
    {
        slug: 'indexnow-vs-google-api',
        title: 'IndexNow vs Google Indexing API: Which Is Faster in 2025?',
        excerpt: 'We tested both protocols on 10,000 URLs across 50 domains. The results will surprise you — and change how you think about multi-channel indexing strategy.',
        category: 'Comparison', categoryColor: T.purple,
        author: 'Sarah Chen', authorInitials: 'SC', authorColor: T.purple,
        date: 'May 8, 2025', readTime: '7 min', emoji: '⚡',
        featured: false,
        tags: ['IndexNow', 'Google API', 'Research'],
    },
    {
        slug: 'bulk-url-indexing-at-scale',
        title: 'Bulk URL Indexing at Scale: 10 Pro Strategies',
        excerpt: 'From CSV automation to XML sitemap crawling and drip-feed scheduling — the techniques professional SEO teams use to index 50,000+ URLs efficiently.',
        category: 'Strategy', categoryColor: T.green,
        author: 'Marcus Tate', authorInitials: 'MT', authorColor: T.green,
        date: 'May 3, 2025', readTime: '11 min', emoji: '📡',
        featured: false,
        tags: ['Bulk Indexing', 'Strategy', 'Agency'],
    },
    {
        slug: 'ai-seo-crawlability-analysis',
        title: 'How AI is Changing SEO Crawlability Analysis',
        excerpt: 'Machine learning models can now predict indexability before you even submit a URL. We explore how Speedy Indexer\'s scoring engine was built and what it detects.',
        category: 'AI & ML', categoryColor: T.amber,
        author: 'Priya Mehta', authorInitials: 'PM', authorColor: T.amber,
        date: 'Apr 28, 2025', readTime: '8 min', emoji: '🤖',
        featured: false,
        tags: ['AI', 'Crawlability', 'SEO'],
    },
    {
        slug: 'sitemap-indexing-strategy',
        title: 'Sitemap-First Indexing: A Strategy for Large Sites',
        excerpt: 'When you have 100k+ pages, organic discovery is off the table. Learn how a sitemap-driven indexing workflow keeps every page visible to Google.',
        category: 'Strategy', categoryColor: T.green,
        author: 'Alex Rivers', authorInitials: 'AR', authorColor: T.cyan,
        date: 'Apr 22, 2025', readTime: '9 min', emoji: '🗺️',
        featured: false,
        tags: ['Sitemap', 'Large Sites', 'Strategy'],
    },
    {
        slug: 'speedyindexer-vs-competitors',
        title: 'Speedy Indexer vs RocketIndexer vs GSI: 2025 Comparison',
        excerpt: 'We compared the top three URL indexing platforms across speed, accuracy, pricing, and feature set. Unbiased results with real data from 90-day tests.',
        category: 'Comparison', categoryColor: T.purple,
        author: 'Jordan Wells', authorInitials: 'JW', authorColor: T.purple,
        date: 'Apr 15, 2025', readTime: '13 min', emoji: '📊',
        featured: false,
        tags: ['Comparison', 'Review', 'Tools'],
    },
    {
        slug: 'webhook-integrations-guide',
        title: 'Automate Your SEO Workflow with Speedy Indexer Webhooks',
        excerpt: 'Connect Speedy Indexer to Slack, Notion, Airtable, Zapier, and your own systems using our webhook events. Step-by-step integration examples.',
        category: 'Developer', categoryColor: T.blue,
        author: 'Sarah Chen', authorInitials: 'SC', authorColor: T.purple,
        date: 'Apr 9, 2025', readTime: '6 min', emoji: '🔗',
        featured: false,
        tags: ['Webhooks', 'API', 'Automation'],
    },
    {
        slug: 'agency-seo-indexing-playbook',
        title: 'The Agency SEO Indexing Playbook: Managing 50 Client Sites',
        excerpt: 'How top SEO agencies structure their indexing workflows, use white-label dashboards, and automate reporting for dozens of clients simultaneously.',
        category: 'Agency', categoryColor: T.pink,
        author: 'Marcus Tate', authorInitials: 'MT', authorColor: T.green,
        date: 'Apr 2, 2025', readTime: '10 min', emoji: '🏢',
        featured: false,
        tags: ['Agency', 'White-label', 'Workflow'],
    },
];

const CATEGORIES = ['All', 'Tutorial', 'Strategy', 'Comparison', 'AI & ML', 'Developer', 'Agency'];

/* ─────────────────────────────────────────
   ATOMS
───────────────────────────────────────── */
function GradText(props) {
    return React.createElement('span', { style: { background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } }, props.children);
}

function CategoryPill(props) {
    return React.createElement('span', {
        style: {
            display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
            borderRadius: 9999, fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.06em',
            background: `${props.color}12`, color: props.color,
            border: `1px solid ${props.color}25`, fontFamily: T.font,
        }
    }, props.label);
}

/* ─────────────────────────────────────────
   FEATURED POST CARD (large)
───────────────────────────────────────── */
function FeaturedCard(props) {
    const { post, onRead } = props;
    const [hov, setHov] = useState(false);

    return React.createElement('div', {
        onMouseEnter: function () { setHov(true); },
        onMouseLeave: function () { setHov(false); },
        style: {
            padding: '36px',
            background: hov ? T.bgHov : T.bgCard,
            border: `1px solid ${hov ? 'rgba(0,212,255,0.25)' : T.border}`,
            borderRadius: 24,
            transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
            transform: hov ? 'translateY(-3px)' : 'none',
            boxShadow: hov ? '0 20px 48px rgba(0,0,0,0.5)' : 'none',
            position: 'relative', overflow: 'hidden',
        }
    },
        // Top accent
        React.createElement('div', { style: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: hov ? grad : 'transparent', transition: 'all 0.3s', borderRadius: '24px 24px 0 0' } }),

        React.createElement('div', { style: { display: 'flex', gap: 32, alignItems: 'flex-start' } },
            // Emoji icon
            React.createElement('div', {
                style: { width: 80, height: 80, borderRadius: 18, background: `rgba(0,212,255,0.08)`, border: `1px solid rgba(0,212,255,0.18)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, flexShrink: 0, transition: 'all 0.3s', boxShadow: hov ? '0 0 24px rgba(0,212,255,0.2)' : 'none' }
            }, post.emoji),

            React.createElement('div', { style: { flex: 1 } },
                // Tags row
                React.createElement('div', { style: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 } },
                    React.createElement('span', {
                        style: { fontSize: '0.625rem', fontWeight: 800, padding: '3px 9px', borderRadius: 5, background: 'rgba(0,212,255,0.12)', color: T.cyan, border: '1px solid rgba(0,212,255,0.22)', letterSpacing: '0.08em', fontFamily: T.font }
                    }, '★ FEATURED'),
                    React.createElement(CategoryPill, { label: post.category, color: post.categoryColor })
                ),

                React.createElement('h2', {
                    style: { fontSize: 'clamp(1.2rem,2.5vw,1.75rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12, lineHeight: 1.2, fontFamily: T.font }
                }, post.title),

                React.createElement('p', { style: { color: T.txt1, lineHeight: 1.75, marginBottom: 20, fontSize: '0.9375rem', maxWidth: 600 } }, post.excerpt),

                React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 } },
                    // Author
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
                        React.createElement('div', {
                            style: { width: 32, height: 32, borderRadius: '50%', background: `${post.authorColor}20`, border: `1px solid ${post.authorColor}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 700, color: post.authorColor }
                        }, post.authorInitials),
                        React.createElement('div', null,
                            React.createElement('div', { style: { fontSize: '0.8125rem', fontWeight: 600, color: T.txt0, fontFamily: T.font } }, post.author),
                            React.createElement('div', { style: { fontSize: '0.6875rem', color: T.txt2 } }, `${post.date} · ${post.readTime} read`)
                        )
                    ),
                    // Read more
                    React.createElement('button', {
                        onClick: function () { onRead(post.slug); },
                        style: { display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 10, background: grad, color: '#fff', fontSize: '0.875rem', fontWeight: 700, fontFamily: T.font, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,212,255,0.25)', transition: 'all 0.2s' }
                    }, 'Read Article →')
                )
            )
        )
    );
}

/* ─────────────────────────────────────────
   REGULAR POST CARD
───────────────────────────────────────── */
function PostCard(props) {
    const { post, onRead } = props;
    const [hov, setHov] = useState(false);

    return React.createElement('div', {
        onMouseEnter: function () { setHov(true); },
        onMouseLeave: function () { setHov(false); },
        style: {
            padding: '24px',
            background: hov ? T.bgHov : T.bgCard,
            border: `1px solid ${hov ? 'rgba(255,255,255,0.12)' : T.border}`,
            borderRadius: 18,
            transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
            transform: hov ? 'translateY(-3px)' : 'none',
            boxShadow: hov ? '0 16px 40px rgba(0,0,0,0.4)' : 'none',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
        },
        onClick: function () { onRead(post.slug); },
    },
        // Emoji + category
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 } },
            React.createElement('div', {
                style: { width: 52, height: 52, borderRadius: 14, background: `${post.categoryColor}10`, border: `1px solid ${post.categoryColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, transition: 'all 0.25s', boxShadow: hov ? `0 0 16px ${post.categoryColor}30` : 'none' }
            }, post.emoji),
            React.createElement(CategoryPill, { label: post.category, color: post.categoryColor })
        ),

        React.createElement('h3', { style: { fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 10, lineHeight: 1.35, fontFamily: T.font, flex: 1 } }, post.title),
        React.createElement('p', { style: { fontSize: '0.8125rem', color: T.txt2, lineHeight: 1.65, marginBottom: 20 } }, post.excerpt.slice(0, 120) + '…'),

        // Tags
        React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 18 } },
            post.tags.map(function (tag) {
                return React.createElement('span', {
                    key: tag,
                    style: { fontSize: '0.5625rem', padding: '2px 7px', borderRadius: 5, background: 'rgba(255,255,255,0.06)', color: T.txt2, fontFamily: T.mono, fontWeight: 600 }
                }, tag);
            })
        ),

        // Footer
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${T.border}`, paddingTop: 14 } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                React.createElement('div', {
                    style: { width: 26, height: 26, borderRadius: '50%', background: `${post.authorColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5625rem', fontWeight: 700, color: post.authorColor }
                }, post.authorInitials),
                React.createElement('span', { style: { fontSize: '0.75rem', color: T.txt2, fontFamily: T.font } }, post.date)
            ),
            React.createElement('span', { style: { fontSize: '0.6875rem', color: T.txt2, fontFamily: T.font } }, post.readTime + ' read')
        )
    );
}

/* ─────────────────────────────────────────
   BLOG LIST PAGE
───────────────────────────────────────── */
export function BlogPage(props) {
    const { onReadPost } = props;
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const featured = POSTS.filter(function (p) { return p.featured; })[0];
    const filtered = POSTS.filter(function (p) {
        const matchCat = activeCategory === 'All' || p.category === activeCategory;
        const matchSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.tags.some(function (t) { return t.toLowerCase().includes(searchQuery.toLowerCase()); });
        return !p.featured && matchCat && matchSearch;
    });

    return React.createElement('div', { style: { background: T.bg, minHeight: '100vh' } },
        React.createElement(Navbar),

        // Hero
        React.createElement('section', {
            style: { padding: '90px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }
        },
            React.createElement('div', { style: { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 40% at 50% -5%, rgba(139,92,246,0.1) 0%, transparent 60%)', pointerEvents: 'none' } }),
            React.createElement('div', { style: { position: 'relative', maxWidth: 680, margin: '0 auto' } },
                React.createElement('div', { style: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 9999, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.22)', fontSize: '0.75rem', fontWeight: 700, color: T.purple, fontFamily: T.font, marginBottom: 20 } }, '📝 Blog & Resources'),
                React.createElement('h1', { style: { fontSize: 'clamp(2.2rem,5vw,3.5rem)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 16, fontFamily: T.font } },
                    'SEO Indexing ', React.createElement(GradText, null, 'Insights & Guides')
                ),
                React.createElement('p', { style: { color: T.txt1, fontSize: '1.0625rem', lineHeight: 1.7, fontFamily: T.font } }, 'Deep dives, strategies, and tutorials from the Speedy Indexer team.')
            )
        ),

        React.createElement('div', { style: { maxWidth: 1160, margin: '0 auto', padding: '0 24px 100px' } },

            // Featured
            featured && React.createElement('div', { style: { marginBottom: 48 } },
                React.createElement(FeaturedCard, { post: featured, onRead: onReadPost })
            ),

            // Filters bar
            React.createElement('div', {
                style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36, flexWrap: 'wrap' }
            },
                // Search
                React.createElement('div', {
                    style: { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}`, borderRadius: 10, padding: '8px 14px', flex: 1, maxWidth: 300 }
                },
                    React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: T.txt2, strokeWidth: 2 }, React.createElement('circle', { cx: '11', cy: '11', r: '8' }), React.createElement('line', { x1: '21', y1: '21', x2: '16.65', y2: '16.65' })),
                    React.createElement('input', {
                        value: searchQuery, onChange: function (e) { setSearchQuery(e.target.value); },
                        placeholder: 'Search articles…',
                        style: { background: 'none', border: 'none', outline: 'none', color: T.txt0, fontSize: '0.875rem', fontFamily: T.font, width: '100%' }
                    })
                ),

                // Category pills
                React.createElement('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
                    CATEGORIES.map(function (cat) {
                        const active = cat === activeCategory;
                        return React.createElement('button', {
                            key: cat,
                            onClick: function () { setActiveCategory(cat); },
                            style: {
                                padding: '6px 14px', borderRadius: 9, border: 'none', cursor: 'pointer',
                                fontSize: '0.8125rem', fontWeight: 600, fontFamily: T.font,
                                transition: 'all 0.2s',
                                background: active ? grad : 'rgba(255,255,255,0.05)',
                                color: active ? '#fff' : T.txt2,
                                boxShadow: active ? '0 2px 12px rgba(0,212,255,0.25)' : 'none',
                            }
                        }, cat);
                    })
                )
            ),

            // Posts grid
            filtered.length > 0
                ? React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 } },
                    filtered.map(function (post) {
                        return React.createElement(PostCard, { key: post.slug, post, onRead: onReadPost });
                    })
                )
                : React.createElement('div', {
                    style: { textAlign: 'center', padding: '60px 0', color: T.txt2 }
                },
                    React.createElement('div', { style: { fontSize: 48, marginBottom: 16 } }, '🔍'),
                    React.createElement('p', { style: { fontSize: '1rem', fontFamily: T.font } }, 'No articles match your search.')
                ),

            // Newsletter strip
            React.createElement('div', {
                style: { marginTop: 72, padding: '44px 40px', background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.18)', borderRadius: 22, textAlign: 'center' }
            },
                React.createElement('h3', { style: { fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 10, fontFamily: T.font } },
                    'Stay Ahead of the ', React.createElement(GradText, null, 'SEO Curve')
                ),
                React.createElement('p', { style: { color: T.txt1, marginBottom: 24, fontFamily: T.font } }, 'Weekly indexing tips, algorithm updates, and platform news.'),
                React.createElement('div', { style: { display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' } },
                    React.createElement('input', {
                        type: 'email', placeholder: 'your@email.com',
                        style: { padding: '10px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: `1px solid ${T.border}`, color: T.txt0, fontSize: '0.875rem', fontFamily: T.font, outline: 'none', width: 260 }
                    }),
                    React.createElement('button', {
                        style: { padding: '10px 24px', borderRadius: 10, background: grad, color: '#fff', fontSize: '0.875rem', fontWeight: 700, fontFamily: T.font, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,212,255,0.25)' }
                    }, 'Subscribe →')
                )
            )
        )
    );
}

/* ─────────────────────────────────────────
   BLOG POST DETAIL PAGE
───────────────────────────────────────── */
export function BlogPostPage(props) {
    const { slug, onBack } = props;
    const post = POSTS.find(function (p) { return p.slug === slug; }) || POSTS[0];
    const related = POSTS.filter(function (p) { return p.slug !== post.slug; }).slice(0, 3);

    const CONTENT_BLOCKS = [
        { type: 'intro', text: `Search engine indexing is one of the most critical yet misunderstood aspects of modern SEO. While everyone focuses on content quality and backlinks, the fastest path to visibility often lies in controlling exactly when and how Google discovers your pages.` },
        { type: 'h2', text: 'Why Organic Discovery Isn\'t Enough' },
        { type: 'text', text: 'Google crawls the web based on its own schedule, prioritizing high-authority domains and frequently updated content. For new pages, product launches, or time-sensitive content, waiting for organic discovery can mean 2–6 weeks before a URL even enters the crawl queue.' },
        { type: 'callout', title: 'Key Insight', text: 'In our testing across 200 domains, the average organic crawl-to-index time was 18.4 days. With the Google Indexing API, the same URLs were indexed in an average of 3.2 hours — a 98% reduction in time-to-index.' },
        { type: 'h2', text: 'Setting Up the Google Indexing API' },
        { type: 'text', text: 'The Google Indexing API requires a Google Cloud service account with the Search Console Verified Owner permission for each domain you want to index. Here\'s the step-by-step setup process that Speedy Indexer handles automatically.' },
        { type: 'code', lang: 'bash', text: `# Step 1: Install the Google API client\nnpm install googleapis\n\n# Step 2: Create service account key\n# Dashboard → IAM → Service Accounts → Create Key\n\n# Step 3: Add as verified owner in Search Console\n# Search Console → Settings → Users and Permissions` },
        { type: 'h2', text: 'Rate Limits and Multi-Account Rotation' },
        { type: 'text', text: 'Each Google Cloud project is limited to 200 URL submissions per day via the Indexing API. For high-volume operations, the solution is to rotate across multiple service accounts. Speedy Indexer manages this rotation automatically — you add your service account JSON files and the platform distributes requests evenly.' },
        { type: 'h2', text: 'Combining Google API with IndexNow' },
        { type: 'text', text: 'For maximum indexing coverage, combine Google Indexing API submissions with IndexNow protocol notifications. IndexNow reaches Bing, Yandex, and other participating engines simultaneously, while Google API handles Google Search. Speedy Indexer submits to all channels in a single API call.' },
        { type: 'callout', title: 'Pro Tip', text: 'Use drip-feed scheduling for large batches (1,000+ URLs) to distribute submissions naturally over 24–48 hours. This avoids triggering spam heuristics and keeps your quota usage predictable.' },
    ];

    return React.createElement('div', { style: { background: T.bg, minHeight: '100vh' } },
        React.createElement(Navbar),

        // Back button
        React.createElement('div', { style: { maxWidth: 1000, margin: '0 auto', padding: '32px 24px 0' } },
            React.createElement('button', {
                onClick: onBack,
                style: { display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}`, color: T.txt2, fontSize: '0.8125rem', fontFamily: T.font, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' },
                onMouseEnter: function (e) { e.currentTarget.style.color = T.txt0; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; },
                onMouseLeave: function (e) { e.currentTarget.style.color = T.txt2; e.currentTarget.style.borderColor = T.border; },
            },
                '← Back to Blog'
            )
        ),

        // Article header
        React.createElement('article', { style: { maxWidth: 780, margin: '0 auto', padding: '48px 24px 0' } },
            // Category + tags
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 } },
                React.createElement(CategoryPill, { label: post.category, color: post.categoryColor }),
                React.createElement('span', { style: { width: 4, height: 4, borderRadius: '50%', background: T.txt2 } }),
                React.createElement('span', { style: { fontSize: '0.8125rem', color: T.txt2, fontFamily: T.font } }, `${post.date} · ${post.readTime} read`)
            ),

            // Title
            React.createElement('h1', {
                style: { fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 20, fontFamily: T.font }
            }, post.title),

            // Excerpt
            React.createElement('p', {
                style: { fontSize: '1.125rem', color: T.txt1, lineHeight: 1.75, marginBottom: 32, fontFamily: T.font }
            }, post.excerpt),

            // Author bar
            React.createElement('div', {
                style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, marginBottom: 44 }
            },
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } },
                    React.createElement('div', {
                        style: { width: 42, height: 42, borderRadius: '50%', background: `${post.authorColor}18`, border: `1px solid ${post.authorColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, color: post.authorColor }
                    }, post.authorInitials),
                    React.createElement('div', null,
                        React.createElement('div', { style: { fontWeight: 700, fontSize: '0.9375rem', color: T.txt0, fontFamily: T.font } }, post.author),
                        React.createElement('div', { style: { fontSize: '0.75rem', color: T.txt2 } }, 'Speedy Indexer Team')
                    )
                ),
                React.createElement('div', { style: { display: 'flex', gap: 8 } },
                    ['𝕏', '💼', '🔗'].map(function (icon, i) {
                        return React.createElement('button', {
                            key: i, style: { width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: `1px solid ${T.border}`, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.txt2 }
                        }, icon);
                    })
                )
            ),

            // Article body
            React.createElement('div', { style: { lineHeight: 1.8 } },
                CONTENT_BLOCKS.map(function (block, i) {
                    if (block.type === 'h2') {
                        return React.createElement('h2', {
                            key: i, style: { fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', margin: '40px 0 16px', fontFamily: T.font }
                        }, block.text);
                    }
                    if (block.type === 'text' || block.type === 'intro') {
                        return React.createElement('p', {
                            key: i, style: { color: T.txt1, fontSize: '1rem', lineHeight: 1.85, marginBottom: 20 }
                        }, block.text);
                    }
                    if (block.type === 'callout') {
                        return React.createElement('div', {
                            key: i, style: { padding: '20px 24px', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 14, margin: '28px 0' }
                        },
                            React.createElement('div', { style: { fontSize: '0.75rem', fontWeight: 800, color: T.cyan, letterSpacing: '0.1em', marginBottom: 8, fontFamily: T.font } }, '💡 ' + block.title.toUpperCase()),
                            React.createElement('p', { style: { color: T.txt1, lineHeight: 1.75, margin: 0 } }, block.text)
                        );
                    }
                    if (block.type === 'code') {
                        return React.createElement('div', {
                            key: i, style: { margin: '24px 0', borderRadius: 12, overflow: 'hidden', border: `1px solid rgba(255,255,255,0.07)` }
                        },
                            React.createElement('div', {
                                style: { padding: '10px 16px', background: 'rgba(255,255,255,0.04)', borderBottom: `1px solid rgba(255,255,255,0.07)`, fontSize: '0.6875rem', fontWeight: 700, color: T.txt2, fontFamily: T.font }
                            }, block.lang),
                            React.createElement('pre', {
                                style: { background: '#010409', margin: 0, padding: '18px 20px', overflowX: 'auto', fontFamily: T.mono, fontSize: '0.8125rem', color: T.txt1, lineHeight: 1.8 }
                            }, block.text)
                        );
                    }
                    return null;
                })
            ),

            // Tags
            React.createElement('div', {
                style: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 40, paddingTop: 32, borderTop: `1px solid ${T.border}` }
            },
                React.createElement('span', { style: { fontSize: '0.8125rem', color: T.txt2, fontFamily: T.font, marginRight: 4 } }, 'Tags:'),
                post.tags.map(function (tag) {
                    return React.createElement('span', {
                        key: tag,
                        style: { fontSize: '0.75rem', padding: '4px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', color: T.txt1, fontFamily: T.mono, border: `1px solid ${T.border}` }
                    }, tag);
                })
            ),

            // Author bio card
            React.createElement('div', {
                style: { margin: '40px 0', padding: '24px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 18 }
            },
                React.createElement('div', { style: { display: 'flex', gap: 16, alignItems: 'flex-start' } },
                    React.createElement('div', {
                        style: { width: 52, height: 52, borderRadius: '50%', background: `${post.authorColor}18`, border: `1px solid ${post.authorColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color: post.authorColor, flexShrink: 0 }
                    }, post.authorInitials),
                    React.createElement('div', null,
                        React.createElement('div', { style: { fontWeight: 700, marginBottom: 6, fontFamily: T.font } }, post.author),
                        React.createElement('p', { style: { color: T.txt2, fontSize: '0.875rem', lineHeight: 1.7 } }, 'SEO engineer and technical writer at Speedy Indexer. Specializes in bulk indexing strategies, API integrations, and scalable SEO infrastructure for agencies.')
                    )
                )
            )
        ),

        // Related articles
        React.createElement('div', { style: { maxWidth: 1160, margin: '0 auto', padding: '60px 24px 100px' } },
            React.createElement('h3', { style: { fontSize: '1.25rem', fontWeight: 700, marginBottom: 24, fontFamily: T.font } }, 'Related Articles'),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 } },
                related.map(function (p) {
                    return React.createElement(PostCard, { key: p.slug, post: p, onRead: onBack });
                })
            )
        )
    );
}

/* ─────────────────────────────────────────
   DEFAULT EXPORT — Blog Router
   Handles both list and detail in one file
───────────────────────────────────────── */
export default function Blog() {
    const [currentSlug, setCurrentSlug] = useState(null);

    if (currentSlug) {
        return React.createElement(BlogPostPage, {
            slug: currentSlug,
            onBack: function () { setCurrentSlug(null); }
        });
    }
    return React.createElement(BlogPage, {
        onReadPost: function (slug) { setCurrentSlug(slug); }
    });
}