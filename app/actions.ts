"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { requireDb } from "@/db";
import { campaigns, clips, users } from "@/db/schema";
import { extractYouTubeVideoId } from "@/lib/tracking";
import { createCampaignSchema, csvToArray, linesToArray, submitClipSchema } from "@/lib/validation";

async function getOrCreateDemoBuyer() {
  const db = requireDb();
  const telegramUserId = "demo_buyer";
  const existing = await db.query.users.findFirst({
    where: eq(users.telegramUserId, telegramUserId),
  });

  if (existing) return existing;

  const [created] = await db
    .insert(users)
    .values({
      telegramUserId,
      telegramUsername: "demo_buyer",
      role: "buyer",
    })
    .returning();

  return created;
}

async function getOrCreateDemoWorker(walletAddress: string) {
  const db = requireDb();
  const telegramUserId = "demo_worker";
  const existing = await db.query.users.findFirst({
    where: eq(users.telegramUserId, telegramUserId),
  });

  if (existing) {
    await db.update(users).set({ tonWalletAddress: walletAddress }).where(eq(users.id, existing.id));
    return existing;
  }

  const [created] = await db
    .insert(users)
    .values({
      telegramUserId,
      telegramUsername: "demo_worker",
      role: "worker",
      tonWalletAddress: walletAddress,
    })
    .returning();

  return created;
}

export async function createCampaignAction(formData: FormData) {
  const db = requireDb();
  const parsed = createCampaignSchema.safeParse({
    title: formData.get("title"),
    platform: formData.get("platform"),
    budgetUsd: formData.get("budgetUsd"),
    buyerCpmUsd: formData.get("buyerCpmUsd"),
    workerCpmUsd: formData.get("workerCpmUsd"),
    description: formData.get("description") || undefined,
    rules: formData.get("rules") || undefined,
    requiredHashtags: formData.get("requiredHashtags") || undefined,
    landingUrl: formData.get("landingUrl") || "",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((issue) => issue.message).join(", "));
  }

  if (parsed.data.workerCpmUsd >= parsed.data.buyerCpmUsd) {
    throw new Error("Worker CPM must be lower than buyer CPM so the platform keeps a spread.");
  }

  const buyer = await getOrCreateDemoBuyer();
  const budget = parsed.data.budgetUsd.toFixed(2);

  await db.insert(campaigns).values({
    buyerId: buyer.id,
    title: parsed.data.title,
    description: parsed.data.description,
    platform: parsed.data.platform,
    status: "active",
    budgetUsd: budget,
    remainingBudgetUsd: budget,
    buyerCpmUsd: parsed.data.buyerCpmUsd.toFixed(4),
    workerCpmUsd: parsed.data.workerCpmUsd.toFixed(4),
    requiredHashtags: csvToArray(parsed.data.requiredHashtags),
    rules: linesToArray(parsed.data.rules),
    landingUrl: parsed.data.landingUrl || null,
  });

  revalidatePath("/buyer/campaigns");
  revalidatePath("/worker/campaigns");
  redirect("/buyer/campaigns");
}

export async function submitClipAction(formData: FormData) {
  const db = requireDb();
  const parsed = submitClipSchema.safeParse({
    campaignId: formData.get("campaignId"),
    platform: formData.get("platform"),
    url: formData.get("url"),
    walletAddress: formData.get("walletAddress"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((issue) => issue.message).join(", "));
  }

  const worker = await getOrCreateDemoWorker(parsed.data.walletAddress);
  const videoId = parsed.data.platform === "youtube" ? extractYouTubeVideoId(parsed.data.url) : null;

  await db.insert(clips).values({
    campaignId: parsed.data.campaignId,
    workerId: worker.id,
    platform: parsed.data.platform,
    url: parsed.data.url,
    platformVideoId: videoId,
    status: "submitted",
  });

  revalidatePath("/admin/clips");
  revalidatePath("/worker/earnings");
  redirect("/worker/earnings");
}

export async function approveClipAction(formData: FormData) {
  const db = requireDb();
  const clipId = String(formData.get("clipId") || "");
  if (!clipId) throw new Error("Clip ID is required");

  await db
    .update(clips)
    .set({
      status: "approved",
      reviewedAt: new Date(),
    })
    .where(eq(clips.id, clipId));

  revalidatePath("/admin/clips");
  revalidatePath("/admin/payouts");
}

export async function rejectClipAction(formData: FormData) {
  const db = requireDb();
  const clipId = String(formData.get("clipId") || "");
  if (!clipId) throw new Error("Clip ID is required");

  await db
    .update(clips)
    .set({
      status: "rejected",
      reviewedAt: new Date(),
    })
    .where(eq(clips.id, clipId));

  revalidatePath("/admin/clips");
  revalidatePath("/admin/payouts");
}

export async function markClipPaidAction(formData: FormData) {
  const db = requireDb();
  const clipId = String(formData.get("clipId") || "");
  if (!clipId) throw new Error("Clip ID is required");

  await db
    .update(clips)
    .set({
      status: "paid",
    })
    .where(eq(clips.id, clipId));

  revalidatePath("/admin/payouts");
  revalidatePath("/admin/clips");
  revalidatePath("/worker/earnings");
}
