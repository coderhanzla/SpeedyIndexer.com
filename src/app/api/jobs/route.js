import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '../../lib/apiAuth.js';
import { workerSupabase } from '../../lib/workersupabase.js';

export async function GET(req) {
    try {
        const auth = await getAuthenticatedUser(req);
        if (auth.error) return auth.error;

        const { searchParams } = new URL(req.url);
        const limit = Math.min(Number(searchParams.get('limit') || 50), 200);

        const { data, error } = await workerSupabase
            .from('urls')
            .select('*')
            .eq('user_id', auth.user.id)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            jobs: data || [],
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
