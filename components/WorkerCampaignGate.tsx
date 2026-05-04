"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CampaignCard } from "@/components/CampaignCard";
import { getUserId } from "@/lib/identity";
import type { Campaign } from "@/lib/data";

type ProfileStatus = {
  exists: boolean;
  isProfileComplete: boolean;
  niches: string[];
};

export function WorkerCampaignGate({ campaigns }: { campaigns: Campaign[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<ProfileStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getUserId();

    fetch(`/api/worker/profile-status?userId=${encodeURIComponent(userId)}`)
      .then((res) => res.json())
      .then((data) => {
        setStatus(data);
        if (!data.isProfileComplete) {
          router.replace("/worker/profile");
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  const filteredCampaigns = useMemo(() => {
    if (!status?.niches?.length) return campaigns;

    return campaigns.filter((campaign) => {
      if (!campaign.niche || campaign.niche === "general") return true;
      return status.niches.includes(campaign.niche);
    });
  }, [campaigns, status]);

  if (loading || !status) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 text-slate-300">
        Checking your clipper profile...
      </div>
    );
  }

  if (!status.isProfileComplete) {
    return (
      <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-6 text-amber-100">
        Complete your profile to start claiming campaigns. Redirecting you now...
      </div>
    );
  }

  if (filteredCampaigns.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 text-slate-300">
        No campaigns match your selected niches yet. Add more niches in your profile or check back soon.
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {filteredCampaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}
