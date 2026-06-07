import { NextResponse } from 'next/server';
import {
    buildGoogleOAuthUrl,
    getGoogleOAuthStartDiagnostics,
} from '../../../../services/googleSearchConsole.js';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const state = searchParams.get('state') || 'speedyindexer';
        const diagnostics = getGoogleOAuthStartDiagnostics();

        if (diagnostics.missing.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing required Google OAuth environment variables.',
                    missing: diagnostics.missing,
                },
                { status: 500 }
            );
        }

        const authUrl = buildGoogleOAuthUrl(state);

        console.log('[google-oauth-start] client_id exists?', diagnostics.clientIdExists ? 'yes' : 'no');
        console.log('[google-oauth-start] redirect_uri value', diagnostics.redirectUri);
        console.log('[google-oauth-start] scope value', diagnostics.scope);
        console.log('[google-oauth-start] generated auth URL', authUrl);

        return NextResponse.redirect(authUrl);
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
