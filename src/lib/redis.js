import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;

export const redisConfigured = Boolean(redisUrl);

export const redis = redisConfigured
    ? new Redis(redisUrl, {
        retryStrategy: (times) => Math.min(times * 50, 2000),
        enableReadyCheck: false,
        enableOfflineQueue: true,
        lazyConnect: true,
        ...(redisUrl.startsWith('rediss://') ? { tls: {} } : {}),
    })
    : null;

if (!redisConfigured) {
    console.warn('REDIS_URL not configured. Redis features are disabled.');
}

redis?.on('error', (err) => {
    console.error('Redis connection error:', err);
});

redis?.on('connect', () => {
    console.log('Redis connected');
});
