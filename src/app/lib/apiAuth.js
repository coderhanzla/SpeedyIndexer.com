import { NextResponse } from 'next/server';
import { supabase } from './supabase.js';

export async function getAuthenticatedUser(req) {
    const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

    if (!token) {
        return {
            error: NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            ),
        };
    }

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
        return {
            error: NextResponse.json(
                { success: false, error: 'Invalid session' },
                { status: 401 }
            ),
        };
    }

    return { token, user };
}
