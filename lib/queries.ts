import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { campaigns as demoCampaigns, clips as demoClips } from "@/lib/data";
import { campaignSources, campaigns, clips, users } from "@/db/schema";
import type { Campaign, Clip } from "@/lib/data";

function platformLabel(platform: string): "YouTube" | "TikTok" | "Instagram" {
  return platform === "youtube" ? "YouTube" : platform === "tiktok" ? "TikTok" : "Instagram";
}

export async function getCampaignCards(): Promise<Campaign[]> {
  if (!db) return demoCampaigns;

  try {
    const rows = await db.query.campaigns.findMany({
      orderBy: [desc(campaigns.createdAt)],
      with: {
        source: true,
      },
    });

    if (rows.length === 0) return demoCampaigns;

    return rows
      .filter((row) => row.status === "active")
      .filter((row) => row.geographicRestriction !== "us_only")
      .filter((row) => (row.budgetPctRemaining ?? 100) >= 40)
      .filter((row) => (row.approvalRatePct ?? 100) >= 80)
      .map((row) => ({
        id: row.id,
        title: row.title,
        buyer: row.isImported ? row.source?.sourcePlatform?.toUpperCase() || "Imported" : "Manual buyer",
        platform: platformLabel(row.platform),
        payoutPerThousandViews: Number(row.workerCpmUsd),
        budget: Number(row.budgetUsd),
        remainingBudget: Number(row.remainingBudgetUsd),
        status: row.status === "draft" ? "paused" : row.status,
        description: row.description || "No description added yet.",
        rules: row.rules?.length ? row.rules : ["Follow buyer instructions.", "No fake views or misleading claims."],
        isImported: row.isImported,
        sourcePlatform: row.source?.sourcePlatform || (row.isImported ? "imported" : "manual"),
        externalPayoutPer1k: row.externalPayoutPer1k ?? undefined,
        ourPayoutPer1k: row.ourPayoutPer1k ?? undefined,
        geographicRestriction: row.geographicRestriction,
        approvalRatePct: row.approvalRatePct ?? undefined,
        budgetPctRemaining: row.budgetPctRemaining ?? undefined,
        niche: row.niche || "general",
      }));
  } catch {
    return demoCampaigns;
  }
}

export async function getClipRows(): Promise<Clip[]> {
  if (!db) return demoClips;

  try {
    const rows = await db.query.clips.findMany({
      orderBy: [desc(clips.submittedAt)],
    });

    if (rows.length === 0) return demoClips;

    const workerIds = rows.map((row) => row.workerId).filter(Boolean) as string[];
    const workerRows = workerIds.length
      ? await db.query.users.findMany({ where: inArray(users.id, workerIds) })
      : [];

    const workerById = new Map(workerRows.map((worker) => [worker.id, worker]));

    return rows.map((row) => {
      const worker = row.workerId ? workerById.get(row.workerId) : null;

      return {
        id: row.id,
        campaignId: row.campaignId,
        worker: worker?.telegramUsername ? `@${worker.telegramUsername}` : "beta_worker",
        platform: row.platform,
        url: row.url,
        views: row.currentViews,
        estimatedEarnings: Number(row.estimatedEarningsUsd),
        status: row.status,
        submittedAt: row.submittedAt.toISOString().slice(0, 10),
      };
    });
  } catch {
    return demoClips;
  }
}

export async function getCampaignById(id: string) {
  if (!db) return null;

  try {
    return await db.query.campaigns.findFirst({ where: eq(campaigns.id, id) });
  } catch {
    return null;
  }
}
