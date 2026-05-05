import { NextRequest, NextResponse } from "next/server";

const TONAPI_BASE_URL = process.env.TONAPI_BASE_URL || "https://tonapi.io/v2";

function isLikelyTonAddress(value: string) {
  return /^(EQ|UQ)[A-Za-z0-9_-]{46}$/.test(value) || /^-?\d+:[a-fA-F0-9]{64}$/.test(value);
}

async function tonFetch(path: string) {
  const headers: Record<string, string> = { accept: "application/json" };
  if (process.env.TONAPI_KEY) {
    headers.authorization = `Bearer ${process.env.TONAPI_KEY}`;
  }

  const res = await fetch(`${TONAPI_BASE_URL}${path}`, {
    headers,
    next: { revalidate: 0 },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || data?.message || `TON API error: ${res.status}`);
  }

  return data;
}

function fromNano(value: string | number | bigint) {
  const raw = BigInt(String(value || "0"));
  const whole = raw / 1_000_000_000n;
  const fraction = raw % 1_000_000_000n;
  const fractionText = fraction.toString().padStart(9, "0").replace(/0+$/, "");
  return Number(`${whole.toString()}${fractionText ? `.${fractionText}` : ""}`);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const wallet = String(body?.wallet || "").trim();

  if (!isLikelyTonAddress(wallet)) {
    return NextResponse.json({ error: "Enter a valid public TON wallet address." }, { status: 400 });
  }

  try {
    const [account, jettons] = await Promise.allSettled([
      tonFetch(`/accounts/${encodeURIComponent(wallet)}`),
      tonFetch(`/accounts/${encodeURIComponent(wallet)}/jettons`),
    ]);

    if (account.status === "rejected") {
      throw account.reason;
    }

    const jettonBalances = jettons.status === "fulfilled" ? jettons.value?.balances || [] : [];
    const tonBalance = fromNano(account.value?.balance || 0);
    const nonZeroJettons = jettonBalances.filter((item: any) => Number(item?.balance || 0) > 0);

    const assets = nonZeroJettons.slice(0, 50).map((item: any) => {
      const decimals = Number(item?.jetton?.decimals || 9);
      const raw = Number(item?.balance || 0);
      const normalized = raw / 10 ** decimals;
      return {
        name: item?.jetton?.name || "Unknown jetton",
        symbol: item?.jetton?.symbol || "JETTON",
        balance: normalized,
        rawBalance: String(item?.balance || "0"),
        decimals,
        image: item?.jetton?.image || null,
        walletAddress: item?.wallet_address?.address || null,
        jettonAddress: item?.jetton?.address || null,
        verification: item?.jetton?.verification || "unknown",
      };
    });

    const suspiciousAssets = assets.filter((asset: any) => asset.verification && asset.verification !== "whitelist");

    return NextResponse.json({
      wallet,
      scannedAt: new Date().toISOString(),
      chain: "ton",
      tonBalance,
      status: account.value?.status || "unknown",
      interfaces: account.value?.interfaces || [],
      jettonCount: assets.length,
      suspiciousAssetCount: suspiciousAssets.length,
      assets,
      opportunities: [
        tonBalance > 0 ? "TON balance detected" : "No TON balance detected",
        assets.length > 0 ? `${assets.length} jetton/token balances detected` : "No jetton balances detected",
        suspiciousAssets.length > 0 ? `${suspiciousAssets.length} unverified or unknown jettons need review` : "No suspicious jettons detected in first 50 balances",
      ],
      mode: "read_only_ton_scan",
      safety: "This scan only reads public TON wallet data. It cannot move funds and never asks for seed phrases or private keys.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not scan TON wallet." },
      { status: 500 },
    );
  }
}
