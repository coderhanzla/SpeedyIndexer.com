import { NextResponse } from 'next/server';
import { getCreditHistory, getUserFromRequest } from '../../../services/credits.js';

export async function GET(req) {
    try {
        const auth = await getUserFromRequest(req);
        if (auth.error) return auth.error;

        const history = await getCreditHistory(auth.user.id, 100);
        return NextResponse.json({ success: true, history });
    } catch (error) {
        console.error('Credits API Error:', error);

        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
