import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '../../../lib/apiAuth.js';
import { workerSupabase } from '../../../lib/workersupabase.js';

export async function GET(req, { params }) {
    try {
        const auth = await getAuthenticatedUser(req);
        if (auth.error) return auth.error;
        const { id } = await params;

        const { data: job, error } = await workerSupabase
            .from('urls')
            .select('*')
            .eq('id', id)
            .eq('user_id', auth.user.id)
            .maybeSingle();

        if (error) throw error;
        if (!job) {
            return NextResponse.json(
                { success: false, error: 'Job not found' },
                { status: 404 }
            );
        }

        const { data: logs, error: logError } = await workerSupabase
            .from('url_logs')
            .select('*')
            .eq('url_id', job.id)
            .order('created_at', { ascending: true });

        if (logError) throw logError;

        return NextResponse.json({
            success: true,
            job,
            logs: logs || [],
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
