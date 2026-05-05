"use client";

import { useState } from "react";

export function AutoImportRunner() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function runImport() {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/import-campaigns?secret=clipbounty123secret", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Import failed");
      }

      setMessage(`Imported ${data.importedCount || 0} campaign(s). Open Worker Rewards to view them.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-6 rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-5 shadow-2xl shadow-black/25">
      <h2 className="text-2xl font-black text-white">Run auto-import now</h2>
      <p className="mt-2 text-sm leading-6 text-emerald-100">
        This sends a POST request to the importer. If no real CAMPAIGN_FEED_URL is configured, it imports the fallback sample campaign.
      </p>
      <button
        type="button"
        onClick={runImport}
        disabled={loading}
        className="mt-4 rounded-2xl bg-emerald-300 px-5 py-3 text-sm font-black text-black disabled:opacity-50"
      >
        {loading ? "Importing..." : "Run auto-import now"}
      </button>
      {message ? <p className="mt-3 text-sm font-semibold text-emerald-100">{message}</p> : null}
      {error ? <p className="mt-3 text-sm font-semibold text-red-200">{error}</p> : null}
    </div>
  );
}
