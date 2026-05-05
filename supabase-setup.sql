-- ClipBounty MVP database setup / repair
-- Run this in Supabase SQL Editor. Safe to re-run.

create extension if not exists "pgcrypto";

do $$ begin
  create type user_role as enum ('worker', 'buyer', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type campaign_status as enum ('draft', 'active', 'paused', 'completed');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type clip_status as enum ('submitted', 'approved', 'rejected', 'payable', 'paid');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type platform as enum ('youtube', 'tiktok', 'instagram');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type payout_status as enum ('pending', 'sent', 'failed');
exception
  when duplicate_object then null;
end $$;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  telegram_user_id varchar(64) not null unique,
  telegram_username varchar(64),
  role user_role not null default 'worker',
  country_code varchar(8),
  country varchar(8) not null default 'IN',
  display_name text,
  ton_wallet_address text,
  tiktok_handle text,
  tiktok_followers integer not null default 0,
  instagram_handle text,
  instagram_followers integer not null default 0,
  youtube_handle text,
  youtube_subscribers integer not null default 0,
  niches jsonb default '[]'::jsonb,
  is_profile_complete boolean not null default false,
  risk_score integer not null default 0,
  is_banned boolean not null default false,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

alter table users add column if not exists telegram_username varchar(64);
alter table users add column if not exists country_code varchar(8);
alter table users add column if not exists country varchar(8) not null default 'IN';
alter table users add column if not exists display_name text;
alter table users add column if not exists ton_wallet_address text;
alter table users add column if not exists tiktok_handle text;
alter table users add column if not exists tiktok_followers integer not null default 0;
alter table users add column if not exists instagram_handle text;
alter table users add column if not exists instagram_followers integer not null default 0;
alter table users add column if not exists youtube_handle text;
alter table users add column if not exists youtube_subscribers integer not null default 0;
alter table users add column if not exists niches jsonb default '[]'::jsonb;
alter table users add column if not exists is_profile_complete boolean not null default false;
alter table users add column if not exists risk_score integer not null default 0;
alter table users add column if not exists is_banned boolean not null default false;
alter table users add column if not exists created_at timestamp not null default now();
alter table users add column if not exists updated_at timestamp not null default now();
create unique index if not exists users_telegram_user_id_idx on users(telegram_user_id);
create index if not exists users_profile_complete_idx on users(is_profile_complete);

create table if not exists campaign_sources (
  id uuid primary key default gen_random_uuid(),
  source_platform text not null,
  external_campaign_id text,
  external_url text not null unique,
  raw_data jsonb,
  last_fetched_at timestamp not null default now(),
  is_active boolean not null default true
);

alter table campaign_sources add column if not exists source_platform text not null default 'manual';
alter table campaign_sources alter column source_platform drop default;
alter table campaign_sources add column if not exists external_campaign_id text;
alter table campaign_sources add column if not exists external_url text not null default 'manual';
alter table campaign_sources alter column external_url drop default;
alter table campaign_sources add column if not exists raw_data jsonb;
alter table campaign_sources add column if not exists last_fetched_at timestamp not null default now();
alter table campaign_sources add column if not exists is_active boolean not null default true;
create unique index if not exists campaign_sources_external_url_idx on campaign_sources(external_url);
create index if not exists campaign_sources_platform_idx on campaign_sources(source_platform);

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references users(id),
  source_id uuid references campaign_sources(id),
  title varchar(160) not null,
  description text,
  platform platform not null,
  status campaign_status not null default 'draft',
  budget_usd numeric(12,2) not null,
  remaining_budget_usd numeric(12,2) not null,
  buyer_cpm_usd numeric(8,4) not null,
  worker_cpm_usd numeric(8,4) not null,
  is_imported boolean not null default false,
  external_payout_per_1k real,
  our_payout_per_1k real,
  geographic_restriction text not null default 'global',
  approval_rate_pct integer,
  budget_pct_remaining integer,
  niche text default 'general',
  required_hashtags jsonb default '[]'::jsonb,
  rules jsonb default '[]'::jsonb,
  source_asset_urls jsonb default '[]'::jsonb,
  landing_url text,
  min_views_to_pay integer not null default 1000,
  max_views_per_clip integer,
  review_required boolean not null default true,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

alter table campaigns add column if not exists buyer_id uuid references users(id);
alter table campaigns add column if not exists source_id uuid references campaign_sources(id);
alter table campaigns add column if not exists description text;
alter table campaigns add column if not exists platform platform not null default 'youtube';
alter table campaigns alter column platform drop default;
alter table campaigns add column if not exists status campaign_status not null default 'draft';
alter table campaigns add column if not exists budget_usd numeric(12,2) not null default 0;
alter table campaigns add column if not exists remaining_budget_usd numeric(12,2) not null default 0;
alter table campaigns add column if not exists buyer_cpm_usd numeric(8,4) not null default 0;
alter table campaigns add column if not exists worker_cpm_usd numeric(8,4) not null default 0;
alter table campaigns add column if not exists is_imported boolean not null default false;
alter table campaigns add column if not exists external_payout_per_1k real;
alter table campaigns add column if not exists our_payout_per_1k real;
alter table campaigns add column if not exists geographic_restriction text not null default 'global';
alter table campaigns add column if not exists approval_rate_pct integer;
alter table campaigns add column if not exists budget_pct_remaining integer;
alter table campaigns add column if not exists niche text default 'general';
alter table campaigns add column if not exists required_hashtags jsonb default '[]'::jsonb;
alter table campaigns add column if not exists rules jsonb default '[]'::jsonb;
alter table campaigns add column if not exists source_asset_urls jsonb default '[]'::jsonb;
alter table campaigns add column if not exists landing_url text;
alter table campaigns add column if not exists min_views_to_pay integer not null default 1000;
alter table campaigns add column if not exists max_views_per_clip integer;
alter table campaigns add column if not exists review_required boolean not null default true;
alter table campaigns add column if not exists created_at timestamp not null default now();
alter table campaigns add column if not exists updated_at timestamp not null default now();
create index if not exists campaign_status_idx on campaigns(status);
create index if not exists campaign_buyer_idx on campaigns(buyer_id);
create index if not exists campaign_source_idx on campaigns(source_id);
create index if not exists campaign_imported_idx on campaigns(is_imported);

create table if not exists clips (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id),
  worker_id uuid references users(id),
  platform platform not null,
  url text not null unique,
  platform_video_id text,
  status clip_status not null default 'submitted',
  current_views integer not null default 0,
  payable_views integer not null default 0,
  estimated_earnings_usd numeric(10,4) not null default 0,
  fraud_score integer not null default 0,
  fraud_reasons jsonb default '[]'::jsonb,
  source_submission_status text not null default 'needs_submission',
  source_submitted_at timestamp,
  source_reviewed_at timestamp,
  source_external_submission_id text,
  source_submission_notes text,
  submitted_at timestamp not null default now(),
  reviewed_at timestamp,
  last_tracked_at timestamp
);

alter table clips add column if not exists worker_id uuid references users(id);
alter table clips add column if not exists platform_video_id text;
alter table clips add column if not exists current_views integer not null default 0;
alter table clips add column if not exists payable_views integer not null default 0;
alter table clips add column if not exists estimated_earnings_usd numeric(10,4) not null default 0;
alter table clips add column if not exists fraud_score integer not null default 0;
alter table clips add column if not exists fraud_reasons jsonb default '[]'::jsonb;
alter table clips add column if not exists source_submission_status text not null default 'needs_submission';
alter table clips add column if not exists source_submitted_at timestamp;
alter table clips add column if not exists source_reviewed_at timestamp;
alter table clips add column if not exists source_external_submission_id text;
alter table clips add column if not exists source_submission_notes text;
alter table clips add column if not exists submitted_at timestamp not null default now();
alter table clips add column if not exists reviewed_at timestamp;
alter table clips add column if not exists last_tracked_at timestamp;
create index if not exists clips_campaign_idx on clips(campaign_id);
create index if not exists clips_worker_idx on clips(worker_id);
create index if not exists clips_source_submission_idx on clips(source_submission_status);
create unique index if not exists clips_url_idx on clips(url);

create table if not exists view_snapshots (
  id uuid primary key default gen_random_uuid(),
  clip_id uuid not null references clips(id),
  views integer not null,
  likes integer not null default 0,
  comments integer not null default 0,
  shares integer not null default 0,
  raw jsonb,
  observed_at timestamp not null default now()
);

create index if not exists view_snapshots_clip_time_idx on view_snapshots(clip_id, observed_at);

create table if not exists payouts (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid references users(id),
  clip_id uuid references clips(id),
  amount_usd numeric(10,4) not null,
  wallet_address text,
  status payout_status not null default 'pending',
  tx_hash text,
  created_at timestamp not null default now(),
  paid_at timestamp
);

alter table payouts add column if not exists worker_id uuid references users(id);
alter table payouts add column if not exists clip_id uuid references clips(id);
alter table payouts add column if not exists wallet_address text;
alter table payouts add column if not exists tx_hash text;
alter table payouts add column if not exists created_at timestamp not null default now();
alter table payouts add column if not exists paid_at timestamp;
create index if not exists payouts_worker_idx on payouts(worker_id);
create index if not exists payouts_clip_idx on payouts(clip_id);

insert into users (telegram_user_id, telegram_username, role)
values ('demo_buyer', 'demo_buyer', 'buyer')
on conflict (telegram_user_id) do nothing;

insert into campaigns (
  buyer_id,
  title,
  description,
  platform,
  status,
  budget_usd,
  remaining_budget_usd,
  buyer_cpm_usd,
  worker_cpm_usd,
  required_hashtags,
  rules,
  budget_pct_remaining,
  approval_rate_pct,
  geographic_restriction,
  niche
)
select
  users.id,
  'First Beta Clip Campaign',
  'Test campaign for your first ClipBounty MVP launch.',
  'youtube',
  'active',
  50.00,
  50.00,
  0.60,
  0.25,
  '["#clipbounty"]'::jsonb,
  '["Use buyer approved content", "No fake views", "Submit public clip links only"]'::jsonb,
  100,
  95,
  'global',
  'general'
from users
where users.telegram_user_id = 'demo_buyer'
and not exists (
  select 1 from campaigns where title = 'First Beta Clip Campaign'
);
