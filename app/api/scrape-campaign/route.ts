import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "This route has been retired. GhostWallet uses /api/ghost/scan." }, { status: 410 });
}

export async function GET() {
  return NextResponse.json({ error: "This route has been retired. GhostWallet uses /api/ghost/scan." }, { status: 410 });
}
