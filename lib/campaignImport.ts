export type SourcePlatform = "whop" | "vyro" | "mrktplce" | "manual";

export type ImportedCampaignInput = {
  sourcePlatform: SourcePlatform;
  externalCampaignId?: string;
  externalUrl: string;
  title: string;
  description?: string;
  rules?: string[];
  platform?: "youtube" | "tiktok" | "instagram";
  budgetUsd: number;
  budgetPctRemaining: number;
  externalPayoutPer1k: number;
  approvalRatePct: number;
  niche?: string;
  requiredHashtags?: string[];
  sourceAssetUrls?: string[];
};

export type CampaignFilterResult = {
  allowed: boolean;
  reason?: string;
  geographicRestriction: "global" | "us_only" | "eu_only";
};

const blockedGeoTerms = [
  "us only",
  "usa only",
  "50% us",
  "american audience",
  "us viewers",
  "united states audience required",
];

const allowedGeoTerms = [
  "global",
  "worldwide",
  "any audience",
  "all countries",
];

export function classifyCampaignGeography(text: string): CampaignFilterResult {
  const normalized = text.toLowerCase();

  if (blockedGeoTerms.some((term) => normalized.includes(term))) {
    return {
      allowed: false,
      reason: "Campaign requires US audience and is not suitable for Indian workers.",
      geographicRestriction: "us_only",
    };
  }

  if (allowedGeoTerms.some((term) => normalized.includes(term))) {
    return { allowed: true, geographicRestriction: "global" };
  }

  return { allowed: true, geographicRestriction: "global" };
}

export function calculateWorkerPayout(sourcePayoutPer1k: number) {
  if (sourcePayoutPer1k >= 3) return Number((sourcePayoutPer1k * 0.4).toFixed(2));
  if (sourcePayoutPer1k >= 2) return Number((sourcePayoutPer1k * 0.35).toFixed(2));
  return Number((sourcePayoutPer1k * 0.3).toFixed(2));
}

export function validateImportedCampaign(input: ImportedCampaignInput): CampaignFilterResult {
  const combinedText = [input.title, input.description, ...(input.rules || [])]
    .filter(Boolean)
    .join(" ");

  const geo = classifyCampaignGeography(combinedText);

  if (!geo.allowed) return geo;

  if (input.budgetPctRemaining < 40) {
    return {
      allowed: false,
      reason: "Campaign budget is below 40% remaining and may run out before views verify.",
      geographicRestriction: geo.geographicRestriction,
    };
  }

  if (input.approvalRatePct < 80) {
    return {
      allowed: false,
      reason: "Creator approval rate is below 80% and is too risky for workers.",
      geographicRestriction: geo.geographicRestriction,
    };
  }

  return geo;
}

export function inferNiche(text: string) {
  const normalized = text.toLowerCase();

  if (["crypto", "web3", "trading", "defi", "bitcoin", "solana"].some((term) => normalized.includes(term))) return "crypto";
  if (["gaming", "bgmi", "freefire", "streamer", "twitch"].some((term) => normalized.includes(term))) return "gaming";
  if (["motivation", "entrepreneur", "business", "mindset"].some((term) => normalized.includes(term))) return "motivation";
  if (["music", "song", "artist", "spotify", "audio"].some((term) => normalized.includes(term))) return "music";
  if (["ai", "tech", "tool", "software", "saas"].some((term) => normalized.includes(term))) return "ai-tech";
  if (["finance", "investing", "money", "markets"].some((term) => normalized.includes(term))) return "finance";

  return "general";
}
