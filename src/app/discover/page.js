import Link from 'next/link';
import { workerSupabase } from '../lib/workersupabase.js';

export const revalidate = 300;

export const metadata = {
    title: 'Recent Submitted URLs | SpeedyIndexer',
    description: 'Public URL discovery page listing recent submitted URLs for crawler discovery.',
};

function formatDate(value) {
    if (!value) return '';
    return new Date(value).toISOString().slice(0, 10);
}

export default async function DiscoverPage() {
    const { data, error } = await workerSupabase
        .from('google_sitemap_urls')
        .select('url,lastmod,created_at')
        .order('created_at', { ascending: false })
        .limit(200);

    const urls = error ? [] : data || [];

    return (
        <main className="discover-shell">
            <header>
                <Link href="/">SpeedyIndexer</Link>
                <p>Public discovery links</p>
                <h1>Recent Submitted URLs</h1>
                <span>These URLs were submitted for discovery. Listing here helps crawlers find normal HTML links.</span>
            </header>

            <section>
                {urls.length === 0 && <p>No submitted URLs are available yet.</p>}
                {urls.map((item) => (
                    <article key={`${item.url}-${item.created_at}`}>
                        <a href={item.url} rel="nofollow">
                            {item.url}
                        </a>
                        <time dateTime={item.lastmod || item.created_at}>{formatDate(item.lastmod || item.created_at)}</time>
                    </article>
                ))}
            </section>
        </main>
    );
}
