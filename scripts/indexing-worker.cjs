const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
dotenv.config();

const crypto = require('crypto');
const { Queue, Worker, QueueEvents } = require('bullmq');
const Redis = require('ioredis');
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const API_BASE = 'https://www.googleapis.com/webmasters/v3';
const SCOPE = 'https://www.googleapis.com/auth/webmasters';
const MAX_URLS_PER_SITEMAP = 50000;
const RECHECK_DELAY_MS = Number(process.env.INDEX_RECHECK_DELAY_MS || 6 * 60 * 60 * 1000);
const MAX_INDEX_CHECK_ATTEMPTS = Number(process.env.INDEX_CHECK_MAX_ATTEMPTS || 3);

let cachedGoogleToken = null;

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
    console.error('REDIS_URL is required to start the indexing worker.');
    process.exit(1);
}

const redisOptions = { maxRetriesPerRequest: null };
if (redisUrl.startsWith('rediss://')) redisOptions.tls = {};
const connection = new Redis(redisUrl, redisOptions);
connection.on('error', (error) => {
    console.error(`Redis connection error: ${error.message}`);
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase service credentials are not configured. Worker can start, but jobs will fail until .env is configured.');
}

const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseServiceKey || 'placeholder-key',
    {
        realtime: { transport: ws },
        auth: { persistSession: false, autoRefreshToken: false },
    }
);

const indexingQueue = new Queue('indexing', { connection });

function baseUrl() {
    return (process.env.NEXT_PUBLIC_SITE_URL || 'https://speedyindexer.com').replace(/\/$/, '');
}

function sitemapIndexUrl() {
    return `${baseUrl()}/sitemap-index.xml`;
}

function sitemapUrl(fileName) {
    return `${baseUrl()}/sitemaps/${fileName}`;
}

function base64Url(input) {
    return Buffer.from(input)
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

function getServiceAccount() {
    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
        return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    }

    if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
        return {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        };
    }

    return null;
}

function getOAuthConfig() {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) return null;
    return {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    };
}

function hasGoogleAuth() {
    return Boolean((getOAuthConfig() && process.env.GOOGLE_REFRESH_TOKEN) || getServiceAccount());
}

function getGscSiteUrl() {
    const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL || process.env.GOOGLE_SITE_URL;
    if (!siteUrl) {
        throw new Error('GOOGLE_SEARCH_CONSOLE_SITE_URL or GOOGLE_SITE_URL is required.');
    }

    return siteUrl;
}

async function logGoogleResponse(action, status, body, extra = {}) {
    const clean = body && typeof body === 'object' ? { ...body } : body;
    if (clean && typeof clean === 'object') {
        for (const key of ['access_token', 'refresh_token', 'id_token']) {
            if (clean[key]) clean[key] = '[redacted]';
        }
    }

    await supabase
        .from('google_api_logs')
        .insert({
            action,
            status_code: status,
            response: clean,
            metadata: extra,
        })
        .then(({ error }) => {
            if (error) console.error(`Failed to log Google response: ${error.message}`);
        });
}

async function getOAuthToken() {
    const oauth = getOAuthConfig();
    if (!oauth || !process.env.GOOGLE_REFRESH_TOKEN) return null;

    const response = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: oauth.clientId,
            client_secret: oauth.clientSecret,
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
            grant_type: 'refresh_token',
        }),
    });
    const body = await response.json().catch(() => ({}));
    await logGoogleResponse('oauth_refresh', response.status, body);

    if (!response.ok) {
        throw new Error(body.error_description || body.error || `Google OAuth refresh failed with ${response.status}`);
    }

    return {
        token: body.access_token,
        expiresAt: Date.now() + Number(body.expires_in || 3600) * 1000,
    };
}

async function getGoogleToken() {
    if (cachedGoogleToken && cachedGoogleToken.expiresAt > Date.now() + 60000) {
        return cachedGoogleToken.token;
    }

    const oauthToken = await getOAuthToken();
    if (oauthToken) {
        cachedGoogleToken = oauthToken;
        return cachedGoogleToken.token;
    }

    const account = getServiceAccount();
    if (!account) {
        throw new Error('Google Search Console auth is not configured. Add GOOGLE_REFRESH_TOKEN or service account access.');
    }

    const now = Math.floor(Date.now() / 1000);
    const unsigned = `${base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${base64Url(JSON.stringify({
        iss: account.client_email,
        scope: SCOPE,
        aud: TOKEN_URL,
        exp: now + 3600,
        iat: now,
    }))}`;
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(unsigned);
    signer.end();
    const signature = signer.sign(account.private_key, 'base64url');

    const response = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: `${unsigned}.${signature}`,
        }),
    });
    const body = await response.json().catch(() => ({}));
    await logGoogleResponse('service_account_token', response.status, body);

    if (!response.ok) {
        throw new Error(body.error_description || body.error || `Google auth failed with ${response.status}`);
    }

    cachedGoogleToken = {
        token: body.access_token,
        expiresAt: Date.now() + Number(body.expires_in || 3600) * 1000,
    };

    return cachedGoogleToken.token;
}

async function submitSitemapToGoogle(url) {
    const token = await getGoogleToken();
    const siteUrl = getGscSiteUrl();
    const response = await fetch(
        `${API_BASE}/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(url)}`,
        {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    const body = await response.text().catch(() => '');
    await logGoogleResponse('submit_sitemap', response.status, body ? { body } : null, {
        sitemapUrl: url,
        siteUrl,
    });

    if (!response.ok && response.status !== 204) {
        throw new Error(`Search Console sitemap submission failed with ${response.status}${body ? `: ${body}` : ''}`);
    }
}

async function pingUrl(url, action) {
    const response = await fetch(url, {
        method: 'GET',
        headers: { 'User-Agent': 'SpeedyIndexerBot/1.0 (+https://speedyindexer.com)' },
    }).catch((error) => ({ ok: false, status: 0, error }));
    await logGoogleResponse(action, response.status || 0, response.error ? { error: response.error.message } : null, {
        url,
    });
    return response.ok;
}

async function pingDiscoverySignals(sitemapIndex) {
    const encoded = encodeURIComponent(sitemapIndex);
    const results = await Promise.allSettled([
        pingUrl(`https://www.google.com/ping?sitemap=${encoded}`, 'ping_google_sitemap'),
        pingUrl(`https://www.bing.com/ping?sitemap=${encoded}`, 'ping_bing_sitemap'),
    ]);

    return results.map((result) => result.status === 'fulfilled' ? result.value : false);
}

function getIndexSearchQuery(url) {
    return `site:${url}`;
}

function isUrlInSearchItems(url, items = []) {
    const normalized = url.replace(/\/$/, '');
    return items.some((item) => {
        const link = String(item.link || item.url || '').replace(/\/$/, '');
        return link === normalized;
    });
}

async function checkIndexingStatus(url) {
    const query = getIndexSearchQuery(url);

    if (process.env.SERPAPI_KEY) {
        const response = await fetch(`https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${encodeURIComponent(process.env.SERPAPI_KEY)}`);
        const body = await response.json().catch(() => ({}));
        await logGoogleResponse('index_check_serpapi', response.status, body, { url, query });

        if (!response.ok) throw new Error(body.error || `SerpAPI index check failed with ${response.status}`);

        const items = body.organic_results || [];
        return {
            configured: true,
            indexed: isUrlInSearchItems(url, items),
            provider: 'serpapi',
            query,
            checkedItems: items.length,
        };
    }

    if (process.env.GOOGLE_CUSTOM_SEARCH_API_KEY && process.env.GOOGLE_CUSTOM_SEARCH_CX) {
        const params = new URLSearchParams({
            key: process.env.GOOGLE_CUSTOM_SEARCH_API_KEY,
            cx: process.env.GOOGLE_CUSTOM_SEARCH_CX,
            q: query,
        });
        const response = await fetch(`https://www.googleapis.com/customsearch/v1?${params.toString()}`);
        const body = await response.json().catch(() => ({}));
        await logGoogleResponse('index_check_custom_search', response.status, body, { url, query });

        if (!response.ok) throw new Error(body?.error?.message || `Custom Search index check failed with ${response.status}`);

        const items = body.items || [];
        return {
            configured: true,
            indexed: isUrlInSearchItems(url, items),
            provider: 'google_custom_search',
            query,
            checkedItems: items.length,
        };
    }

    return {
        configured: false,
        indexed: false,
        provider: 'not_configured',
        query,
        checkedItems: 0,
        message: 'Set SERPAPI_KEY or GOOGLE_CUSTOM_SEARCH_API_KEY + GOOGLE_CUSTOM_SEARCH_CX to enable indexing checks.',
    };
}

async function scheduleIndexRecheck(urlRecord, attempt = 1) {
    const recheckAt = new Date(Date.now() + RECHECK_DELAY_MS).toISOString();
    await updateUrl(urlRecord.id, {
        status: 'waiting_for_google',
        recheck_at: recheckAt,
        response: 'Discovery submitted. Waiting for Google to crawl and decide whether to index.',
    });

    await indexingQueue.add('check-indexing', {
        id: urlRecord.id,
        url: urlRecord.final_url || urlRecord.url,
        user_id: urlRecord.user_id,
        action: 'check_indexing',
        attempt,
    }, {
        delay: RECHECK_DELAY_MS,
        attempts: 1,
        removeOnComplete: true,
        removeOnFail: false,
    });

    await addLog(urlRecord.id, 'index_recheck_scheduled', 'Indexing recheck scheduled.', {
        recheck_at: recheckAt,
        attempt,
    });
}

async function updateUrl(id, values) {
    const { error } = await supabase
        .from('urls')
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq('id', id);
    if (error) throw error;
}

async function addLog(urlId, event, message, metadata = {}) {
    const { error } = await supabase.from('url_logs').insert({
        url_id: urlId,
        event,
        message,
        metadata,
    });
    if (error) console.error(`Failed to write URL log: ${error.message}`);
}

function getMetaRobots(html) {
    const robots = [];
    const pattern = /<meta\s+[^>]*(?:name=["'](?:robots|googlebot)["'][^>]*content=["']([^"']+)["']|content=["']([^"']+)["'][^>]*name=["'](?:robots|googlebot)["'])[^>]*>/gi;
    let match;
    while ((match = pattern.exec(html))) robots.push(String(match[1] || match[2] || '').toLowerCase());
    return robots.join(',');
}

function getCanonical(html) {
    const match = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)
        || html.match(/<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i);
    return match?.[1] || null;
}

function parseRobotsGroups(text) {
    const groups = [];
    let current = null;
    for (const rawLine of text.split(/\r?\n/)) {
        const line = rawLine.replace(/#.*/, '').trim();
        if (!line) continue;
        const [rawKey, ...rest] = line.split(':');
        const key = rawKey.trim().toLowerCase();
        const value = rest.join(':').trim();
        if (key === 'user-agent') {
            current = { agents: [value.toLowerCase()], disallow: [], allow: [] };
            groups.push(current);
        } else if (current && key === 'disallow') current.disallow.push(value);
        else if (current && key === 'allow') current.allow.push(value);
    }
    return groups;
}

function pathMatches(rule, path) {
    if (!rule) return false;
    const escaped = rule.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    return new RegExp(`^${escaped}`).test(path);
}

async function robotsBlocked(url) {
    const parsed = new URL(url);
    const response = await fetch(`${parsed.origin}/robots.txt`, { redirect: 'follow' }).catch(() => null);
    if (!response || response.status === 404 || !response.ok) return false;
    const groups = parseRobotsGroups(await response.text())
        .filter((group) => group.agents.some((agent) => agent === '*' || agent.includes('googlebot')));
    const path = `${parsed.pathname}${parsed.search}`;
    let blocked = false;
    let bestLength = -1;
    for (const group of groups) {
        for (const rule of group.disallow) {
            if (pathMatches(rule, path) && rule.length > bestLength) {
                blocked = true;
                bestLength = rule.length;
            }
        }
        for (const rule of group.allow) {
            if (pathMatches(rule, path) && rule.length >= bestLength) {
                blocked = false;
                bestLength = rule.length;
            }
        }
    }
    return blocked;
}

async function validateUrl(url) {
    const result = {
        isValid: false,
        statusCode: null,
        finalUrl: url,
        redirectChain: [],
        noindex: false,
        canonicalUrl: null,
        robotsBlocked: false,
        errors: [],
    };

    try {
        const parsed = new URL(url);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            result.errors.push('Invalid URL format');
            return result;
        }

        result.robotsBlocked = await robotsBlocked(url);
        if (result.robotsBlocked) result.errors.push('Blocked by robots.txt');

        const response = await fetch(url, {
            method: 'GET',
            redirect: 'follow',
            headers: {
                'User-Agent': 'SpeedyIndexerBot/1.0 (+https://speedyindexer.com)',
                Accept: 'text/html,application/xhtml+xml',
            },
        });

        result.statusCode = response.status;
        result.finalUrl = response.url || url;
        if (response.redirected && response.url && response.url !== url) {
            result.redirectChain.push({ from: url, to: response.url });
        }
        if (response.status !== 200) result.errors.push(`HTTP status ${response.status}`);

        const xRobots = response.headers.get('x-robots-tag') || '';
        if (xRobots.toLowerCase().includes('noindex')) {
            result.noindex = true;
            result.errors.push('X-Robots-Tag noindex detected');
        }

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('text/html')) {
            const html = await response.text();
            const robots = getMetaRobots(html);
            const canonical = getCanonical(html);
            if (robots.includes('noindex')) {
                result.noindex = true;
                result.errors.push('Meta robots noindex detected');
            }
            if (canonical) {
                result.canonicalUrl = new URL(canonical, result.finalUrl).toString();
                if (result.canonicalUrl !== result.finalUrl) {
                    result.errors.push(`Canonical points to ${result.canonicalUrl}`);
                }
            }
        }

        result.isValid = result.errors.length === 0;
        return result;
    } catch (error) {
        result.errors.push(error.message);
        return result;
    }
}

async function getOpenSitemapBatch() {
    const { data } = await supabase
        .from('google_sitemaps')
        .select('*')
        .lt('url_count', MAX_URLS_PER_SITEMAP)
        .order('batch_number', { ascending: false })
        .limit(1)
        .maybeSingle();
    if (data) return data;

    const { data: latest } = await supabase
        .from('google_sitemaps')
        .select('batch_number')
        .order('batch_number', { ascending: false })
        .limit(1)
        .maybeSingle();
    const batchNumber = Number(latest?.batch_number || 0) + 1;
    const fileName = `user-urls-${batchNumber}.xml`;
    const { data: created, error } = await supabase
        .from('google_sitemaps')
        .insert({
            batch_number: batchNumber,
            file_name: fileName,
            sitemap_url: sitemapUrl(fileName),
            url_count: 0,
            status: 'active',
        })
        .select()
        .single();
    if (error) throw error;
    return created;
}

async function addUrlToSitemap(urlRecord, validation) {
    const batch = await getOpenSitemapBatch();
    const { error: urlError } = await supabase
        .from('google_sitemap_urls')
        .upsert(
            {
                sitemap_id: batch.id,
                url_id: urlRecord.id,
                url: validation.finalUrl || urlRecord.url,
                lastmod: new Date().toISOString(),
            },
            { onConflict: 'url_id' }
        );
    if (urlError) throw urlError;

    const { error: countError } = await supabase
        .from('google_sitemaps')
        .update({ url_count: Number(batch.url_count || 0) + 1, updated_at: new Date().toISOString() })
        .eq('id', batch.id);
    if (countError) throw countError;

    return { ...batch, sitemap_url: batch.sitemap_url || sitemapUrl(batch.file_name), index_url: sitemapIndexUrl() };
}

const worker = new Worker(
    'indexing',
    async (job) => {
        const { id, url, user_id } = job.data;
        if (!id || !url || !user_id) throw new Error('Queue job is missing id, url, or user_id.');

        if (job.data.action === 'check_indexing') {
            await addLog(id, 'index_check_started', 'Checking whether Google reports the exact URL as indexed.', {
                attempt: job.data.attempt || 1,
            });

            const result = await checkIndexingStatus(url);
            const checkedAt = new Date().toISOString();

            if (!result.configured) {
                await updateUrl(id, {
                    status: 'waiting_for_google',
                    index_checked_at: checkedAt,
                    index_check_result: result,
                    response: result.message,
                });
                await addLog(id, 'index_check_skipped', result.message, result);
                return { success: true, indexed: false, configured: false };
            }

            if (result.indexed) {
                await updateUrl(id, {
                    status: 'indexed',
                    indexed_at: checkedAt,
                    index_checked_at: checkedAt,
                    index_check_result: result,
                    response: 'Google search result found the exact URL.',
                });
                await addLog(id, 'indexed', 'Google search result found the exact URL.', result);
                return { success: true, indexed: true };
            }

            const attempt = Number(job.data.attempt || 1);
            if (attempt < MAX_INDEX_CHECK_ATTEMPTS) {
                await updateUrl(id, {
                    status: 'waiting_for_google',
                    index_checked_at: checkedAt,
                    index_check_result: result,
                    response: `Not indexed yet. Recheck ${attempt + 1} scheduled.`,
                });
                await scheduleIndexRecheck({ id, url, user_id }, attempt + 1);
                await addLog(id, 'not_indexed_retrying', 'URL was not found yet; another recheck was scheduled.', result);
                return { success: true, indexed: false, retrying: true };
            }

            await updateUrl(id, {
                status: 'not_indexed',
                index_checked_at: checkedAt,
                index_check_result: result,
                response: 'Google search result did not find the exact URL after rechecks.',
            });
            await addLog(id, 'not_indexed', 'Google search result did not find the exact URL after rechecks.', result);
            return { success: true, indexed: false };
        }

        await addLog(id, 'job_queued', 'Google discovery job picked up by worker.');
        await updateUrl(id, { status: 'processing', response: null });
        await addLog(id, 'validation_started', 'URL validation started.');

        const validation = await validateUrl(url);
        await updateUrl(id, {
            status: validation.isValid ? 'processing' : 'failed',
            http_status: validation.statusCode,
            final_url: validation.finalUrl,
            canonical_url: validation.canonicalUrl,
            robots_blocked: validation.robotsBlocked,
            noindex: validation.noindex,
            validation_result: validation,
            response: validation.isValid ? 'URL is valid for Google discovery sitemap.' : validation.errors.join('; '),
        });
        await addLog(id, 'validation_completed', validation.isValid ? 'Validation passed.' : 'Validation failed.', validation);

        if (!validation.isValid) return {
            success: false,
            url,
            validation,
        };

        const sitemap = await addUrlToSitemap({ id, url, user_id }, validation);
        await updateUrl(id, {
            status: 'processing',
            sitemap_url: sitemap.sitemap_url,
            sitemap_index_url: sitemap.index_url,
            response: 'URL added to Google discovery sitemap.',
        });
        await addLog(id, 'sitemap_updated', 'URL added to sitemap.', sitemap);

        if (!hasGoogleAuth()) {
            const message = 'Sitemap updated, but Google Search Console submission requires OAuth refresh token or service account access.';
            await updateUrl(id, {
                status: 'discovery_submitted',
                response: `${message} Public sitemap and discovery page signals were still created.`,
                discovery_submitted_at: new Date().toISOString(),
            });
            await addLog(id, 'discovery_submitted', message, {
                sitemap_index_url: sitemapIndexUrl(),
            });
            await scheduleIndexRecheck({ id, url, user_id, final_url: validation.finalUrl }, 1);
            return {
                success: true,
                url,
                sitemapIndexUrl: sitemapIndexUrl(),
                googleSubmitted: false,
            };
        }

        try {
            await submitSitemapToGoogle(sitemapIndexUrl());
        } catch (error) {
            await updateUrl(id, {
                status: 'failed',
                response: error.message,
            });
            await addLog(id, 'discovery_submission_failed', error.message, {
                sitemap_index_url: sitemapIndexUrl(),
            });
            throw error;
        }

        await pingDiscoverySignals(sitemapIndexUrl());

        await supabase
            .from('google_sitemaps')
            .update({ status: 'submitted', submitted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
            .eq('id', sitemap.id);
        await updateUrl(id, {
            status: 'discovery_submitted',
            response: 'Discovery signals submitted. Google indexing is not guaranteed.',
            submitted_at: new Date().toISOString(),
            discovery_submitted_at: new Date().toISOString(),
        });
        await addLog(id, 'discovery_submitted', 'Sitemap index submitted to Google Search Console and pinged.', {
            sitemap_index_url: sitemapIndexUrl(),
        });

        await scheduleIndexRecheck({ id, url, user_id, final_url: validation.finalUrl }, 1);

        return { success: true, url, sitemapIndexUrl: sitemapIndexUrl() };
    },
    { connection, concurrency: Number(process.env.GOOGLE_DISCOVERY_WORKER_CONCURRENCY || 5) }
);

const events = new QueueEvents('indexing', { connection });

worker.on('completed', (job) => console.log(`Google discovery job ${job.id} completed`));
worker.on('failed', async (job, error) => {
    console.error(`Google discovery job ${job?.id || 'unknown'} failed: ${error.message}`);
    if (job?.data?.id) {
        await updateUrl(job.data.id, { status: 'failed', response: error.message }).catch(() => {});
        await addLog(job.data.id, 'processing_failed', error.message).catch(() => {});
    }
});

async function shutdown() {
    await events.close();
    await worker.close();
    await indexingQueue.close();
    await connection.quit();
    process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log('Google discovery worker started');
