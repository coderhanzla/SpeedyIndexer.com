import { workerSupabase } from '../lib/workersupabase.js';

export const MAX_URLS_PER_SITEMAP = 50000;

function getBaseUrl() {
    return (process.env.NEXT_PUBLIC_SITE_URL || 'https://speedyindexer.com').replace(/\/$/, '');
}

export function escapeXml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export function getSitemapIndexUrl() {
    return `${getBaseUrl()}/sitemaps/google-discovery-index.xml`;
}

export function getSitemapUrl(file_name) {
    return `${getBaseUrl()}/sitemaps/${file_name}`;
}

async function getOpenSitemapBatch() {
    const { data } = await workerSupabase
        .from('google_sitemaps')
        .select('*')
        .lt('url_count', MAX_URLS_PER_SITEMAP)
        .order('batch_number', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (data) return data;

    const { data: latest } = await workerSupabase
        .from('google_sitemaps')
        .select('batch_number')
        .order('batch_number', { ascending: false })
        .limit(1)
        .maybeSingle();

    const batchNumber = Number(latest?.batch_number || 0) + 1;
    const fileName = `google-discovery-${String(batchNumber).padStart(4, '0')}.xml`;
    const { data: created, error } = await workerSupabase
        .from('google_sitemaps')
        .insert({
            batch_number: batchNumber,
            file_name: fileName,
            sitemap_url: getSitemapUrl(fileName),
            url_count: 0,
            status: 'active',
        })
        .select()
        .single();

    if (error) throw error;
    return created;
}

export async function addUrlToGoogleSitemap(urlRecord, validationResult) {
    const batch = await getOpenSitemapBatch();

    const { error: urlError } = await workerSupabase
        .from('google_sitemap_urls')
        .upsert(
            {
                sitemap_id: batch.id,
                url_id: urlRecord.id,
                url: validationResult.finalUrl || urlRecord.url,
                lastmod: new Date().toISOString(),
            },
            { onConflict: 'url_id' }
        );

    if (urlError) throw urlError;

    const { error: sitemapError } = await workerSupabase
        .from('google_sitemaps')
        .update({
            url_count: Number(batch.url_count || 0) + 1,
            updated_at: new Date().toISOString(),
        })
        .eq('id', batch.id);

    if (sitemapError) throw sitemapError;

    return {
        ...batch,
        sitemap_url: batch.sitemap_url || getSitemapUrl(batch.file_name),
        index_url: getSitemapIndexUrl(),
    };
}

export async function renderSitemapIndex() {
    const { data, error } = await workerSupabase
        .from('google_sitemaps')
        .select('file_name, sitemap_url, updated_at')
        .order('batch_number', { ascending: true });

    if (error) throw error;

    const entries = (data || [])
        .map((item) => `  <sitemap>
    <loc>${escapeXml(item.sitemap_url || getSitemapUrl(item.file_name))}</loc>
    <lastmod>${escapeXml(item.updated_at || new Date().toISOString())}</lastmod>
  </sitemap>`)
        .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`;
}

export async function renderSitemapFile(fileName) {
    const { data: sitemap, error: sitemapError } = await workerSupabase
        .from('google_sitemaps')
        .select('id')
        .eq('file_name', fileName)
        .maybeSingle();

    if (sitemapError) throw sitemapError;
    if (!sitemap) return null;

    const { data, error } = await workerSupabase
        .from('google_sitemap_urls')
        .select('url,lastmod')
        .eq('sitemap_id', sitemap.id)
        .order('created_at', { ascending: true })
        .limit(MAX_URLS_PER_SITEMAP);

    if (error) throw error;

    const entries = (data || [])
        .map((item) => `  <url>
    <loc>${escapeXml(item.url)}</loc>
    <lastmod>${escapeXml(item.lastmod || new Date().toISOString())}</lastmod>
  </url>`)
        .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}
