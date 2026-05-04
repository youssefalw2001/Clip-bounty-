import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({
      exists: false,
      isProfileComplete: false,
      niches: [],
      message: "Missing userId",
    });
  }

  if (!db) {
    return NextResponse.json({
      exists: true,
      isProfileComplete: true,
      niches: [],
      message: "Demo mode: database is not configured.",
    });
  }

  const worker = await db.query.users.findFirst({
    where: eq(users.telegramUserId, userId),
  });

  if (!worker) {
    return NextResponse.json({
      exists: false,
      isProfileComplete: false,
      niches: [],
    });
  }

  return NextResponse.json({
    exists: true,
    isProfileComplete: worker.isProfileComplete,
    displayName: worker.displayName,
    tonWalletAddress: worker.tonWalletAddress,
    niches: worker.niches || [],
    country: worker.country,
  });
}
