import { NextRequest, NextResponse } from "next/server";
import { scrapeCampaignDraft } from "@/lib/sourceScraper";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const url = body?.url;

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  try {
    const draft = await scrapeCampaignDraft(url);
    return NextResponse.json({ draft });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to scrape campaign" },
      { status: 400 },
    );
  }
}
