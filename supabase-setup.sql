-- ClipBounty MVP database setup
-- Run this in Supabase SQL Editor once.

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
  country_code varchar(2),
  ton_wallet_address text,
  risk_score integer not null default 0,
  is_banned boolean not null default false,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references users(id),
  title varchar(160) not null,
  description text,
  platform platform not null,
  status campaign_status not null default 'draft',
  budget_usd numeric(12,2) not null,
  remaining_budget_usd numeric(12,2) not null,
  buyer_cpm_usd numeric(8,4) not null,
  worker_cpm_usd numeric(8,4) not null,
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

create index if not exists campaign_status_idx on campaigns(status);
create index if not exists campaign_buyer_idx on campaigns(buyer_id);

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
  submitted_at timestamp not null default now(),
  reviewed_at timestamp,
  last_tracked_at timestamp
);

create index if not exists clips_campaign_idx on clips(campaign_id);
create index if not exists clips_worker_idx on clips(worker_id);

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

-- Seed one demo buyer and campaign so your first dashboard is not empty.
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
  rules
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
  '["Use buyer approved content", "No fake views", "Submit public clip links only"]'::jsonb
from users
where users.telegram_user_id = 'demo_buyer'
and not exists (
  select 1 from campaigns where title = 'First Beta Clip Campaign'
);
