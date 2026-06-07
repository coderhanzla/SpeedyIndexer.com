import { NextResponse } from 'next/server';
import { queueGoogleDiscoveryUrls } from '../../services/googleDiscoverySubmission.js';
import { getAuthenticatedUser } from '../../lib/apiAuth.js';
import { getIndexingQueue } from '../../queue/indexingQueue.js';

export async function GET(req) {
    try {
        const auth = await getAuthenticatedUser(req);
        if (auth.error) return auth.error;

        let counts = { waiting: 0, active: 0, delayed: 0, failed: 0, completed: 0 };
        let workerStatus = 'external_worker_required';

        try {
            const queue = await getIndexingQueue();
            counts = await queue.getJobCounts(
                'waiting',
                'active',
                'delayed',
                'failed',
                'completed'
            );
        } catch (queueError) {
            workerStatus = 'queue_unavailable';
            console.error('Queue status unavailable:', queueError);
        }

        return NextResponse.json({
            success: true,
            counts,
            queueSize: (counts.waiting || 0) + (counts.active || 0) + (counts.delayed || 0),
            workerStatus,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

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
        console.error('Queue API error:', error);

        return NextResponse.json(
            {
                success: false,
                error: error.message
            },
            { status: 500 }
        );
    }
}
