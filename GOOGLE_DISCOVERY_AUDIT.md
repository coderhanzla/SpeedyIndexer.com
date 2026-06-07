# SpeedyIndexer Google Discovery Audit

## Implemented

- Google Search Console API service account auth.
- Search Console sitemap submission and sitemap status endpoint.
- OAuth refresh-token auth for Search Console, for deployments where service
  account JSON key creation is blocked.
- Service-account JSON auth remains optional.
- Sitemap-only fallback when Google auth is missing.
- Generated sitemap index at `/sitemaps/google-discovery-index.xml`.
- Generated sitemap batches at `/sitemaps/google-discovery-0001.xml`, etc.
- URL validation before sitemap inclusion:
  - URL format
  - HTTP 200
  - redirects
  - robots.txt blocking
  - meta/X-Robots noindex
  - canonical mismatch
- Bulk URL submit endpoint for the Google discovery pipeline.
- Per-URL logs in `url_logs`.
- Dashboard status tracking for:
  - `submitted`
  - `validating`
  - `valid`
  - `sitemap_added`
  - `sitemap_submitted`
  - `completed`
  - `failed`
- API endpoints:
  - `POST /api/submit`
  - `POST /api/bulk-submit`
  - `GET /api/stats`
  - `GET /api/jobs`
  - `GET /api/jobs/:id`
  - `GET /api/sitemap/status`
  - `POST /api/sitemap/submit`

## Required Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `REDIS_URL`
- `GOOGLE_SEARCH_CONSOLE_SITE_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `GOOGLE_REFRESH_TOKEN`

Alternative Google credential variables:

- `GOOGLE_SERVICE_ACCOUNT_JSON`
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY`

Optional Google API key:

- `GOOGLE_API_KEY`

Optional tuning:

- `GOOGLE_DISCOVERY_WORKER_CONCURRENCY`
- `GOOGLE_DISCOVERY_DAILY_LIMIT`
- `BULK_UPLOAD_MAX_BYTES`

## Deployment Blockers

- Run `supabase-schema.sql` before using the pipeline.
- OAuth user must have access to the verified Search Console property, or the
  service account email must be added to the property.
- `NEXT_PUBLIC_SITE_URL` must be publicly reachable by Google.
- Generated sitemap URLs must be accessible without authentication.
- Redis must be available to both the Next app and worker.
- If Google auth is missing, sitemap generation continues, but Search Console
  submission records `google_submission_failed`.

## Scalability Estimate

- Sitemap protocol limit: 50,000 URLs per sitemap file.
- Worker default concurrency: 5 URL validations at a time.
- Safe starting throughput: 5,000 to 10,000 URLs/day per deployment, depending on target-site response speed.
- Increase gradually only after monitoring HTTP errors, robots blocks, Search Console response status, and worker memory.

## Important Limit

This system improves Google discovery through validated sitemap generation and Search Console sitemap submission. It does not guarantee Google indexing.
