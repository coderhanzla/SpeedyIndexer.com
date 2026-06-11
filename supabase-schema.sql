create table if not exists public.urls (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    url text not null,
    status text not null default 'queued',
    response text,
    http_status integer,
    final_url text,
    canonical_url text,
    robots_blocked boolean not null default false,
    noindex boolean not null default false,
    validation_result jsonb,
    sitemap_url text,
    sitemap_index_url text,
    submitted_at timestamptz,
    discovery_submitted_at timestamptz,
    recheck_at timestamptz,
    indexed_at timestamptz,
    index_checked_at timestamptz,
    index_check_result jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.urls add column if not exists http_status integer;
alter table public.urls add column if not exists final_url text;
alter table public.urls add column if not exists canonical_url text;
alter table public.urls add column if not exists robots_blocked boolean not null default false;
alter table public.urls add column if not exists noindex boolean not null default false;
alter table public.urls add column if not exists validation_result jsonb;
alter table public.urls add column if not exists sitemap_url text;
alter table public.urls add column if not exists sitemap_index_url text;
alter table public.urls add column if not exists discovery_submitted_at timestamptz;
alter table public.urls add column if not exists recheck_at timestamptz;
alter table public.urls add column if not exists indexed_at timestamptz;
alter table public.urls add column if not exists index_checked_at timestamptz;
alter table public.urls add column if not exists index_check_result jsonb;

create unique index if not exists urls_user_id_url_key
    on public.urls (user_id, url);

create index if not exists urls_user_id_created_at_idx
    on public.urls (user_id, created_at desc);

create index if not exists urls_status_idx
    on public.urls (status);

create table if not exists public.google_sitemaps (
    id uuid primary key default gen_random_uuid(),
    batch_number integer not null unique,
    file_name text not null unique,
    sitemap_url text not null,
    url_count integer not null default 0,
    status text not null default 'active',
    submitted_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.google_sitemap_urls (
    id uuid primary key default gen_random_uuid(),
    sitemap_id uuid not null references public.google_sitemaps(id) on delete cascade,
    url_id uuid not null references public.urls(id) on delete cascade,
    url text not null,
    lastmod timestamptz not null default now(),
    created_at timestamptz not null default now(),
    unique(url_id)
);

create index if not exists google_sitemap_urls_sitemap_id_idx
    on public.google_sitemap_urls (sitemap_id);

create table if not exists public.url_logs (
    id uuid primary key default gen_random_uuid(),
    url_id uuid not null references public.urls(id) on delete cascade,
    event text not null,
    message text,
    metadata jsonb,
    created_at timestamptz not null default now()
);

create index if not exists url_logs_url_id_created_at_idx
    on public.url_logs (url_id, created_at desc);

create table if not exists public.google_api_logs (
    id uuid primary key default gen_random_uuid(),
    action text not null,
    status_code integer,
    response jsonb,
    metadata jsonb,
    created_at timestamptz not null default now()
);

create index if not exists google_api_logs_created_at_idx
    on public.google_api_logs (created_at desc);

create table if not exists public.user_credits (
    user_id uuid primary key references auth.users(id) on delete cascade,
    email text,
    credits_balance integer not null default 0,
    total_credits_purchased integer not null default 0,
    total_credits_used integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint user_credits_balance_nonnegative check (credits_balance >= 0),
    constraint user_credits_purchased_nonnegative check (total_credits_purchased >= 0),
    constraint user_credits_used_nonnegative check (total_credits_used >= 0)
);

alter table public.user_credits add column if not exists email text;
alter table public.user_credits add column if not exists credits_balance integer not null default 0;
alter table public.user_credits add column if not exists total_credits_purchased integer not null default 0;
alter table public.user_credits add column if not exists total_credits_used integer not null default 0;
alter table public.user_credits add column if not exists created_at timestamptz not null default now();
alter table public.user_credits add column if not exists updated_at timestamptz not null default now();

create index if not exists user_credits_email_idx
    on public.user_credits (lower(email));

create table if not exists public.credit_transactions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    type text not null,
    amount integer not null,
    balance_after integer not null,
    note text,
    created_at timestamptz not null default now(),
    created_by_admin uuid references auth.users(id),
    constraint credit_transactions_type_check check (
        type in ('credit_added', 'credit_used', 'credit_refund', 'credit_deducted_manual')
    ),
    constraint credit_transactions_amount_positive check (amount > 0),
    constraint credit_transactions_balance_nonnegative check (balance_after >= 0)
);

create index if not exists credit_transactions_user_id_created_at_idx
    on public.credit_transactions (user_id, created_at desc);

create index if not exists credit_transactions_created_at_idx
    on public.credit_transactions (created_at desc);

create or replace function public.add_user_credits(
    p_user_id uuid,
    p_amount integer,
    p_note text default null,
    p_created_by_admin uuid default null
)
returns public.user_credits
language plpgsql
security definer
set search_path = public
as $$
declare
    v_account public.user_credits;
begin
    if p_amount is null or p_amount <= 0 then
        raise exception 'Amount must be a positive integer';
    end if;

    insert into public.user_credits (user_id)
    values (p_user_id)
    on conflict (user_id) do nothing;

    select *
    into v_account
    from public.user_credits
    where user_id = p_user_id
    for update;

    update public.user_credits
    set credits_balance = credits_balance + p_amount,
        total_credits_purchased = total_credits_purchased + p_amount,
        updated_at = now()
    where user_id = p_user_id
    returning * into v_account;

    insert into public.credit_transactions (user_id, type, amount, balance_after, note, created_by_admin)
    values (p_user_id, 'credit_added', p_amount, v_account.credits_balance, coalesce(p_note, 'Manual credit add'), p_created_by_admin);

    return v_account;
end;
$$;

create or replace function public.refund_user_credits(
    p_user_id uuid,
    p_amount integer,
    p_note text default null,
    p_created_by_admin uuid default null
)
returns public.user_credits
language plpgsql
security definer
set search_path = public
as $$
declare
    v_account public.user_credits;
begin
    if p_amount is null or p_amount <= 0 then
        raise exception 'Amount must be a positive integer';
    end if;

    insert into public.user_credits (user_id)
    values (p_user_id)
    on conflict (user_id) do nothing;

    select *
    into v_account
    from public.user_credits
    where user_id = p_user_id
    for update;

    update public.user_credits
    set credits_balance = credits_balance + p_amount,
        updated_at = now()
    where user_id = p_user_id
    returning * into v_account;

    insert into public.credit_transactions (user_id, type, amount, balance_after, note, created_by_admin)
    values (p_user_id, 'credit_refund', p_amount, v_account.credits_balance, coalesce(p_note, 'Credit refund'), p_created_by_admin);

    return v_account;
end;
$$;

create or replace function public.deduct_user_credits(
    p_user_id uuid,
    p_amount integer,
    p_note text default null,
    p_created_by_admin uuid default null
)
returns public.user_credits
language plpgsql
security definer
set search_path = public
as $$
declare
    v_account public.user_credits;
begin
    if p_amount is null or p_amount <= 0 then
        raise exception 'Amount must be a positive integer';
    end if;

    insert into public.user_credits (user_id)
    values (p_user_id)
    on conflict (user_id) do nothing;

    select *
    into v_account
    from public.user_credits
    where user_id = p_user_id
    for update;

    if v_account.credits_balance < p_amount then
        raise exception 'Insufficient credits. Please buy more credits.';
    end if;

    update public.user_credits
    set credits_balance = credits_balance - p_amount,
        updated_at = now()
    where user_id = p_user_id
    returning * into v_account;

    insert into public.credit_transactions (user_id, type, amount, balance_after, note, created_by_admin)
    values (p_user_id, 'credit_deducted_manual', p_amount, v_account.credits_balance, coalesce(p_note, 'Manual credit deduction'), p_created_by_admin);

    return v_account;
end;
$$;

create or replace function public.use_user_credits(
    p_user_id uuid,
    p_amount integer,
    p_note text default null
)
returns public.user_credits
language plpgsql
security definer
set search_path = public
as $$
declare
    v_account public.user_credits;
begin
    if p_amount is null or p_amount <= 0 then
        raise exception 'Amount must be a positive integer';
    end if;

    insert into public.user_credits (user_id)
    values (p_user_id)
    on conflict (user_id) do nothing;

    select *
    into v_account
    from public.user_credits
    where user_id = p_user_id
    for update;

    if v_account.credits_balance < p_amount then
        raise exception 'Insufficient credits. Please buy more credits.';
    end if;

    update public.user_credits
    set credits_balance = credits_balance - p_amount,
        total_credits_used = total_credits_used + p_amount,
        updated_at = now()
    where user_id = p_user_id
    returning * into v_account;

    insert into public.credit_transactions (user_id, type, amount, balance_after, note)
    values (p_user_id, 'credit_used', p_amount, v_account.credits_balance, coalesce(p_note, p_amount::text || ' URL submissions'));

    return v_account;
end;
$$;

alter table public.urls enable row level security;
alter table public.google_sitemaps enable row level security;
alter table public.google_sitemap_urls enable row level security;
alter table public.url_logs enable row level security;
alter table public.google_api_logs enable row level security;
alter table public.user_credits enable row level security;
alter table public.credit_transactions enable row level security;

drop policy if exists "Users can read their URLs" on public.urls;
create policy "Users can read their URLs"
    on public.urls
    for select
    to authenticated
    using (auth.uid() = user_id);

drop policy if exists "Users can insert their URLs" on public.urls;
create policy "Users can insert their URLs"
    on public.urls
    for insert
    to authenticated
    with check (auth.uid() = user_id);

drop policy if exists "Users can update their URLs" on public.urls;
create policy "Users can update their URLs"
    on public.urls
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

drop policy if exists "Users can read URL logs" on public.url_logs;
create policy "Users can read URL logs"
    on public.url_logs
    for select
    to authenticated
    using (
        exists (
            select 1
            from public.urls
            where urls.id = url_logs.url_id
            and urls.user_id = auth.uid()
        )
    );

drop policy if exists "Anyone can read generated sitemap batches" on public.google_sitemaps;
create policy "Anyone can read generated sitemap batches"
    on public.google_sitemaps
    for select
    to anon, authenticated
    using (true);

drop policy if exists "Anyone can read generated sitemap URLs" on public.google_sitemap_urls;
create policy "Anyone can read generated sitemap URLs"
    on public.google_sitemap_urls
    for select
    to anon, authenticated
    using (true);

drop policy if exists "Authenticated users can read Google API logs" on public.google_api_logs;
create policy "Authenticated users can read Google API logs"
    on public.google_api_logs
    for select
    to authenticated
    using (true);

drop policy if exists "Users can read their credit balance" on public.user_credits;
create policy "Users can read their credit balance"
    on public.user_credits
    for select
    to authenticated
    using (auth.uid() = user_id);

drop policy if exists "Users can read their credit transactions" on public.credit_transactions;
create policy "Users can read their credit transactions"
    on public.credit_transactions
    for select
    to authenticated
    using (auth.uid() = user_id);
