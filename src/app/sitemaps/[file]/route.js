import { NextResponse } from 'next/server';
import { renderSitemapFile, renderSitemapIndex } from '../../services/sitemapGenerator.js';

export async function GET(_req, { params }) {
    try {
        const { file } = await params;
        const xml = file === 'google-discovery-index.xml' || file === 'sitemap-index.xml'
            ? await renderSitemapIndex()
            : await renderSitemapFile(file);

        if (!xml) {
            return new NextResponse('Sitemap not found', { status: 404 });
        }

        return new NextResponse(xml, {
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
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
