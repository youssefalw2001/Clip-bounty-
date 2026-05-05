import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";
import { requireDb } from "@/db";
import { campaignSources, campaigns } from "@/db/schema";
import { calculateWorkerPayout, inferNiche, validateImportedCampaign, type ImportedCampaignInput, type SourcePlatform } from "@/lib/campaignImport";

type SeedCampaign = {
  title: string;
  sourcePlatform?: SourcePlatform;
  cpm: number;
  budgetUsd: number;
  budgetRemainingPct: number;
  niche: string;
  platform?: "youtube" | "tiktok" | "instagram";
  description: string;
  sourcePath?: string;
  hashtags?: string[];
};

const WHOP_DISCOVER_URL = "https://whop.com/discover/content-rewards/c/clipping/p/-112";

const baseRules = [
  "Operator candidate imported from public campaign listing data. Verify the source page before sending real workers.",
  "Global / non-US-only campaigns should be prioritized for ClipBounty workers.",
  "Worker must post a public TikTok, Reel, or YouTube Short.",
  "No fake views, bots, paid traffic, reused uploads, or duplicate spam.",
  "Submit the clip URL to ClipBounty quickly after posting so the operator can submit it to the source platform.",
];

function seed(input: SeedCampaign): ImportedCampaignInput {
  const sourcePlatform = input.sourcePlatform || "whop";
  return {
    sourcePlatform,
    externalCampaignId: `seed-${sourcePlatform}-${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
    externalUrl: `${input.sourcePath || WHOP_DISCOVER_URL}#${encodeURIComponent(input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}`,
    title: input.title,
    description: input.description,
    rules: baseRules,
    platform: input.platform || "tiktok",
    budgetUsd: input.budgetUsd,
    budgetPctRemaining: input.budgetRemainingPct,
    externalPayoutPer1k: input.cpm,
    approvalRatePct: sourcePlatform === "reach_cat" ? 100 : 90,
    niche: input.niche,
    requiredHashtags: input.hashtags || [`#${input.niche.replace(/[^a-z0-9]/gi, "")}`, "#clipbounty"],
  };
}

const fallbackFeed: ImportedCampaignInput[] = [
  seed({ title: "Reach.cat Global Fitness Clips", sourcePlatform: "reach_cat", cpm: 2, budgetUsd: 2000, budgetRemainingPct: 90, niche: "fitness", description: "Global Reach.cat style campaign. Clip fitness and mobility content for short-form platforms. USDT payout source.", hashtags: ["#fitness", "#mobility"] }),
  seed({ title: "Reach.cat AI Tools Shorts", sourcePlatform: "reach_cat", cpm: 2.5, budgetUsd: 2500, budgetRemainingPct: 88, niche: "ai-tech", description: "Global Reach.cat style AI tools campaign for short-form clips. Good fit for tech and productivity audiences.", hashtags: ["#aitools", "#productivity"] }),
  seed({ title: "Global Crypto Shorts Campaign", sourcePlatform: "whop", cpm: 1, budgetUsd: 1200, budgetRemainingPct: 82, niche: "crypto", platform: "youtube", description: "Worldwide audience allowed. Clip educational Web3 content for short-form platforms.", hashtags: ["#crypto", "#web3"] }),
  seed({ title: "Paid To Dance - Jason Derulo Trend", cpm: 1, budgetUsd: 50109, budgetRemainingPct: 95, niche: "music", description: "Music and dance trend campaign based on public Whop Content Rewards listing data. Strong fit for TikTok/Reels workers." }),
  seed({ title: "Low Back Ability Clips", cpm: 3, budgetUsd: 10145, budgetRemainingPct: 100, niche: "fitness", description: "Fitness / mobility clipping campaign. Public listing showed $3 per 1K views and fresh budget availability." }),
  seed({ title: "Liam Clips", cpm: 2, budgetUsd: 10021, budgetRemainingPct: 100, niche: "motivation", description: "Creator clipping campaign. Good candidate for motivational short-form edits and talking-head clips." }),
  seed({ title: "Steven Harvalias Clipping", cpm: 1, budgetUsd: 10021, budgetRemainingPct: 100, niche: "motivation", description: "Creator clipping campaign with simple talking-head clip potential. Verify rules before worker distribution." }),
  seed({ title: "Sebastian Clips", cpm: 2, budgetUsd: 10000, budgetRemainingPct: 96, niche: "motivation", description: "Creator clipping campaign. Good fit for personal brand / motivation style clips." }),
  seed({ title: "Cameron Fous Clips", cpm: 1.25, budgetUsd: 10021, budgetRemainingPct: 91, niche: "finance", description: "Trading / finance creator clipping campaign. Good fit for Indian finance and trading audiences if global rules are allowed." }),
  seed({ title: "Charlie Johnson Clips", cpm: 2, budgetUsd: 9867, budgetRemainingPct: 93, niche: "fitness", description: "Fitness creator clipping campaign. Good for transformation, coaching, and health clips." }),
  seed({ title: "App Mafia Clips", cpm: 3, budgetUsd: 10000, budgetRemainingPct: 84, niche: "ai-tech", description: "App/software style clipping campaign. Strong CPM candidate for tech/productivity workers." }),
  seed({ title: "NatPat Clipping", cpm: 2, budgetUsd: 10021, budgetRemainingPct: 93, niche: "motivation", description: "Repost and clipping campaign. Good mid-CPM candidate; verify content rights and rules first." }),
  seed({ title: "Somesh Clips", cpm: 2, budgetUsd: 9867, budgetRemainingPct: 86, niche: "motivation", description: "Creator clipping campaign. Public listing showed active views and meaningful budget remaining." }),
  seed({ title: "Shawn Meaike Clipping", cpm: 1, budgetUsd: 9756, budgetRemainingPct: 65, niche: "business", description: "Business / entrepreneurship creator clipping campaign. Good fit for motivation and personal-brand workers." }),
  seed({ title: "Clipping for DracoSlides", cpm: 2, budgetUsd: 5073, budgetRemainingPct: 99, niche: "ai-tech", description: "Slides / presentation style clipping candidate. Could work for AI, tech, education, or productivity angles." }),
  seed({ title: "Clip Farm - E-Money", cpm: 2, budgetUsd: 20000, budgetRemainingPct: 74, niche: "music", description: "Clip Farm style public campaign candidate. Good for entertainment and music/trend-based workers." }),
  seed({ title: "Isaac Clips", cpm: 1.5, budgetUsd: 10021, budgetRemainingPct: 100, niche: "motivation", description: "Creator clipping campaign candidate with fresh budget. Verify campaign rules before sending workers." }),
  seed({ title: "Luis Clips", cpm: 5, budgetUsd: 10021, budgetRemainingPct: 100, niche: "motivation", description: "High-CPM creator clipping candidate. Prioritize after verifying rules, allowed countries, and source materials." }),
  seed({ title: "Kelly Clips", cpm: 2, budgetUsd: 10021, budgetRemainingPct: 99, niche: "motivation", description: "Creator clipping campaign candidate with high budget remaining." }),
  seed({ title: "Brez Clips 2.0", cpm: 1, budgetUsd: 10000, budgetRemainingPct: 100, niche: "ecommerce", description: "Brand / ecommerce style clipping candidate. Suitable for simple repurposed product or lifestyle clips if rules allow." }),
  seed({ title: "BBNO$ Edit Campaign", cpm: 1.5, budgetUsd: 10001, budgetRemainingPct: 100, niche: "music", description: "Music edit campaign candidate. Good for meme, lyric, and trend-style short-form edits." }),
  seed({ title: "Elite Access Clips", cpm: 2, budgetUsd: 10021, budgetRemainingPct: 94, niche: "business", description: "Creator / personal-brand clipping campaign candidate. Good for business and mindset workers." }),
  seed({ title: "Jimmy Farley Clipping", cpm: 1.5, budgetUsd: 8000, budgetRemainingPct: 99, niche: "business", description: "Public Whop clipping candidate with low paid-out percentage. Verify source rules before distribution." }),
  seed({ title: "Trader Mayne Clips", cpm: 1, budgetUsd: 22476, budgetRemainingPct: 30, niche: "crypto", description: "Trading/crypto clipping candidate. Budget is lower than ideal, so keep hidden or low priority for real workers until verified." }),
  seed({ title: "Matt Haycox Clips", cpm: 3, budgetUsd: 8017, budgetRemainingPct: 99, niche: "business", description: "Business entrepreneur clipping candidate with strong CPM and fresh budget availability in public listing." }),
  seed({ title: "CreatorXchange MemeHouse Clips", cpm: 4, budgetUsd: 7516, budgetRemainingPct: 100, niche: "music", description: "Entertainment/music clipping candidate with strong CPM. Verify allowed platforms and content assets first." }),
  seed({ title: "Jason Derulo Fan Page Submissions", cpm: 0.5, budgetUsd: 7980, budgetRemainingPct: 63, niche: "music", description: "Music fan-page submission candidate. Lower CPM but simple content angle for beginner workers." }),
  seed({ title: "Grizzy Clips", cpm: 0.3, budgetUsd: 10145, budgetRemainingPct: 51, niche: "gaming", description: "Gaming/streamer clipping candidate. Lower CPM, but easy category for beginner editors and gaming audiences." }),
  seed({ title: "Julian Petroulas Clipping Team", cpm: 1, budgetUsd: 10047, budgetRemainingPct: 50, niche: "business", description: "Business creator campaign candidate. Budget is mid-level; use after verifying current status." }),
  seed({ title: "Timothy Sykes Clipping", cpm: 2, budgetUsd: 29926, budgetRemainingPct: 35, niche: "finance", description: "Finance/trading creator campaign candidate. Budget percentage is lower than ideal; verify before assigning workers." }),
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

  if (!res.ok) throw new Error(`Campaign feed returned ${res.status}`);

  const data = await res.json();
  if (Array.isArray(data)) return data as ImportedCampaignInput[];
  if (Array.isArray(data.campaigns)) return data.campaigns as ImportedCampaignInput[];

  throw new Error("Campaign feed must be an array or { campaigns: [...] }.");
}

function buildFullCampaignValues(item: ImportedCampaignInput, sourceId: string | null) {
  const filter = validateImportedCampaign(item);
  const workerPayout = calculateWorkerPayout(item.externalPayoutPer1k, item.sourcePlatform);
  const remainingBudget = (item.budgetUsd * item.budgetPctRemaining) / 100;
  const niche = item.niche || inferNiche(`${item.title} ${item.description || ""} ${(item.rules || []).join(" ")}`);

  return {
    sourceId,
    title: item.title,
    description: item.description,
    platform: item.platform || "youtube",
    status: "active" as const,
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
  };
}

async function rawBasicCampaignInsert(item: ImportedCampaignInput) {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required in Render environment variables.");

  const sql = postgres(process.env.DATABASE_URL, { prepare: false });
  const workerPayout = calculateWorkerPayout(item.externalPayoutPer1k, item.sourcePlatform);
  const remainingBudget = (item.budgetUsd * item.budgetPctRemaining) / 100;
  const description = `${item.description || ""}\n\nSource: ${item.sourcePlatform}\nSource URL: ${item.externalUrl}\nNiche: ${item.niche || "general"}\nBudget remaining: ${item.budgetPctRemaining}%\nApproval rate: ${item.approvalRatePct}%\nRules:\n${(item.rules || []).join("\n")}`;

  try {
    await sql`
      insert into campaigns (title, description, platform, status, budget_usd, remaining_budget_usd, buyer_cpm_usd, worker_cpm_usd)
      values (${item.title}, ${description}, ${item.platform || "youtube"}, 'active', ${item.budgetUsd.toFixed(2)}, ${remainingBudget.toFixed(2)}, ${item.externalPayoutPer1k.toFixed(4)}, ${workerPayout.toFixed(4)})
    `;
  } finally {
    await sql.end({ timeout: 1 });
  }
}

async function campaignExists(title: string) {
  if (!process.env.DATABASE_URL) return false;
  const sql = postgres(process.env.DATABASE_URL, { prepare: false });
  try {
    const rows = await sql`select id from campaigns where title = ${title} limit 1`;
    return rows.length > 0;
  } finally {
    await sql.end({ timeout: 1 });
  }
}

async function importOne(item: ImportedCampaignInput) {
  const db = requireDb();
  const filter = validateImportedCampaign(item);

  if (await campaignExists(item.title)) {
    return { imported: false, title: item.title, reason: "Already imported" };
  }

  if (!filter.allowed) return { imported: false, title: item.title, reason: filter.reason || "Filtered out" };

  let sourceId: string | null = null;
  let sourceWarning = "";

  try {
    const [source] = await db.insert(campaignSources).values({
      sourcePlatform: item.sourcePlatform,
      externalCampaignId: item.externalCampaignId,
      externalUrl: item.externalUrl,
      rawData: item,
    }).returning();
    sourceId = source.id;
  } catch (error) {
    sourceWarning = error instanceof Error ? `Source record skipped: ${error.message}` : "Source record skipped.";
  }

  try {
    await db.insert(campaigns).values(buildFullCampaignValues(item, sourceId));
    return { imported: true, title: item.title, sourcePlatform: item.sourcePlatform, reason: sourceWarning || "Imported successfully" };
  } catch (error) {
    const fullError = error instanceof Error ? error.message : "Full import failed.";
    await rawBasicCampaignInsert(item);
    return { imported: true, title: item.title, sourcePlatform: item.sourcePlatform, reason: `Imported with emergency basic SQL. ${sourceWarning} Full import skipped: ${fullError}` };
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    return NextResponse.json({ error: error instanceof Error ? error.message : "Import failed" }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    status: "ready",
    mode: process.env.CAMPAIGN_FEED_URL ? "external_feed" : "operator_seed_feed",
    feedUrlConfigured: Boolean(process.env.CAMPAIGN_FEED_URL),
    seedCampaigns: fallbackFeed.length,
    supportedSources: ["reach_cat", "whop", "vyro", "mrktplce", "manual"],
    message: "POST this route to import the current operator seed feed or configured CAMPAIGN_FEED_URL.",
  });
}
