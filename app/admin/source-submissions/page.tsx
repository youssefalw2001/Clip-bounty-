import postgres from "postgres";
import { DashboardShell } from "@/components/DashboardShell";
import { SourceSubmissionActions } from "@/components/SourceSubmissionActions";

export const dynamic = "force-dynamic";

type SourceQueueItem = {
  clip_id: string;
  clip_url: string;
  clip_platform: string;
  clip_status: string;
  current_views: number;
  submitted_at: string;
  source_submission_status: string;
  source_submitted_at: string | null;
  source_reviewed_at: string | null;
  source_submission_notes: string | null;
  campaign_title: string;
  campaign_description: string | null;
  campaign_source_url: string | null;
  campaign_source_platform: string | null;
  worker_name: string | null;
  worker_telegram: string | null;
};

function sourceLabel(source?: string | null) {
  if (!source) return "Manual / unknown";
  if (source === "reach_cat") return "Reach.cat";
  if (source === "mrktplce") return "MRKTPLCE";
  return source;
}

function statusStyle(status: string) {
  if (status === "source_approved") return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
  if (status === "source_rejected") return "border-red-300/25 bg-red-300/10 text-red-100";
  if (status === "submitted_to_source") return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  return "border-white/10 bg-white/5 text-stone-200";
}

async function getSourceQueue() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing in Render environment variables.");
  }

  const sql = postgres(process.env.DATABASE_URL, { prepare: false });

  try {
    return await sql<SourceQueueItem[]>`
      select
        clips.id as clip_id,
        clips.url as clip_url,
        clips.platform::text as clip_platform,
        clips.status::text as clip_status,
        clips.current_views,
        clips.submitted_at::text as submitted_at,
        clips.source_submission_status,
        clips.source_submitted_at::text as source_submitted_at,
        clips.source_reviewed_at::text as source_reviewed_at,
        clips.source_submission_notes,
        campaigns.title as campaign_title,
        campaigns.description as campaign_description,
        campaigns.landing_url as campaign_source_url,
        campaign_sources.source_platform as campaign_source_platform,
        users.display_name as worker_name,
        users.telegram_user_id as worker_telegram
      from clips
      join campaigns on campaigns.id = clips.campaign_id
      left join campaign_sources on campaign_sources.id = campaigns.source_id
      left join users on users.id = clips.worker_id
      order by
        case clips.source_submission_status
          when 'needs_submission' then 1
          when 'submitted_to_source' then 2
          when 'source_rejected' then 3
          when 'source_approved' then 4
          else 5
        end,
        clips.submitted_at desc
      limit 100
    `;
  } finally {
    await sql.end({ timeout: 1 });
  }
}

export default async function SourceSubmissionsPage() {
  let items: SourceQueueItem[] = [];
  let error = "";

  try {
    items = await getSourceQueue();
  } catch (err) {
    error = err instanceof Error ? err.message : "Could not load source submission queue.";
  }

  const needsSubmission = items.filter((item) => item.source_submission_status === "needs_submission").length;
  const submitted = items.filter((item) => item.source_submission_status === "submitted_to_source").length;
  const approved = items.filter((item) => item.source_submission_status === "source_approved").length;

  return (
    <DashboardShell
      title="Source submission queue"
      subtitle="Copy worker clip links, open the Whop/Reach.cat campaign, submit manually, then mark the source status here."
    >
      {error ? (
        <div className="rounded-3xl border border-red-300/25 bg-red-300/10 p-5 text-red-100">
          <h2 className="text-2xl font-black text-white">Queue needs database repair</h2>
          <p className="mt-3 text-sm leading-6">{error}</p>
          <p className="mt-3 text-sm leading-6">
            Run the latest <span className="font-black">supabase-setup.sql</span> in Supabase SQL Editor, then redeploy if needed.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">Needs submission</p>
              <p className="mt-2 text-4xl font-black text-white">{needsSubmission}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">Submitted to source</p>
              <p className="mt-2 text-4xl font-black text-white">{submitted}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">Source approved</p>
              <p className="mt-2 text-4xl font-black text-white">{approved}</p>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5 text-amber-100">
            <h2 className="text-xl font-black text-white">Operator workflow</h2>
            <p className="mt-2 text-sm leading-6">
              1. Copy the worker clip URL. 2. Open the source campaign. 3. Submit the clip in Whop/Reach.cat. 4. Come back and mark it submitted. Later we can replace this manual step with Whop API automation.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {items.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 text-stone-300">
                No worker clip submissions yet. Submit a test clip from the worker flow first.
              </div>
            ) : null}

            {items.map((item) => {
              const worker = item.worker_name || item.worker_telegram || "Unknown worker";
              return (
                <article key={item.clip_id} className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/25">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-emerald-100">
                          {sourceLabel(item.campaign_source_platform)}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black uppercase tracking-widest text-stone-300">
                          {item.clip_platform}
                        </span>
                        <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-widest ${statusStyle(item.source_submission_status)}`}>
                          {item.source_submission_status.replaceAll("_", " ")}
                        </span>
                      </div>
                      <h2 className="mt-4 text-2xl font-black text-white">{item.campaign_title}</h2>
                      <p className="mt-2 text-sm leading-6 text-stone-300">Worker: {worker}</p>
                      <p className="mt-1 text-xs text-stone-500">Submitted: {new Date(item.submitted_at).toLocaleString()}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm">
                      <p className="text-xs uppercase tracking-widest text-stone-500">Views</p>
                      <p className="mt-1 text-2xl font-black text-white">{item.current_views.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">Worker clip URL</p>
                    <a href={item.clip_url} target="_blank" rel="noreferrer" className="mt-2 block break-all text-sm font-semibold text-emerald-200">
                      {item.clip_url}
                    </a>
                  </div>

                  <SourceSubmissionActions
                    clipId={item.clip_id}
                    clipUrl={item.clip_url}
                    sourceUrl={item.campaign_source_url}
                  />
                </article>
              );
            })}
          </div>
        </>
      )}
    </DashboardShell>
  );
}
