export type Campaign = {
  id: string;
  title: string;
  buyer: string;
  platform: "YouTube" | "TikTok" | "Instagram";
  payoutPerThousandViews: number;
  budget: number;
  remainingBudget: number;
  status: "active" | "paused" | "completed";
  description: string;
  rules: string[];
  isImported?: boolean;
  sourcePlatform?: string;
  externalPayoutPer1k?: number;
  ourPayoutPer1k?: number;
  geographicRestriction?: string;
  approvalRatePct?: number;
  budgetPctRemaining?: number;
  niche?: string;
};

export type Clip = {
  id: string;
  campaignId: string;
  worker: string;
  platform: string;
  url: string;
  views: number;
  estimatedEarnings: number;
  status: "submitted" | "approved" | "rejected" | "payable" | "paid";
  submittedAt: string;
};

export const campaigns: Campaign[] = [
  {
    id: "camp_001",
    title: "Podcast Shorts Growth Test",
    buyer: "Beta Podcast Buyer",
    platform: "YouTube",
    payoutPerThousandViews: 0.25,
    budget: 50,
    remainingBudget: 38.5,
    status: "active",
    description: "Clip the best moments from a long-form podcast and post as YouTube Shorts.",
    rules: [
      "Use the provided podcast source only.",
      "Add a hook in the first 2 seconds.",
      "Include #clipbounty and the campaign code in the caption.",
      "No fake views, repost farms, or misleading claims.",
    ],
    isImported: false,
    sourcePlatform: "manual",
    budgetPctRemaining: 77,
    approvalRatePct: 95,
    geographicRestriction: "global",
    niche: "podcast",
  },
  {
    id: "camp_002",
    title: "Streamer Highlight Clips",
    buyer: "Gaming Streamer",
    platform: "TikTok",
    payoutPerThousandViews: 0.2,
    budget: 75,
    remainingBudget: 75,
    status: "active",
    description: "Post funny or impressive stream moments as TikTok clips.",
    rules: [
      "Clip must be edited, not raw upload.",
      "Mention the streamer handle in caption.",
      "Minimum 8 seconds, maximum 45 seconds.",
      "Payout is manually reviewed during beta.",
    ],
    isImported: true,
    sourcePlatform: "whop",
    externalPayoutPer1k: 0.75,
    ourPayoutPer1k: 0.2,
    budgetPctRemaining: 100,
    approvalRatePct: 91,
    geographicRestriction: "global",
    niche: "gaming",
  },
];

export const clips: Clip[] = [
  {
    id: "clip_001",
    campaignId: "camp_001",
    worker: "beta_worker",
    platform: "YouTube",
    url: "https://youtube.com/shorts/demo",
    views: 4200,
    estimatedEarnings: 1.05,
    status: "approved",
    submittedAt: "2026-05-04",
  },
  {
    id: "clip_002",
    campaignId: "camp_002",
    worker: "clipper_asia",
    platform: "TikTok",
    url: "https://tiktok.com/demo/video/123",
    views: 0,
    estimatedEarnings: 0,
    status: "submitted",
    submittedAt: "2026-05-04",
  },
];
