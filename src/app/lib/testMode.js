export function isTestMode() {
    return String(process.env.TEST_MODE || '').toLowerCase() === 'true';
}

export function getMockCreditAccount(user = {}) {
    return {
        user_id: user.id || 'test-user',
        email: user.email || null,
        credits_balance: 40,
        total_credits_purchased: 40,
        total_credits_used: 0,
        test_mode: true,
    };
}
