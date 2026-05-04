export function extractYouTubeVideoId(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtube.com") && parsed.pathname.startsWith("/shorts/")) {
      return parsed.pathname.split("/")[2] || null;
    }

    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
    }

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "") || null;
    }

    return null;
  } catch {
    return null;
  }
}

export function calculateEstimatedEarnings(views: number, workerCpmUsd: number) {
  return Number(((views / 1000) * workerCpmUsd).toFixed(4));
}

export function basicFraudScore(input: {
  views: number;
  likes?: number;
  comments?: number;
  accountVerified?: boolean;
}) {
  let score = 0;
  const likes = input.likes ?? 0;
  const comments = input.comments ?? 0;

  if (!input.accountVerified) score += 20;
  if (input.views >= 5000 && likes / Math.max(input.views, 1) < 0.001) score += 25;
  if (input.views >= 10000 && comments === 0) score += 20;

  return Math.min(score, 100);
}
