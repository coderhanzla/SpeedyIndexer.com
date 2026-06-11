import { NextResponse } from 'next/server';
import { workerSupabase } from '../lib/workersupabase.js';

export const dynamic = 'force-dynamic';

function cleanUrl(url) {
    return String(url).trim();
}

function escapeXml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export async function GET() {
    try {
        const siteHost = (process.env.NEXT_PUBLIC_SITE_URL || 'https://speedyindexer.com').replace(/\/$/, '');
        const generatedAt = new Date().toISOString();
        const staticPaths = [
            '/',
            '/features',
            '/pricing',
            '/api-docs',
            '/changelog',
            '/status',
            '/about',
            '/blog',
            '/careers',
            '/contact',
            '/press',
            '/privacy-policy',
            '/terms-of-service',
            '/cookie-policy',
            '/gdpr',
            '/discover',
            '/sitemap-index.xml',
            '/feeds/recent-urls.xml',
        ];

        const { data, error } = await workerSupabase
            .from('urls')
            .select('url, created_at')
            .limit(50000);

        if (error) console.error('Sitemap URL query failed:', error);

        const uniqueUrls = [
            ...staticPaths.map((path) => `${siteHost}${path}`),
            ...new Set(
                (error ? [] : data || [])
                    .map((item) => cleanUrl(item.url))
                    .filter((url) => url.startsWith(siteHost))
            )
        ];

        const urls = uniqueUrls
            .map((url) => `
<url>
  <loc>${escapeXml(url)}</loc>
  <lastmod>${generatedAt}</lastmod>
</url>`)
            .join('');

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

        return new NextResponse(xml, {
            headers: {
                'Content-Type': 'application/xml'
            }
        });
    } catch (error) {
        console.error('Sitemap generation failed:', error);
        return NextResponse.json(
            { success: false, error: 'Sitemap generation failed' },
            { status: 500 }
        );
    }
}
