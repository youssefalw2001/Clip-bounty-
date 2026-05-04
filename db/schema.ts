import {
  pgEnum,
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  numeric,
  timestamp,
  boolean,
  jsonb,
  uniqueIndex,
  index,
  real,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["worker", "buyer", "admin"]);
export const campaignStatusEnum = pgEnum("campaign_status", ["draft", "active", "paused", "completed"]);
export const clipStatusEnum = pgEnum("clip_status", ["submitted", "approved", "rejected", "payable", "paid"]);
export const platformEnum = pgEnum("platform", ["youtube", "tiktok", "instagram"]);
export const payoutStatusEnum = pgEnum("payout_status", ["pending", "sent", "failed"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  telegramUserId: varchar("telegram_user_id", { length: 64 }).notNull(),
  telegramUsername: varchar("telegram_username", { length: 64 }),
  role: userRoleEnum("role").notNull().default("worker"),
  countryCode: varchar("country_code", { length: 8 }),
  country: varchar("country", { length: 8 }).notNull().default("IN"),
  displayName: text("display_name"),
  tonWalletAddress: text("ton_wallet_address"),
  tiktokHandle: text("tiktok_handle"),
  tiktokFollowers: integer("tiktok_followers").notNull().default(0),
  instagramHandle: text("instagram_handle"),
  instagramFollowers: integer("instagram_followers").notNull().default(0),
  youtubeHandle: text("youtube_handle"),
  youtubeSubscribers: integer("youtube_subscribers").notNull().default(0),
  niches: jsonb("niches").$type<string[]>().default([]),
  isProfileComplete: boolean("is_profile_complete").notNull().default(false),
  riskScore: integer("risk_score").notNull().default(0),
  isBanned: boolean("is_banned").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  telegramIdx: uniqueIndex("users_telegram_user_id_idx").on(table.telegramUserId),
  profileCompleteIdx: index("users_profile_complete_idx").on(table.isProfileComplete),
}));

export const campaignSources = pgTable("campaign_sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourcePlatform: text("source_platform").notNull(),
  externalCampaignId: text("external_campaign_id"),
  externalUrl: text("external_url").notNull(),
  rawData: jsonb("raw_data").$type<Record<string, unknown>>(),
  lastFetchedAt: timestamp("last_fetched_at").notNull().defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
}, (table) => ({
  externalUrlIdx: uniqueIndex("campaign_sources_external_url_idx").on(table.externalUrl),
  sourcePlatformIdx: index("campaign_sources_platform_idx").on(table.sourcePlatform),
}));

export const campaigns = pgTable("campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  buyerId: uuid("buyer_id").references(() => users.id),
  sourceId: uuid("source_id").references(() => campaignSources.id),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description"),
  platform: platformEnum("platform").notNull(),
  status: campaignStatusEnum("status").notNull().default("draft"),
  budgetUsd: numeric("budget_usd", { precision: 12, scale: 2 }).notNull(),
  remainingBudgetUsd: numeric("remaining_budget_usd", { precision: 12, scale: 2 }).notNull(),
  buyerCpmUsd: numeric("buyer_cpm_usd", { precision: 8, scale: 4 }).notNull(),
  workerCpmUsd: numeric("worker_cpm_usd", { precision: 8, scale: 4 }).notNull(),
  isImported: boolean("is_imported").notNull().default(false),
  externalPayoutPer1k: real("external_payout_per_1k"),
  ourPayoutPer1k: real("our_payout_per_1k"),
  geographicRestriction: text("geographic_restriction").notNull().default("global"),
  approvalRatePct: integer("approval_rate_pct"),
  budgetPctRemaining: integer("budget_pct_remaining"),
  niche: text("niche").default("general"),
  requiredHashtags: jsonb("required_hashtags").$type<string[]>().default([]),
  rules: jsonb("rules").$type<string[]>().default([]),
  sourceAssetUrls: jsonb("source_asset_urls").$type<string[]>().default([]),
  landingUrl: text("landing_url"),
  minViewsToPay: integer("min_views_to_pay").notNull().default(1000),
  maxViewsPerClip: integer("max_views_per_clip"),
  reviewRequired: boolean("review_required").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  statusIdx: index("campaign_status_idx").on(table.status),
  buyerIdx: index("campaign_buyer_idx").on(table.buyerId),
  sourceIdx: index("campaign_source_idx").on(table.sourceId),
  importedIdx: index("campaign_imported_idx").on(table.isImported),
}));

export const clips = pgTable("clips", {
  id: uuid("id").primaryKey().defaultRandom(),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id),
  workerId: uuid("worker_id").references(() => users.id),
  platform: platformEnum("platform").notNull(),
  url: text("url").notNull(),
  platformVideoId: text("platform_video_id"),
  status: clipStatusEnum("status").notNull().default("submitted"),
  currentViews: integer("current_views").notNull().default(0),
  payableViews: integer("payable_views").notNull().default(0),
  estimatedEarningsUsd: numeric("estimated_earnings_usd", { precision: 10, scale: 4 }).notNull().default("0"),
  fraudScore: integer("fraud_score").notNull().default(0),
  fraudReasons: jsonb("fraud_reasons").$type<string[]>().default([]),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  lastTrackedAt: timestamp("last_tracked_at"),
}, (table) => ({
  campaignIdx: index("clips_campaign_idx").on(table.campaignId),
  workerIdx: index("clips_worker_idx").on(table.workerId),
  uniqueClipUrl: uniqueIndex("clips_url_idx").on(table.url),
}));

export const viewSnapshots = pgTable("view_snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  clipId: uuid("clip_id").notNull().references(() => clips.id),
  views: integer("views").notNull(),
  likes: integer("likes").notNull().default(0),
  comments: integer("comments").notNull().default(0),
  shares: integer("shares").notNull().default(0),
  raw: jsonb("raw").$type<Record<string, unknown>>(),
  observedAt: timestamp("observed_at").notNull().defaultNow(),
}, (table) => ({
  clipTimeIdx: index("view_snapshots_clip_time_idx").on(table.clipId, table.observedAt),
}));

export const payouts = pgTable("payouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  workerId: uuid("worker_id").references(() => users.id),
  clipId: uuid("clip_id").references(() => clips.id),
  amountUsd: numeric("amount_usd", { precision: 10, scale: 4 }).notNull(),
  walletAddress: text("wallet_address"),
  status: payoutStatusEnum("status").notNull().default("pending"),
  txHash: text("tx_hash"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  paidAt: timestamp("paid_at"),
});
