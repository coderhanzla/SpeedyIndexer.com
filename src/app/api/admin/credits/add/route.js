import { NextResponse } from 'next/server';
import { addCredits, ensureCreditAccount, findUserByEmail, parsePositiveInteger, requireAdmin } from '../../../../services/credits.js';

export async function POST(req) {
    try {
        const admin = await requireAdmin(req);
        if (admin.error) return admin.error;

        const body = await req.json().catch(() => null);
        if (!body) {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON body' },
                { status: 400 }
            );
        }
        const amount = parsePositiveInteger(body.amount);
        const user = await findUserByEmail(body.email);
        await ensureCreditAccount(user);

        const account = await addCredits({
            userId: user.id,
            amount,
            note: body.note || `Manual credit add: ${amount}`,
            adminId: admin.user.id,
        });

        return NextResponse.json({ success: true, account });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to add credits' },
            { status: error.message === 'User not found' ? 404 : 400 }
        );
    }
}
