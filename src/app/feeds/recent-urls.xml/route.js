import { NextResponse } from 'next/server';
import { workerSupabase } from '../../lib/workersupabase.js';
import { escapeXml } from '../../services/sitemapGenerator.js';

function getBaseUrl() {
    return (process.env.NEXT_PUBLIC_SITE_URL || 'https://speedyindexer.com').replace(/\/$/, '');
}

export async function GET() {
    try {
        const { data, error } = await workerSupabase
            .from('google_sitemap_urls')
            .select('url,lastmod,created_at')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;

        const items = (data || [])
            .map((item) => `    <item>
      <title>${escapeXml(item.url)}</title>
      <link>${escapeXml(item.url)}</link>
      <guid isPermaLink="true">${escapeXml(item.url)}</guid>
      <pubDate>${new Date(item.lastmod || item.created_at || Date.now()).toUTCString()}</pubDate>
    </item>`)
            .join('\n');

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>SpeedyIndexer Recent Submitted URLs</title>
    <link>${escapeXml(`${getBaseUrl()}/discover`)}</link>
    <description>Recent URLs submitted for Google discovery.</description>
${items}
  </channel>
</rss>`;

        return new NextResponse(xml, {
            headers: {
                'Content-Type': 'application/rss+xml; charset=utf-8',
                'Cache-Control': 'public, max-age=300',
            },
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
