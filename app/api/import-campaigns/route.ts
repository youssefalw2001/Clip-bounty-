import { NextResponse } from "next/server";
import { requireDb } from "@/db";
import { campaignSources, campaigns } from "@/db/schema";
import { calculateWorkerPayout, inferNiche, validateImportedCampaign, type ImportedCampaignInput } from "@/lib/campaignImport";

const sampleFeed: ImportedCampaignInput[] = [
  {
    sourcePlatform: "whop",
    externalCampaignId: "sample-global-crypto",
    externalUrl: "https://example.com/source/sample-global-crypto",
    title: "Global Crypto Shorts Campaign",
    description: "Worldwide audience allowed. Clip educational Web3 content for short-form platforms.",
    rules: ["Global audience accepted", "No fake views", "Submit clip URLs within 60 minutes"],
    platform: "youtube",
    budgetUsd: 1200,
    budgetPctRemaining: 82,
    externalPayoutPer1k: 1,
    approvalRatePct: 91,
    niche: "crypto",
    requiredHashtags: ["#crypto", "#web3"],
  },
  {
    sourcePlatform: "vyro",
    externalCampaignId: "sample-gaming-global",
    externalUrl: "https://example.com/source/sample-gaming-global",
    title: "Global Gaming Clips Campaign",
    description: "All countries accepted. Clip gaming highlights for short-form platforms.",
    rules: ["Any audience allowed", "No reuploads without edits", "Submit within 60 minutes"],
    platform: "tiktok",
    budgetUsd: 800,
    budgetPctRemaining: 76,
    externalPayoutPer1k: 0.75,
    approvalRatePct: 88,
    niche: "gaming",
    requiredHashtags: ["#gaming", "#clips"],
  },
];

async function importOne(item: ImportedCampaignInput) {
  const db = requireDb();
  const filter = validateImportedCampaign(item);

  if (!filter.allowed) {
    return { imported: false, title: item.title, reason: filter.reason || "Filtered out" };
  }

  const workerPayout = calculateWorkerPayout(item.externalPayoutPer1k);
  const remainingBudget = (item.budgetUsd * item.budgetPctRemaining) / 100;
  const niche = item.niche || inferNiche(`${item.title} ${item.description || ""} ${(item.rules || []).join(" ")}`);

  const [source] = await db.insert(campaignSources).values({
    sourcePlatform: item.sourcePlatform,
    externalCampaignId: item.externalCampaignId,
    externalUrl: item.externalUrl,
    rawData: item,
  }).returning();

  await db.insert(campaigns).values({
    sourceId: source.id,
    title: item.title,
    description: item.description,
    platform: item.platform || "youtube",
    status: "active",
    budgetUsd: item.budgetUsd.toFixed(2),
    remainingBudgetUsd: remainingBudget.toFixed(2),
    buyerCpmUsd: item.externalPayoutPer1k.toFixed(4),
    workerCpmUsd: workerPayout.toFixed(4),
    isImported: true,
    externalPayoutPer1k: item.externalPayoutPer1k,
    ourPayoutPer1k: workerPayout,
    geographicRestriction: filter.geographicRestriction,
    approvalRatePct: item.approvalRatePct,
    budgetPctRemaining: item.budgetPctRemaining,
    niche,
    requiredHashtags: item.requiredHashtags || [],
    rules: item.rules || [],
    sourceAssetUrls: item.sourceAssetUrls || [],
    landingUrl: item.externalUrl,
  });

  return { imported: true, title: item.title, sourcePlatform: item.sourcePlatform };
}

export async function POST() {
  const results = [];

  for (const item of sampleFeed) {
    try {
      results.push(await importOne(item));
    } catch {
      results.push({ imported: false, title: item.title, reason: "Already imported or insert failed" });
    }
  }

  return NextResponse.json({ results });
}

export async function GET() {
  return NextResponse.json({
    status: "ready",
    message: "POST this route from a cron job to import qualifying campaigns. Replace sampleFeed with approved source data when source access is confirmed.",
  });
}
