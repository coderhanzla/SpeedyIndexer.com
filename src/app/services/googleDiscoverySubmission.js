import { NextResponse } from 'next/server';
import { GOOGLE_DISCOVERY_JOB_NAME, INDEXING_QUEUE_NAME, getIndexingQueue } from '../queue/indexingQueue.js';
import { workerSupabase } from '../lib/workersupabase.js';
import { getAuthenticatedUser } from '../lib/apiAuth.js';
import { enforceRateLimit } from '../lib/rateLimit.js';
import { normalizeUrlList } from '../lib/urlInput.js';
import { getCreditBalance, refundCredits, useCredits } from './credits.js';
import { getMockCreditAccount, isTestMode } from '../lib/testMode.js';

const DAILY_LIMIT = Number(process.env.GOOGLE_DISCOVERY_DAILY_LIMIT || 10000);

export async function queueGoogleDiscoveryUrls(req, inputUrls) {
    console.log('Bulk submit received URLs', { inputUrls });
    const rate = await enforceRateLimit(req, {
        key: 'submit',
        limit: 30,
        windowSeconds: 60,
    });

    if (!rate.allowed) {
        return NextResponse.json(
            { success: false, error: 'Rate limit exceeded', retryAfter: rate.retryAfter },
            { status: 429 }
        );
    }

    const auth = await getAuthenticatedUser(req);
    if (auth.error) return auth.error;

    const { urls, invalid, duplicate } = normalizeUrlList(inputUrls, DAILY_LIMIT);

    if (!urls.length) {
        return NextResponse.json(
            { success: false, error: 'No valid URLs provided', invalid, duplicate },
            { status: 400 }
        );
    }

    const acceptedUrls = [];
    let skipped = duplicate;

    for (const url of urls) {
        const { data: existing } = await workerSupabase
            .from('urls')
            .select('id')
            .eq('user_id', auth.user.id)
            .eq('url', url)
            .maybeSingle();

        if (existing) {
            skipped += 1;
            continue;
        }

        acceptedUrls.push(url);
    }

    if (!acceptedUrls.length) {
        return NextResponse.json({
            success: true,
            queued: 0,
            skipped,
            invalid,
            message: 'No new URLs were queued.',
        });
    }

    const testMode = isTestMode();
    const creditAccount = testMode ? getMockCreditAccount(auth.user) : await getCreditBalance(auth.user);

    if (!testMode && Number(creditAccount.credits_balance || 0) < acceptedUrls.length) {
        return NextResponse.json(
            { success: false, error: 'Insufficient credits. Please buy more credits.', required: acceptedUrls.length, balance: creditAccount.credits_balance },
            { status: 402 }
        );
    }

    const spent = testMode
        ? creditAccount
        : await useCredits({
            userId: auth.user.id,
            amount: acceptedUrls.length,
            note: `${acceptedUrls.length} URL submissions`,
        });

    let queued = 0;
    let insertFailed = 0;

    for (const url of acceptedUrls) {
        const { data, error } = await workerSupabase
            .from('urls')
            .insert({
                user_id: auth.user.id,
                url,
                status: 'queued',
                response: 'Queued for URL validation and discovery submission.',
            })
            .select()
            .single();

        if (error || !data) {
            insertFailed += 1;
            continue;
        }

        await workerSupabase
            .from('url_logs')
            .insert({
                url_id: data.id,
                event: 'queued',
                message: 'URL queued for validation, sitemap inclusion, and discovery submission.',
            });

        try {
            const queue = await getIndexingQueue();
            const payload = {
                id: data.id,
                url,
                user_id: auth.user.id,
            };
            console.log('Adding job to queue', {
                queue: INDEXING_QUEUE_NAME,
                jobName: GOOGLE_DISCOVERY_JOB_NAME,
                payload,
            });
            const job = await queue.add(GOOGLE_DISCOVERY_JOB_NAME, payload);
            console.log('Added job ID', job?.id);
        } catch (queueError) {
            insertFailed += 1;
            await workerSupabase
                .from('urls')
                .update({
                    status: 'failed',
                    response: `Queue error: ${queueError.message || 'Failed to queue URL'}`,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', data.id);
            await workerSupabase
                .from('url_logs')
                .insert({
                    url_id: data.id,
                    event: 'failed',
                    message: `Queue error: ${queueError.message || 'Failed to queue URL'}`,
                });
            continue;
        }

        queued += 1;
    }

    if (insertFailed > 0) {
        skipped += insertFailed;
        if (!testMode) {
            await refundCredits({
                userId: auth.user.id,
                amount: insertFailed,
                note: `${insertFailed} URL submission credits refunded after queue failure`,
            });
        }
    }

    return NextResponse.json({
        success: true,
        queued,
        skipped,
        invalid,
        creditsDeducted: testMode ? 0 : acceptedUrls.length - insertFailed,
        balanceAfter: testMode ? 40 : Number(spent.credits_balance || 0) + insertFailed,
        testMode,
        message: 'URLs queued for discovery. Completed means submitted for discovery, not guaranteed Google indexing.',
    });
}
