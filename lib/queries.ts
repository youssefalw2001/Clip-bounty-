import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { campaigns as demoCampaigns, clips as demoClips } from "@/lib/data";
import { campaigns, clips, users } from "@/db/schema";
import type { Campaign, Clip } from "@/lib/data";

export async function getCampaignCards(): Promise<Campaign[]> {
  if (!db) return demoCampaigns;

  const rows = await db.query.campaigns.findMany({
    orderBy: [desc(campaigns.createdAt)],
  });

  if (rows.length === 0) return demoCampaigns;

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    buyer: "Beta buyer",
    platform: row.platform === "youtube" ? "YouTube" : row.platform === "tiktok" ? "TikTok" : "Instagram",
    payoutPerThousandViews: Number(row.workerCpmUsd),
    budget: Number(row.budgetUsd),
    remainingBudget: Number(row.remainingBudgetUsd),
    status: row.status === "draft" ? "paused" : row.status,
    description: row.description || "No description added yet.",
    rules: row.rules?.length ? row.rules : ["Follow buyer instructions.", "No fake views or misleading claims."],
  }));
}

export async function getClipRows(): Promise<Clip[]> {
  if (!db) return demoClips;

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
      worker: worker?.telegramUsername ? `@${worker.telegramUsername}` : "@unknown_worker",
      platform: row.platform,
      url: row.url,
      views: row.currentViews,
      estimatedEarnings: Number(row.estimatedEarningsUsd),
      status: row.status,
      submittedAt: row.submittedAt.toISOString().slice(0, 10),
    };
  });
}

export async function getCampaignById(id: string) {
  if (!db) return null;
  return db.query.campaigns.findFirst({ where: eq(campaigns.id, id) });
}
