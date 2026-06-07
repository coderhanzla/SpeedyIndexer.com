# SpeedyIndexer.com

Next.js frontend with a Supabase + Redis/BullMQ Google discovery pipeline.

## Make Google Discovery Functional

1. Copy `.env.example` to `.env.local` and fill in every value.
2. In Supabase SQL Editor, run `supabase-schema.sql`.
3. Start Redis locally or point `REDIS_URL` to a hosted Redis instance.
4. Set `GOOGLE_SEARCH_CONSOLE_SITE_URL` to the verified Search Console property URL.
5. Set `NEXT_PUBLIC_SITE_URL` to the public app URL that serves generated
   sitemap files.
6. Configure Google Search Console auth. OAuth is recommended when service
   account JSON key creation is blocked by `iam.disableServiceAccountKeyCreation`.
7. Start the web app:
   `npm run dev`
8. In a second terminal, start the Google discovery worker:
   `npm run worker`
9. Sign up/login in the site, open `/submit`, paste URLs, and submit.
10. Add credits to the user first from `/admin/credits`. URL submission is
    blocked unless the user has enough credits.

Submitted URLs are inserted into the Supabase `urls` table with `submitted`,
validated by the worker, added to generated sitemap batches, submitted to
Google Search Console as a sitemap index, then updated through:
`submitted`, `validating`, `valid`, `sitemap_added`, `sitemap_submitted`,
`completed`, or `failed`.

This project does not promise guaranteed Google indexing. It improves Google
discovery by validating URLs, maintaining sitemaps, and submitting those
sitemaps through Search Console.

## Google OAuth Setup

Use this path if service-account JSON keys are blocked.

1. In Google Cloud Console, enable the Search Console API.
2. Create an OAuth Client ID with type `Web application`.
3. Add this authorized redirect URI:
   `https://your-site.com/api/google/auth/callback`
4. Put these values in `.env.local`:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI`
   - `GOOGLE_SEARCH_CONSOLE_SITE_URL`
5. Open `/api/google/auth/start` in the browser while signed into the Google
   account that owns or has full Search Console access to the property.
6. The callback returns a `refresh_token`. Put it in `.env.local` as
   `GOOGLE_REFRESH_TOKEN`.
7. Restart the app and worker.

`GOOGLE_API_KEY` can be stored for future Google APIs, but it does not authorize
Search Console sitemap submission by itself.

## Supabase Setup

Run `supabase-schema.sql` in Supabase SQL Editor. Required tables include:

- `urls`
- `url_logs`
- `google_sitemaps`
- `google_sitemap_urls`
- `google_api_logs`
- `user_credits`
- `credit_transactions`

Use the anon key for frontend auth and the service role key only on the server.

## Manual Credit System

There is no payment gateway in this build. Payments are confirmed manually, then
admin adds credits to the user account from `/admin/credits`.

Credit rule:

- `1 Credit = 1 URL submission`
- Credits never expire
- Credits do not reset daily
- Backend submission routes reject requests when balance is too low

Plans:

- Starter: 40 credits, $3
- Basic: 250 credits, $12
- Pro: 1,000 credits, $45
- Growth: 2,000 credits, $87
- Agency: 5,000 credits, $199
- Enterprise: 15,000 credits, $350

Set `ADMIN_EMAIL` in `.env.local`. The matching signed-in user can add or
deduct credits. Every change is logged in `credit_transactions`.

## Redis Setup

Install Redis locally or use a hosted Redis provider, then set:

`REDIS_URL=redis://127.0.0.1:6379`

The app queues jobs with BullMQ. The worker consumes those jobs separately.

## API

- `POST /api/submit`
- `POST /api/bulk-submit`
- `GET /api/stats`
- `GET /api/jobs`
- `GET /api/jobs/:id`
- `GET /api/credits/balance`
- `GET /api/credits/history`
- `POST /api/admin/credits/add`
- `POST /api/admin/credits/deduct`
- `GET /api/admin/credits/transactions`
- `GET /api/sitemap/status`
- `POST /api/sitemap/submit`
- `GET /api/queue`
- `GET /api/google/auth/status`
- `GET /api/google/auth/start`
- `GET /api/google/auth/callback`

## Public Sitemap URLs

- `/sitemaps/google-discovery-index.xml`
- `/sitemaps/google-discovery-0001.xml`

## Test 10 URLs

1. Start Redis.
2. Run `npm run dev`.
3. Run `npm run worker` in a second terminal.
4. Sign in to the app.
5. Sign in as admin, open `/admin/credits`, search the user email, and add
   1,000 credits.
6. Open `/submit`.
7. Paste 10 URLs from the verified Search Console property.
8. Submit and watch `/dashboard`.
9. Check `/api/jobs`, `/api/credits/balance`, and `/api/sitemap/status` with
   your bearer token.

Credit test:

1. Admin adds 1,000 credits to a user.
2. User submits 200 URLs.
3. Expected result: 200 URLs queued, 200 credits used, balance becomes 800.
4. Refresh the next day. Expected result: balance is still 800 unless more URLs
   were submitted.

Expected statuses:

- `queued`
- `validating`
- `valid`
- `invalid`
- `sitemap_added`
- `sitemap_submitted`
- `google_submission_failed`
- `completed`
- `failed`
