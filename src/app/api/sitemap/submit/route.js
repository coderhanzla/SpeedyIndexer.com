import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '../../../lib/apiAuth.js';
import { getSitemapIndexUrl } from '../../../services/sitemapGenerator.js';
import { submitSitemapToGoogle } from '../../../services/googleSearchConsole.js';

export async function POST(req) {
    try {
        const auth = await getAuthenticatedUser(req);
        if (auth.error) return auth.error;

        const result = await submitSitemapToGoogle(getSitemapIndexUrl());

        return NextResponse.json({
            success: true,
            ...result,
            message: 'Sitemap index submitted to Google Search Console. Indexing is not guaranteed.',
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
