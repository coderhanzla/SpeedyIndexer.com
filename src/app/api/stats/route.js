import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '../../lib/apiAuth.js';
import { supabaseAdmin } from '../../lib/supabaseAdmin.js';
import { getIndexingQueue } from '../../queue/indexingQueue.js';

export async function GET(req) {
    try {
        const auth = await getAuthenticatedUser(req);
        if (auth.error) return auth.error;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data, error } = await supabaseAdmin
            .from('urls')
            .select('id,status,created_at,updated_at')
            .eq('user_id', auth.user.id)
            .gte('created_at', today.toISOString());

        if (error) throw error;

        const rows = data || [];
        const byStatus = rows.reduce((acc, row) => {
            acc[row.status] = (acc[row.status] || 0) + 1;
            return acc;
        }, {});
        const completed = byStatus.completed || 0;
        const failed = (byStatus.failed || 0) + (byStatus.invalid || 0) + (byStatus.google_submission_failed || 0);
        let queueCounts = {
            waiting: 0,
            active: 0,
            delayed: 0,
            failed: 0,
            completed: 0,
        };
        let workerStatus = 'external_worker_required';

        try {
            const queue = await getIndexingQueue();
            queueCounts = await queue.getJobCounts(
                'waiting',
                'active',
                'delayed',
                'failed',
                'completed'
            );
        } catch (queueError) {
            workerStatus = 'queue_unavailable';
            console.error('Stats queue unavailable:', queueError);
        }

        return NextResponse.json({
            success: true,
            submittedToday: rows.length,
            processedToday: completed + failed,
            validationFailures: byStatus.invalid || 0,
            googleSubmissionErrors: byStatus.google_submission_failed || 0,
            queueSize: (queueCounts.waiting || 0) + (queueCounts.active || 0) + (queueCounts.delayed || 0),
            queueCounts,
            workerStatus,
            processingRatePerHour: completed,
            successRate: completed + failed === 0 ? 0 : Math.round((completed / (completed + failed)) * 100),
            byStatus,
        });
    } catch (error) {
        console.error('Stats API Error:', error);

        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
