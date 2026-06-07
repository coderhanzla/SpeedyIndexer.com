import { NextResponse } from 'next/server';
import { queueGoogleDiscoveryUrls } from '../../services/googleDiscoverySubmission.js';

export async function POST(req) {
    try {
        const body = await req.json().catch(() => null);
        if (!body) {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON body' },
                { status: 400 }
            );
        }
        return queueGoogleDiscoveryUrls(req, body.urls || body.url);
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
