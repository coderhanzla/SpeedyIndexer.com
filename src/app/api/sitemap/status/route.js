import { NextResponse } from 'next/server';
import { workerSupabase } from '../../../lib/workersupabase.js';
import { getAuthenticatedUser } from '../../../lib/apiAuth.js';
import { getSitemapIndexUrl } from '../../../services/sitemapGenerator.js';
import { getGoogleAuthStatus, getSitemapStatus } from '../../../services/googleSearchConsole.js';

export async function GET(req) {
    try {
        const auth = await getAuthenticatedUser(req);
        if (auth.error) return auth.error;

        const { data, error } = await workerSupabase
            .from('google_sitemaps')
            .select('*')
            .order('batch_number', { ascending: true });

        if (error) throw error;

        let google = null;
        try {
            google = await getSitemapStatus(getSitemapIndexUrl());
        } catch (error) {
            google = { error: error.message };
        }

        return NextResponse.json({
            success: true,
            sitemapIndexUrl: getSitemapIndexUrl(),
            batches: data || [],
            auth: getGoogleAuthStatus(),
            google,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
