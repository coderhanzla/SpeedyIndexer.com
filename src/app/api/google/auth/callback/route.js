import { NextResponse } from 'next/server';
import {
    exchangeGoogleOAuthCode,
    getGoogleOAuthTokenExchangeDiagnostics,
} from '../../../../services/googleSearchConsole.js';

export async function GET(req) {
    try {
        const diagnostics = getGoogleOAuthTokenExchangeDiagnostics();

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

        const { searchParams } = new URL(req.url);
        const error = searchParams.get('error');
        const code = searchParams.get('code');

        if (error) {
            return NextResponse.json(
                { success: false, error },
                { status: 400 }
            );
        }

        if (!code) {
            return NextResponse.json(
                { success: false, error: 'Missing OAuth code' },
                { status: 400 }
            );
        }

        const token = await exchangeGoogleOAuthCode(code);

        return NextResponse.json({
            success: true,
            message: 'OAuth connected. Store refresh_token in GOOGLE_REFRESH_TOKEN on the server only.',
            refresh_token: token.refresh_token || null,
            has_refresh_token: Boolean(token.refresh_token),
            expires_in: token.expires_in,
            scope: token.scope,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
