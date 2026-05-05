import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";

const allowedStatuses = new Set([
  "needs_submission",
  "submitted_to_source",
  "source_approved",
  "source_rejected",
]);

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL is missing." }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const clipId = body?.clipId;
  const status = body?.status;
  const notes = body?.notes || null;
  const externalSubmissionId = body?.externalSubmissionId || null;

  if (!clipId || !status || !allowedStatuses.has(status)) {
    return NextResponse.json({ error: "Invalid clipId or status." }, { status: 400 });
  }

  const sql = postgres(process.env.DATABASE_URL, { prepare: false });

  try {
    await sql`
      update clips
      set
        source_submission_status = ${status},
        source_submission_notes = coalesce(${notes}, source_submission_notes),
        source_external_submission_id = coalesce(${externalSubmissionId}, source_external_submission_id),
        source_submitted_at = case
          when ${status} = 'submitted_to_source' then now()
          else source_submitted_at
        end,
        source_reviewed_at = case
          when ${status} in ('source_approved', 'source_rejected') then now()
          else source_reviewed_at
        end
      where id = ${clipId}
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update source submission." },
      { status: 500 },
    );
  } finally {
    await sql.end({ timeout: 1 });
  }
}
