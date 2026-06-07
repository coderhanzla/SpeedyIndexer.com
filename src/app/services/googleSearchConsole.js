import crypto from 'crypto';
import { workerSupabase } from '../lib/workersupabase.js';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const API_BASE = 'https://www.googleapis.com/webmasters/v3';
const SCOPE = 'https://www.googleapis.com/auth/webmasters';

let cachedToken = null;

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
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) return null;
    return { clientId, clientSecret, redirectUri };
}

function getMissingOAuthEnv({ requireSecret = true } = {}) {
    const missing = [];

    if (!process.env.GOOGLE_CLIENT_ID) missing.push('GOOGLE_CLIENT_ID');
    if (requireSecret && !process.env.GOOGLE_CLIENT_SECRET) missing.push('GOOGLE_CLIENT_SECRET');
    if (!process.env.GOOGLE_REDIRECT_URI) missing.push('GOOGLE_REDIRECT_URI');

    return missing;
}

export function getGoogleOAuthStartDiagnostics() {
    return {
        clientIdExists: Boolean(process.env.GOOGLE_CLIENT_ID),
        redirectUri: process.env.GOOGLE_REDIRECT_URI || null,
        scope: SCOPE,
        missing: getMissingOAuthEnv({ requireSecret: false }),
    };
}

export function getGoogleOAuthTokenExchangeDiagnostics() {
    return {
        redirectUri: process.env.GOOGLE_REDIRECT_URI || null,
        missing: getMissingOAuthEnv({ requireSecret: true }),
    };
}

function getSiteUrl(siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL || process.env.GOOGLE_SITE_URL) {
    if (!siteUrl) throw new Error('GOOGLE_SEARCH_CONSOLE_SITE_URL or GOOGLE_SITE_URL is required.');
    return siteUrl;
}

export function getGoogleAuthStatus() {
    const oauth = getOAuthConfig();
    const hasRefreshToken = Boolean(process.env.GOOGLE_REFRESH_TOKEN);
    let hasServiceAccount = false;
    try {
        hasServiceAccount = Boolean(getServiceAccount());
    } catch {
        hasServiceAccount = false;
    }

    return {
        available: Boolean((oauth && hasRefreshToken) || hasServiceAccount),
        mode: oauth && hasRefreshToken ? 'oauth_refresh_token' : hasServiceAccount ? 'service_account' : 'sitemap_only',
        hasApiKey: Boolean(process.env.GOOGLE_API_KEY),
        hasOAuthClient: Boolean(oauth),
        hasRefreshToken,
        hasServiceAccount,
        siteUrl: process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL || process.env.GOOGLE_SITE_URL || null,
        message:
            (oauth && hasRefreshToken) || hasServiceAccount
                ? 'Google Search Console API auth is configured.'
                : 'Sitemap generation works, but Search Console submission requires OAuth refresh token or service account access.',
    };
}

export function assertGoogleEnv() {
    const missing = [];

    if (!process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL && !process.env.GOOGLE_SITE_URL) {
        missing.push('GOOGLE_SEARCH_CONSOLE_SITE_URL or GOOGLE_SITE_URL');
    }

    const status = getGoogleAuthStatus();
    if (!status.available) {
        missing.push('GOOGLE_REFRESH_TOKEN with OAuth client credentials, or GOOGLE_SERVICE_ACCOUNT_JSON');
    }

    return {
        ok: missing.length === 0,
        missing,
        status,
    };
}

export function buildGoogleOAuthUrl(state = 'speedyindexer') {
    const missing = getMissingOAuthEnv({ requireSecret: false });
    if (missing.length > 0) {
        throw new Error(`Missing required Google OAuth environment variables: ${missing.join(', ')}`);
    }

    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        response_type: 'code',
        scope: SCOPE,
        access_type: 'offline',
        prompt: 'consent',
        include_granted_scopes: 'true',
        state,
    });

    return `${AUTH_URL}?${params.toString()}`;
}

async function exchangeOAuthCode(code) {
    const oauth = getOAuthConfig();
    if (!oauth) {
        throw new Error('OAuth client credentials are not configured.');
    }

    const response = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            code,
            client_id: oauth.clientId,
            client_secret: oauth.clientSecret,
            redirect_uri: oauth.redirectUri,
            grant_type: 'authorization_code',
        }),
    });

    const body = await response.json().catch(() => ({}));
    await logGoogleResponse('oauth_code_exchange', response.status, body);

    if (!response.ok) {
        throw new Error(body.error_description || body.error || `Google OAuth exchange failed with ${response.status}`);
    }

    return body;
}

async function getOAuthAccessToken() {
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

async function getServiceAccountAccessToken() {
    const account = getServiceAccount();
    if (!account) return null;

    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const claim = {
        iss: account.client_email,
        scope: SCOPE,
        aud: TOKEN_URL,
        exp: now + 3600,
        iat: now,
    };
    const unsigned = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(claim))}`;
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

    return {
        token: body.access_token,
        expiresAt: Date.now() + Number(body.expires_in || 3600) * 1000,
    };
}

async function getAccessToken() {
    if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
        return cachedToken.token;
    }

    const oauthToken = await getOAuthAccessToken();
    cachedToken = oauthToken || await getServiceAccountAccessToken();

    if (!cachedToken) {
        throw new Error('Google Search Console auth is not configured. Add OAuth refresh token or service account access.');
    }

    return cachedToken.token;
}

function redactGoogleBody(body) {
    if (!body || typeof body !== 'object') return body;
    const copy = { ...body };
    for (const key of ['access_token', 'refresh_token', 'id_token']) {
        if (copy[key]) copy[key] = '[redacted]';
    }
    return copy;
}

export async function logGoogleResponse(action, status, body, extra = {}) {
    try {
        await workerSupabase
            .from('google_api_logs')
            .insert({
                action,
                status_code: status,
                response: redactGoogleBody(body),
                metadata: extra,
            });
    } catch {
        // Logging must never break indexing/discovery work.
    }
}

async function googleFetch(path, options = {}) {
    const token = await getAccessToken();
    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            Authorization: `Bearer ${token}`,
            ...(options.body ? { 'Content-Type': 'application/json' } : {}),
            ...(options.headers || {}),
        },
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    await logGoogleResponse(options.action || path, response.status, data);

    if (response.status === 204) return null;

    if (!response.ok) {
        throw new Error(data?.error?.message || `Search Console API failed with ${response.status}`);
    }

    return data;
}

export async function listSearchConsoleSites() {
    return googleFetch('/sites', { action: 'list_sites' });
}

export async function getSearchConsoleProperty(siteUrl = getSiteUrl()) {
    const data = await listSearchConsoleSites();
    const entry = data?.siteEntry?.find((site) => site.siteUrl === siteUrl);
    return entry || null;
}

export async function assertSearchConsoleAccess(siteUrl = getSiteUrl()) {
    const property = await getSearchConsoleProperty(siteUrl);

    if (!property) {
        throw new Error(`Configured Google auth does not have Search Console access to property: ${siteUrl}`);
    }

    return property;
}

export async function submitSitemapToGoogle(sitemapUrl, siteUrl = getSiteUrl()) {
    await assertSearchConsoleAccess(siteUrl);
    await googleFetch(
        `/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`,
        { method: 'PUT', action: 'submit_sitemap' }
    );
    return { siteUrl, sitemapUrl, submitted: true };
}

export async function getSitemapStatus(sitemapUrl, siteUrl = getSiteUrl()) {
    await assertSearchConsoleAccess(siteUrl);
    return googleFetch(
        `/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`,
        { action: 'sitemap_status' }
    );
}

export async function getSearchAnalytics({
    siteUrl = getSiteUrl(),
    startDate,
    endDate,
    dimensions = ['page'],
    rowLimit = 100,
} = {}) {
    await assertSearchConsoleAccess(siteUrl);

    return googleFetch(`/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
        method: 'POST',
        action: 'search_analytics',
        body: JSON.stringify({
            startDate,
            endDate,
            dimensions,
            rowLimit,
        }),
    });
}

export async function exchangeGoogleOAuthCode(code) {
    return exchangeOAuthCode(code);
}
