function validUrl(value) {
    try {
        const parsed = new URL(value);
        return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
        return false;
    }
}

function getMetaRobots(html) {
    const robots = [];
    const metaPattern = /<meta\s+[^>]*(?:name=["'](?:robots|googlebot)["'][^>]*content=["']([^"']+)["']|content=["']([^"']+)["'][^>]*name=["'](?:robots|googlebot)["'])[^>]*>/gi;
    let match;

    while ((match = metaPattern.exec(html))) {
        robots.push(String(match[1] || match[2] || '').toLowerCase());
    }

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
            continue;
        }

        if (!current) continue;
        if (key === 'disallow') current.disallow.push(value);
        if (key === 'allow') current.allow.push(value);
    }

    return groups;
}

function pathMatches(rule, path) {
    if (!rule) return false;
    const escaped = rule.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    return new RegExp(`^${escaped}`).test(path);
}

async function isBlockedByRobots(url) {
    const parsed = new URL(url);
    const robotsUrl = `${parsed.origin}/robots.txt`;
    const response = await fetch(robotsUrl, { redirect: 'follow' }).catch(() => null);

    if (!response || response.status === 404) return false;
    if (!response.ok) return false;

    const text = await response.text();
    const groups = parseRobotsGroups(text);
    const relevant = groups.filter((group) =>
        group.agents.some((agent) => agent === '*' || agent.includes('googlebot'))
    );

    const path = `${parsed.pathname}${parsed.search}`;
    let blocked = false;
    let bestLength = -1;

    for (const group of relevant) {
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

export async function validateUrlForGoogleDiscovery(url) {
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

    if (!validUrl(url)) {
        result.errors.push('Invalid URL format');
        return result;
    }

    try {
        result.robotsBlocked = await isBlockedByRobots(url);
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

        if (response.status !== 200) {
            result.errors.push(`HTTP status ${response.status}`);
        }

        const xRobots = response.headers.get('x-robots-tag') || '';
        const contentType = response.headers.get('content-type') || '';

        if (xRobots.toLowerCase().includes('noindex')) {
            result.noindex = true;
            result.errors.push('X-Robots-Tag noindex detected');
        }

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
