import { z } from "zod";

export const platformSchema = z.enum(["youtube", "tiktok", "instagram"]);

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
