import { NextResponse } from 'next/server';
import { getGoogleAuthStatus, assertGoogleEnv } from '../../../../services/googleSearchConsole.js';

export async function GET() {
    const validation = assertGoogleEnv();

    return NextResponse.json({
        success: true,
        ...validation,
        auth: getGoogleAuthStatus(),
    });
}
