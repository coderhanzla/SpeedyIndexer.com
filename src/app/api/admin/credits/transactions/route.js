import { NextResponse } from 'next/server';
import { getCreditAdminSummary, requireAdmin } from '../../../../services/credits.js';

export async function GET(req) {
    try {
        const admin = await requireAdmin(req);
        if (admin.error) return admin.error;

        const { searchParams } = new URL(req.url);
        const summary = await getCreditAdminSummary({
            email: searchParams.get('email') || '',
            limit: searchParams.get('limit') || 100,
        });

        return NextResponse.json({ success: true, ...summary });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to load credit transactions' },
            { status: 500 }
        );
    }
}
