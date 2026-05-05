import { NextRequest, NextResponse } from "next/server";

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const LAMPORTS_PER_SOL = 1_000_000_000;
const TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const TOKEN_2022_PROGRAM_ID = "TokenzQdBNbLqP5VEaqK6A4xkczNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

function isLikelySolanaAddress(value: string) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value);
}

async function rpc(method: string, params: unknown[]) {
  const res = await fetch(SOLANA_RPC_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: "ghostwallet", method, params }),
    next: { revalidate: 0 },
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || `Solana RPC error: ${res.status}`);
  }

  return data.result;
}

async function getTokenAccounts(owner: string, programId: string) {
  return rpc("getTokenAccountsByOwner", [
    owner,
    { programId },
    { encoding: "jsonParsed" },
  ]);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const wallet = String(body?.wallet || "").trim();

  if (!isLikelySolanaAddress(wallet)) {
    return NextResponse.json({ error: "Enter a valid public Solana wallet address." }, { status: 400 });
  }

  try {
    const [classic, token2022] = await Promise.allSettled([
      getTokenAccounts(wallet, TOKEN_PROGRAM_ID),
      getTokenAccounts(wallet, TOKEN_2022_PROGRAM_ID),
    ]);

    const accounts = [
      ...(classic.status === "fulfilled" ? classic.value.value || [] : []),
      ...(token2022.status === "fulfilled" ? token2022.value.value || [] : []),
    ];

    const parsedAccounts = accounts.map((entry: any) => {
      const info = entry.account?.data?.parsed?.info;
      const amount = Number(info?.tokenAmount?.amount || 0);
      const decimals = Number(info?.tokenAmount?.decimals || 0);
      const lamports = Number(entry.account?.lamports || 0);
      return {
        address: entry.pubkey,
        mint: info?.mint || "unknown",
        amount,
        decimals,
        state: info?.state || "unknown",
        lamports,
        reclaimableSol: lamports / LAMPORTS_PER_SOL,
        isEmpty: amount === 0,
      };
    });

    const emptyAccounts = parsedAccounts.filter((account) => account.isEmpty && account.lamports > 0);
    const reclaimableLamports = emptyAccounts.reduce((sum, account) => sum + account.lamports, 0);
    const reclaimableSol = reclaimableLamports / LAMPORTS_PER_SOL;

    return NextResponse.json({
      wallet,
      scannedAt: new Date().toISOString(),
      totalTokenAccounts: parsedAccounts.length,
      emptyTokenAccounts: emptyAccounts.length,
      reclaimableLamports,
      reclaimableSol,
      accounts: emptyAccounts.slice(0, 50),
      mode: "read_only_scan",
      safety: "This scan only reads public wallet data. It cannot move funds and never asks for seed phrases or private keys.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not scan wallet." },
      { status: 500 },
    );
  }
}
