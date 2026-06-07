export async function submitToIndexNow(url) {
    if (!process.env.INDEXNOW_HOST || !process.env.INDEXNOW_KEY) {
        throw new Error('INDEXNOW_HOST and INDEXNOW_KEY are required');
    }

    if (
        process.env.INDEXNOW_HOST === 'localhost' ||
        url.includes('example.com')
    ) {
        console.log('Skipping IndexNow in local test:', url);
        return true;
    }

    const host = process.env.INDEXNOW_HOST
        .replace(/^https?:\/\//i, '')
        .replace(/\/.*$/, '');

    const response = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            host,
            key: process.env.INDEXNOW_KEY,
            keyLocation:
                process.env.INDEXNOW_KEY_LOCATION ||
                `https://${host}/${process.env.INDEXNOW_KEY}.txt`,
            urlList: [url],
        }),
    });

    if (!response.ok) {
        throw new Error(`IndexNow failed with status ${response.status}`);
    }

    return true;
}
