import { NextResponse } from 'next/server';
import { getCreditBalance, getUserFromRequest } from '../../../services/credits.js';

export async function GET(req) {
    try {
        const auth = await getUserFromRequest(req);
        if (auth.error) return auth.error;

        const account = await getCreditBalance(auth.user);
        return NextResponse.json({ success: true, account });
    } catch (error) {
        console.error('Credits API Error:', error);

        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
