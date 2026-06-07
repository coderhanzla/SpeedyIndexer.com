import { NextResponse } from 'next/server';
import { queueGoogleDiscoveryUrls } from '../../services/googleDiscoverySubmission.js';

const MAX_UPLOAD_BYTES = Number(process.env.BULK_UPLOAD_MAX_BYTES || 2 * 1024 * 1024);

export async function POST(req) {
    try {
        const length = Number(req.headers.get('content-length') || 0);
        if (length > MAX_UPLOAD_BYTES) {
            return NextResponse.json(
                { success: false, error: 'Upload too large' },
                { status: 413 }
            );
        }

        const contentType = req.headers.get('content-type') || '';

        if (contentType.includes('multipart/form-data')) {
            const form = await req.formData();
            const file = form.get('file');
            const urls = form.get('urls');

            if (file && typeof file.text === 'function') {
                return queueGoogleDiscoveryUrls(req, await file.text());
            }

            return queueGoogleDiscoveryUrls(req, urls);
        }

        const body = await req.json().catch(() => null);
        if (!body) {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON body' },
                { status: 400 }
            );
        }
        return queueGoogleDiscoveryUrls(req, body.urls || body.url || body.text);
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
