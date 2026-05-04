import { z } from "zod";

export const platformSchema = z.enum(["youtube", "tiktok", "instagram"]);
export const sourcePlatformSchema = z.enum(["whop", "vyro", "mrktplce", "manual"]);
export const geographicRestrictionSchema = z.enum(["global", "us_only", "eu_only"]);

export const createCampaignSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(160),
  platform: platformSchema,
  budgetUsd: z.coerce.number().positive("Budget must be greater than 0"),
  buyerCpmUsd: z.coerce.number().positive("Buyer CPM must be greater than 0"),
  workerCpmUsd: z.coerce.number().positive("Worker CPM must be greater than 0"),
  description: z.string().max(3000).optional(),
  rules: z.string().max(5000).optional(),
  requiredHashtags: z.string().max(1000).optional(),
  landingUrl: z.string().url().optional().or(z.literal("")),
});

export const importCampaignSchema = z.object({
  sourcePlatform: sourcePlatformSchema,
  externalUrl: z.string().url("Enter the Whop, Vyro, MRKTPLCE, or manual source URL"),
  externalCampaignId: z.string().max(200).optional(),
  title: z.string().min(3).max(160),
  description: z.string().max(3000).optional(),
  rules: z.string().max(5000).optional(),
  platform: platformSchema,
  budgetUsd: z.coerce.number().positive(),
  budgetPctRemaining: z.coerce.number().int().min(0).max(100),
  externalPayoutPer1k: z.coerce.number().positive(),
  ourPayoutPer1k: z.coerce.number().positive().optional(),
  approvalRatePct: z.coerce.number().int().min(0).max(100),
  geographicRestriction: geographicRestrictionSchema.default("global"),
  niche: z.string().max(80).optional(),
  requiredHashtags: z.string().max(1000).optional(),
  sourceAssetUrls: z.string().max(3000).optional(),
});

export const workerProfileSchema = z.object({
  displayName: z.string().min(2, "Display name is required").max(120),
  tonWalletAddress: z.string().min(8, "TON wallet is required for payouts").max(200),
  country: z.string().min(2).max(8).default("IN"),
  tiktokHandle: z.string().max(120).optional(),
  tiktokFollowers: z.coerce.number().int().min(0).default(0),
  instagramHandle: z.string().max(120).optional(),
  instagramFollowers: z.coerce.number().int().min(0).default(0),
  youtubeHandle: z.string().max(120).optional(),
  youtubeSubscribers: z.coerce.number().int().min(0).default(0),
  niches: z.array(z.string()).min(1, "Select at least one niche"),
});

export const submitClipSchema = z.object({
  campaignId: z.string().uuid("Campaign ID must be a valid UUID"),
  platform: platformSchema,
  url: z.string().url("Enter a valid public clip URL"),
  walletAddress: z.string().min(8, "Wallet address is required during beta payouts").max(200),
});

export function linesToArray(value?: string | null) {
  if (!value) return [];

  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function csvToArray(value?: string | null) {
  if (!value) return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
