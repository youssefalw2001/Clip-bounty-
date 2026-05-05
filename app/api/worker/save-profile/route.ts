import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { workerProfileSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: "Database is not connected. Add DATABASE_URL in your hosting environment." }, { status: 500 });
  }

  const body = await request.json().catch(() => null);

  if (!body?.userId) {
    return NextResponse.json({ error: "User identity missing. Refresh the page and try again." }, { status: 400 });
  }

  const parsed = workerProfileSchema.safeParse({
    displayName: body.displayName,
    tonWalletAddress: body.tonWalletAddress,
    country: body.country || "IN",
    tiktokHandle: body.tiktokHandle || undefined,
    tiktokFollowers: body.tiktokFollowers || 0,
    instagramHandle: body.instagramHandle || undefined,
    instagramFollowers: body.instagramFollowers || 0,
    youtubeHandle: body.youtubeHandle || undefined,
    youtubeSubscribers: body.youtubeSubscribers || 0,
    niches: body.niches || [],
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues.map((issue) => issue.message).join(", ") }, { status: 400 });
  }

  const hasSocialAccount = Boolean(
    parsed.data.tiktokHandle || parsed.data.instagramHandle || parsed.data.youtubeHandle,
  );

  if (!hasSocialAccount) {
    return NextResponse.json({ error: "Add at least one TikTok, Instagram, or YouTube Shorts handle." }, { status: 400 });
  }

  const values = {
    role: "worker" as const,
    displayName: parsed.data.displayName,
    country: parsed.data.country,
    countryCode: parsed.data.country,
    tonWalletAddress: parsed.data.tonWalletAddress,
    tiktokHandle: parsed.data.tiktokHandle || null,
    tiktokFollowers: parsed.data.tiktokFollowers,
    instagramHandle: parsed.data.instagramHandle || null,
    instagramFollowers: parsed.data.instagramFollowers,
    youtubeHandle: parsed.data.youtubeHandle || null,
    youtubeSubscribers: parsed.data.youtubeSubscribers,
    niches: parsed.data.niches,
    isProfileComplete: true,
    updatedAt: new Date(),
  };

  try {
    const existing = await db.query.users.findFirst({ where: eq(users.telegramUserId, String(body.userId)) });

    if (existing) {
      await db.update(users).set(values).where(eq(users.id, existing.id));
    } else {
      await db.insert(users).values({
        telegramUserId: String(body.userId),
        ...values,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Profile save failed.";

    if (message.includes("column") || message.includes("does not exist")) {
      return NextResponse.json({ error: "Your Supabase database is missing the new profile columns. Run the latest supabase-setup.sql in Supabase SQL Editor, then redeploy." }, { status: 500 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
