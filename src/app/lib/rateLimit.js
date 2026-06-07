const memoryStore = new Map();

function getClientKey(req, suffix) {
    const forwardedFor = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const ip = forwardedFor || req.headers.get('x-real-ip') || 'unknown';
    return `rate:${suffix}:${ip}`;
}

export async function enforceRateLimit(req, options = {}) {
    const {
        key = 'global',
        limit = 60,
        windowSeconds = 60,
    } = options;
    const rateKey = getClientKey(req, key);

    try {
        const { redis } = await import('./redis.js');
        const count = await redis.incr(rateKey);
        if (count === 1) {
            await redis.expire(rateKey, windowSeconds);
        }

        return {
            allowed: count <= limit,
            remaining: Math.max(limit - count, 0),
            retryAfter: windowSeconds,
        };
    } catch {
        const now = Date.now();
        const current = memoryStore.get(rateKey);

        if (!current || current.expiresAt <= now) {
            memoryStore.set(rateKey, {
                count: 1,
                expiresAt: now + windowSeconds * 1000,
            });
            return { allowed: true, remaining: limit - 1, retryAfter: windowSeconds };
        }

        current.count += 1;
        return {
            allowed: current.count <= limit,
            remaining: Math.max(limit - current.count, 0),
            retryAfter: Math.ceil((current.expiresAt - now) / 1000),
        };
    }
}
