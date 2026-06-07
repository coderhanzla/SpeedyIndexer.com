import { NextResponse } from 'next/server';
import { supabase } from '../lib/supabase.js';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { getMockCreditAccount, isTestMode } from '../lib/testMode.js';

export const CREDIT_PLANS = [
    { name: 'Starter', credits: 40, price: 3 },
    { name: 'Basic', credits: 250, price: 12 },
    { name: 'Pro', credits: 1000, price: 45 },
    { name: 'Growth', credits: 2000, price: 87 },
    { name: 'Agency', credits: 5000, price: 199 },
    { name: 'Enterprise', credits: 15000, price: 350 },
];

const DEFAULT_ADMIN_EMAIL = 'admin1@yopmail.com';

export async function getUserFromRequest(req) {
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

    return { user };
}

export async function requireAdmin(req) {
    const auth = await getUserFromRequest(req);
    if (auth.error) return auth;

    const allowed = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).toLowerCase();
    const email = String(auth.user.email || '').toLowerCase();

    if (email !== allowed) {
        return {
            error: NextResponse.json(
                { success: false, error: 'Admin access required' },
                { status: 403 }
            ),
        };
    }

    return auth;
}

export function parsePositiveInteger(value) {
    const amount = Number(value);
    if (!Number.isInteger(amount) || amount <= 0) {
        throw new Error('Amount must be a positive integer');
    }
    return amount;
}

export async function ensureCreditAccount(user) {
    if (isTestMode()) return getMockCreditAccount(user);

    const email = user.email || null;
    const { data: existing, error: existingError } = await supabaseAdmin
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
        if (email && existing.email !== email) {
            await supabaseAdmin
                .from('user_credits')
                .update({ email, updated_at: new Date().toISOString() })
                .eq('user_id', user.id);
            return { ...existing, email };
        }
        return existing;
    }

    const { data, error } = await supabaseAdmin
        .from('user_credits')
        .insert({
            user_id: user.id,
            email,
            credits_balance: 0,
            total_credits_purchased: 0,
            total_credits_used: 0,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getCreditBalance(user) {
    return ensureCreditAccount(user);
}

export async function getCreditHistory(userId, limit = 50) {
    if (isTestMode()) return [];

    const { data, error } = await supabaseAdmin
        .from('credit_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data || [];
}

export async function findUserByEmail(email) {
    const needle = String(email || '').trim().toLowerCase();
    if (!needle) throw new Error('Email is required');

    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
    });

    if (error) throw error;

    const user = (data?.users || []).find((item) => String(item.email || '').toLowerCase() === needle);
    if (!user) throw new Error('User not found');
    return user;
}

export async function getCreditAdminSummary({ email, limit = 100 } = {}) {
    if (isTestMode()) {
        return {
            accounts: [getMockCreditAccount({ email })],
            transactions: [],
            totals: {
                totalCreditsAdded: 40,
                totalCreditsUsed: 0,
                usersWithCredits: 1,
            },
        };
    }

    const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 500);
    const needle = String(email || '').trim().toLowerCase();
    let targetUserId = null;

    if (needle) {
        try {
            const user = await findUserByEmail(needle);
            targetUserId = user.id;
            await ensureCreditAccount(user);
        } catch {
            targetUserId = null;
        }
    }

    let transactionQuery = supabaseAdmin
        .from('credit_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(safeLimit);

    if (targetUserId) transactionQuery = transactionQuery.eq('user_id', targetUserId);
    if (needle && !targetUserId) transactionQuery = transactionQuery.eq('user_id', '00000000-0000-0000-0000-000000000000');

    const [{ data: transactions, error: transactionsError }, { data: accounts, error: accountsError }] = await Promise.all([
        transactionQuery,
        supabaseAdmin
            .from('user_credits')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(needle ? 20 : 200),
    ]);

    if (transactionsError) throw transactionsError;
    if (accountsError) throw accountsError;

    const filteredAccounts = needle
        ? (accounts || []).filter((account) => String(account.email || '').toLowerCase().includes(needle) || account.user_id === targetUserId)
        : (accounts || []);

    const totalCreditsAdded = (transactions || [])
        .filter((item) => ['credit_added', 'credit_refund'].includes(item.type))
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalCreditsUsed = (transactions || [])
        .filter((item) => ['credit_used', 'credit_deducted_manual'].includes(item.type))
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    return {
        accounts: filteredAccounts,
        transactions: transactions || [],
        totals: {
            totalCreditsAdded,
            totalCreditsUsed,
            usersWithCredits: filteredAccounts.filter((account) => Number(account.credits_balance || 0) > 0).length,
        },
    };
}

export async function addCredits({ userId, amount, note, adminId }) {
    if (isTestMode()) return getMockCreditAccount({ id: userId });

    const { data, error } = await supabaseAdmin.rpc('add_user_credits', {
        p_user_id: userId,
        p_amount: amount,
        p_note: note || 'Manual credit add',
        p_created_by_admin: adminId,
    });

    if (error) throw error;
    return data;
}

export async function deductCredits({ userId, amount, note, adminId }) {
    if (isTestMode()) return getMockCreditAccount({ id: userId });

    const { data, error } = await supabaseAdmin.rpc('deduct_user_credits', {
        p_user_id: userId,
        p_amount: amount,
        p_note: note || 'Manual credit deduction',
        p_created_by_admin: adminId,
    });

    if (error) throw error;
    return data;
}

export async function useCredits({ userId, amount, note }) {
    if (isTestMode()) return getMockCreditAccount({ id: userId });

    const { data, error } = await supabaseAdmin.rpc('use_user_credits', {
        p_user_id: userId,
        p_amount: amount,
        p_note: note || `${amount} URL submissions`,
    });

    if (error) {
        if (String(error.message || '').toLowerCase().includes('insufficient')) {
            const insufficient = new Error('Insufficient credits. Please buy more credits.');
            insufficient.status = 402;
            throw insufficient;
        }
        throw error;
    }

    return data;
}

export async function refundCredits({ userId, amount, note, adminId = null }) {
    if (isTestMode()) return getMockCreditAccount({ id: userId });

    const { data, error } = await supabaseAdmin.rpc('refund_user_credits', {
        p_user_id: userId,
        p_amount: amount,
        p_note: note || 'Submission credit refund',
        p_created_by_admin: adminId,
    });

    if (error) throw error;
    return data;
}
