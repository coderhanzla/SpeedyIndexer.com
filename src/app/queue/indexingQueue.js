import "dotenv/config";
import { Queue } from "bullmq";

export const INDEXING_QUEUE_NAME = "indexing";
export const GOOGLE_DISCOVERY_JOB_NAME = "google-discovery-url";

let indexingQueue;

export async function getIndexingQueue() {
    if (indexingQueue) return indexingQueue;

    const { redis, redisConfigured } = await import("../lib/redis.js");

    if (!redisConfigured || !redis) {
        const error = new Error("REDIS_URL is not configured. Queue is unavailable.");
        error.status = 503;
        throw error;
    }

    indexingQueue = new Queue(INDEXING_QUEUE_NAME, {
        connection: redis,
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 5000,
            },
            removeOnComplete: true,
            removeOnFail: false,
        },
    });

    return indexingQueue;
}
