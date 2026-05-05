"use client";

import { useState } from "react";

type ImportResult = {
  imported?: boolean;
  title?: string;
  sourcePlatform?: string;
  reason?: string;
};

export function AutoImportRunner() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [results, setResults] = useState<ImportResult[]>([]);

  async function runImport() {
    setLoading(true);
    setMessage("");
    setError("");
    setResults([]);

    try {
      const res = await fetch("/api/import-campaigns?secret=clipbounty123secret", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Import failed");
      }

      setResults(data.results || []);
      const importedCount = data.importedCount || 0;
      setMessage(
        importedCount > 0
          ? `Imported ${importedCount} campaign(s). Open Worker Rewards to view them.`
          : "Imported 0 new campaigns. Check the details below — it may already exist, fail filters, or need the latest Supabase SQL.",
      );
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
      {results.length ? (
        <div className="mt-4 space-y-2">
          {results.map((result, index) => (
            <div key={`${result.title || "result"}-${index}`} className="rounded-2xl border border-white/10 bg-black/30 p-3 text-sm text-stone-200">
              <p className="font-bold">{result.imported ? "Imported" : "Not imported"}: {result.title || "Untitled campaign"}</p>
              <p className="mt-1 text-stone-400">{result.reason || result.sourcePlatform || "No reason returned"}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
