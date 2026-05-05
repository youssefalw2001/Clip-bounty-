import { NextRequest, NextResponse } from "next/server";
import { requireDb } from "@/db";
import { campaignSources, campaigns } from "@/db/schema";
import { calculateWorkerPayout, inferNiche, validateImportedCampaign, type ImportedCampaignInput } from "@/lib/campaignImport";

const fallbackFeed: ImportedCampaignInput[] = [
  {
    sourcePlatform: "reach_cat",
    externalCampaignId: "sample-reach-cat-fitness",
    externalUrl: "https://reach.cat/sample-fitness-campaign",
    title: "Reach.cat Global Fitness Clips",
    description: "Global Reach.cat style campaign. Clip fitness and mobility content for short-form platforms. USDT payout source.",
    rules: ["Global audience accepted", "No fake views", "Submit clip URLs quickly after posting", "USDT payout source"],
    platform: "tiktok",
    budgetUsd: 2000,
    budgetPctRemaining: 90,
    externalPayoutPer1k: 2,
    approvalRatePct: 100,
    niche: "fitness",
    requiredHashtags: ["#fitness", "#mobility"],
  },
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
];

function isAuthorized(request: NextRequest) {
  const secret = process.env.IMPORT_CRON_SECRET;
  if (!secret) return true;

  const headerSecret = request.headers.get("x-import-secret");
  const querySecret = request.nextUrl.searchParams.get("secret");
  return headerSecret === secret || querySecret === secret;
}

async function loadFeed(): Promise<ImportedCampaignInput[]> {
  const feedUrl = process.env.CAMPAIGN_FEED_URL;

  if (!feedUrl) return fallbackFeed;

  const res = await fetch(feedUrl, {
    headers: { accept: "application/json" },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`Campaign feed returned ${res.status}`);
  }

  const data = await res.json();
  if (Array.isArray(data)) return data as ImportedCampaignInput[];
  if (Array.isArray(data.campaigns)) return data.campaigns as ImportedCampaignInput[];

  throw new Error("Campaign feed must be an array or { campaigns: [...] }.");
}

async function importOne(item: ImportedCampaignInput) {
  const db = requireDb();
  const filter = validateImportedCampaign(item);

  if (!filter.allowed) {
    return { imported: false, title: item.title, reason: filter.reason || "Filtered out" };
  }

  const workerPayout = calculateWorkerPayout(item.externalPayoutPer1k, item.sourcePlatform);
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

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const feed = await loadFeed();
    const results = [];

    for (const item of feed) {
      try {
        results.push(await importOne(item));
      } catch (error) {
        const reason = error instanceof Error && error.message.toLowerCase().includes("duplicate")
          ? "Already imported"
          : error instanceof Error
            ? error.message
            : "Already imported or insert failed";
        results.push({ imported: false, title: item.title, reason });
      }
    }

    return NextResponse.json({ importedCount: results.filter((item) => item.imported).length, results });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Import failed" },
      { status: 400 },
    );
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    status: "ready",
    mode: process.env.CAMPAIGN_FEED_URL ? "external_feed" : "fallback_sample_feed",
    feedUrlConfigured: Boolean(process.env.CAMPAIGN_FEED_URL),
    supportedSources: ["reach_cat", "whop", "vyro", "mrktplce", "manual"],
    message: "POST this route from a scheduler to automatically import qualifying campaigns from CAMPAIGN_FEED_URL.",
  });
}
