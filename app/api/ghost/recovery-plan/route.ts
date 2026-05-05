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

function parseAccount(entry: any, programId: string) {
  const info = entry.account?.data?.parsed?.info;
  const amount = Number(info?.tokenAmount?.amount || 0);
  const lamports = Number(entry.account?.lamports || 0);

  return {
    address: entry.pubkey,
    mint: info?.mint || "unknown",
    owner: info?.owner || "unknown",
    programId,
    amount,
    lamports,
    reclaimableSol: lamports / LAMPORTS_PER_SOL,
    isEmpty: amount === 0,
    closeAuthority: info?.closeAuthority || null,
  };
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
      ...(classic.status === "fulfilled" ? (classic.value.value || []).map((entry: any) => parseAccount(entry, TOKEN_PROGRAM_ID)) : []),
      ...(token2022.status === "fulfilled" ? (token2022.value.value || []).map((entry: any) => parseAccount(entry, TOKEN_2022_PROGRAM_ID)) : []),
    ];

    const recoverableAccounts = accounts.filter((account) => {
      const closeAuthorityMatches = !account.closeAuthority || account.closeAuthority === wallet;
      return account.isEmpty && account.lamports > 0 && account.owner === wallet && closeAuthorityMatches;
    });

    const reclaimableLamports = recoverableAccounts.reduce((sum, account) => sum + account.lamports, 0);
    const reclaimableSol = reclaimableLamports / LAMPORTS_PER_SOL;
    const feeBps = Number(process.env.GHOST_FEE_BPS || 700);
    const feeSol = reclaimableSol * (feeBps / 10_000);
    const userReceivesSol = Math.max(reclaimableSol - feeSol, 0);

    return NextResponse.json({
      wallet,
      generatedAt: new Date().toISOString(),
      mode: "prepare_only",
      totalAccountsScanned: accounts.length,
      accountsToClose: recoverableAccounts.length,
      reclaimableLamports,
      reclaimableSol,
      feeBps,
      feeSol,
      userReceivesSol,
      accounts: recoverableAccounts.slice(0, 50).map((account) => ({
        address: account.address,
        mint: account.mint,
        programId: account.programId,
        reclaimableSol: account.reclaimableSol,
      })),
      signingStatus: "not_enabled_yet",
      nextStep: "Add Solana transaction serialization/signing so the connected wallet can close these accounts with user approval.",
      safety: "This endpoint only prepares a recovery plan. It does not create, sign, or send transactions.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not prepare recovery plan." },
      { status: 500 },
    );
  }
}
