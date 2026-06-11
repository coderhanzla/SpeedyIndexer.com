import { NextResponse } from 'next/server';
import { renderSitemapIndex } from '../services/sitemapGenerator.js';

export async function GET() {
    try {
        const xml = await renderSitemapIndex();

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
