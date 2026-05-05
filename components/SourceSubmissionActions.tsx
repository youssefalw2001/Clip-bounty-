"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SourceSubmissionActions({
  clipId,
  clipUrl,
  sourceUrl,
}: {
  clipId: string;
  clipUrl: string;
  sourceUrl?: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function copyClip() {
    await navigator.clipboard.writeText(clipUrl);
    setMessage("Clip URL copied.");
  }

  async function updateStatus(status: string) {
    setLoading(status);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/admin/source-submissions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ clipId, status }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Could not update status");

      setMessage("Updated.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update status");
    } finally {
      setLoading("");
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <button type="button" onClick={copyClip} className="rounded-2xl bg-emerald-300 px-4 py-3 text-sm font-black text-black">
          Copy clip URL
        </button>
        {sourceUrl ? (
          <a href={sourceUrl} target="_blank" rel="noreferrer" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-bold text-stone-200">
            Open source
          </a>
        ) : (
          <span className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-bold text-stone-500">
            No source URL
          </span>
        )}
        <button type="button" disabled={Boolean(loading)} onClick={() => updateStatus("submitted_to_source")} className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm font-bold text-amber-100 disabled:opacity-50">
          {loading === "submitted_to_source" ? "Updating..." : "Mark submitted"}
        </button>
        <button type="button" disabled={Boolean(loading)} onClick={() => updateStatus("source_approved")} className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm font-bold text-emerald-100 disabled:opacity-50">
          {loading === "source_approved" ? "Updating..." : "Mark approved"}
        </button>
      </div>
      <button type="button" disabled={Boolean(loading)} onClick={() => updateStatus("source_rejected")} className="rounded-2xl border border-red-300/20 bg-red-300/10 px-4 py-3 text-sm font-bold text-red-100 disabled:opacity-50">
        {loading === "source_rejected" ? "Updating..." : "Mark rejected by source"}
      </button>
      {message ? <p className="text-sm font-semibold text-emerald-100">{message}</p> : null}
      {error ? <p className="text-sm font-semibold text-red-100">{error}</p> : null}
    </div>
  );
}
