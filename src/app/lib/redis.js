import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

export const redisConfigured = Boolean(redisUrl);

export const redis = redisConfigured
    ? new Redis(redisUrl, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        lazyConnect: true,
        ...(redisUrl.startsWith("rediss://") ? { tls: {} } : {}),
    })
    : null;

if (!redisConfigured) {
    console.warn("REDIS_URL is not configured. Queue features are disabled.");
}
