import { calculateWorkerPayout, inferNiche, validateImportedCampaign, type SourcePlatform } from "@/lib/campaignImport";

const MAX_HTML_CHARS = 250_000;
const FETCH_TIMEOUT_MS = 12_000;

function timeoutSignal(ms: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(timeout) };
}

function stripTags(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMeta(html: string, key: string) {
  const propertyPattern = new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i");
  const namePattern = new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i");
  return html.match(propertyPattern)?.[1] || html.match(namePattern)?.[1] || "";
}

function extractTitle(html: string) {
  return extractMeta(html, "og:title") || html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() || "Imported campaign";
}

function extractDescription(html: string) {
  return extractMeta(html, "og:description") || extractMeta(html, "description") || "";
}

function extractNumberNear(text: string, terms: string[]) {
  const lower = text.toLowerCase();
  for (const term of terms) {
    const index = lower.indexOf(term);
    if (index === -1) continue;
    const window = text.slice(Math.max(0, index - 80), index + 120);
    const percent = window.match(/(\d{1,3})\s*%/);
    if (percent) return Number(percent[1]);
    const money = window.match(/\$\s*(\d+(?:\.\d+)?)/);
    if (money) return Number(money[1]);
  }
  return null;
}

function inferSourcePlatform(url: string): SourcePlatform {
  const host = new URL(url).hostname.toLowerCase();
  if (host.includes("reach.cat") || host.includes("reachclipping")) return "reach_cat";
  if (host.includes("whop")) return "whop";
  if (host.includes("vyro")) return "vyro";
  if (host.includes("mrktplce")) return "mrktplce";
  return "manual";
}

function inferPlatform(text: string): "youtube" | "tiktok" | "instagram" {
  const lower = text.toLowerCase();
  if (lower.includes("tiktok")) return "tiktok";
  if (lower.includes("instagram") || lower.includes("reels")) return "instagram";
  return "youtube";
}

export async function scrapeCampaignDraft(url: string) {
  const parsedUrl = new URL(url);

  if (!/^https?:$/.test(parsedUrl.protocol)) {
    throw new Error("Only public http/https URLs are supported.");
  }

  const timeout = timeoutSignal(FETCH_TIMEOUT_MS);
  const res = await fetch(url, {
    signal: timeout.signal,
    headers: {
      "user-agent": "ClipBountyBot/0.1 (+manual admin import assistant)",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  }).finally(timeout.clear);

  if (!res.ok) {
    throw new Error(`Source returned ${res.status}. Use manual import instead.`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    throw new Error("Source did not return HTML. Use manual import instead.");
  }

  const html = (await res.text()).slice(0, MAX_HTML_CHARS);
  const title = extractTitle(html);
  const description = extractDescription(html);
  const text = stripTags(html).slice(0, 20_000);
  const combined = `${title} ${description} ${text}`;
  const sourcePlatform = inferSourcePlatform(url);

  const externalPayoutPer1k = extractNumberNear(combined, ["per 1k", "per 1,000", "cpm", "views"]) || (sourcePlatform === "reach_cat" ? 2 : 1);
  const budgetPctRemaining = extractNumberNear(combined, ["remaining", "budget left", "left"]) || 100;
  const approvalRatePct = sourcePlatform === "reach_cat" ? 100 : extractNumberNear(combined, ["approval", "approved", "approval rate"]) || 90;
  const workerPayout = calculateWorkerPayout(externalPayoutPer1k, sourcePlatform);
  const niche = inferNiche(combined);
  const platform = inferPlatform(combined);
  const filter = validateImportedCampaign({
    sourcePlatform,
    externalUrl: url,
    title,
    description,
    rules: [text.slice(0, 1200)],
    platform,
    budgetUsd: 1000,
    budgetPctRemaining,
    externalPayoutPer1k,
    approvalRatePct,
    niche,
  });

  return {
    sourcePlatform,
    externalUrl: url,
    title,
    description,
    platform,
    budgetUsd: 1000,
    budgetPctRemaining,
    externalPayoutPer1k,
    suggestedWorkerPayoutPer1k: workerPayout,
    approvalRatePct,
    niche,
    geographicRestriction: filter.geographicRestriction,
    passesFilters: filter.allowed,
    filterReason: filter.reason || null,
    extractedTextPreview: text.slice(0, 1200),
  };
}
