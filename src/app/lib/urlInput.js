const MAX_URL_LENGTH = 2048;

export function sanitizeText(value, maxLength = MAX_URL_LENGTH) {
    return String(value || '')
        .replace(/[\u0000-\u001f\u007f]/g, '')
        .trim()
        .slice(0, maxLength);
}

export function normalizeUrl(value) {
    const clean = sanitizeText(value);

    try {
        const parsed = new URL(clean);
        if (!['http:', 'https:'].includes(parsed.protocol)) return null;
        parsed.hash = '';
        return parsed.toString();
    } catch {
        return null;
    }
}

export function normalizeUrlList(values, maxUrls = 10000) {
    const input = Array.isArray(values)
        ? values
        : String(values || '').split(/[\r\n,\s]+/);

    const seen = new Set();
    const urls = [];
    let invalid = 0;
    let duplicate = 0;

    for (const value of input) {
        const url = normalizeUrl(value);

        if (!url) {
            if (String(value || '').trim()) invalid += 1;
            continue;
        }

        if (seen.has(url)) {
            duplicate += 1;
            continue;
        }

        seen.add(url);
        urls.push(url);

        if (urls.length >= maxUrls) break;
    }

    return { urls, invalid, duplicate };
}
