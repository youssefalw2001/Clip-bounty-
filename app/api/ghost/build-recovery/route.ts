import { NextRequest, NextResponse } from "next/server";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { createCloseAccountInstruction, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const LAMPORTS_PER_SOL = 1_000_000_000;
const MAX_ACCOUNTS_PER_TX = 8;

function isLikelySolanaAddress(value: string) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value);
}

async function getTokenAccounts(connection: Connection, owner: PublicKey, programId: PublicKey) {
  return connection.getParsedTokenAccountsByOwner(owner, { programId });
}

function parseAccount(entry: any, programId: PublicKey) {
  const info = entry.account?.data?.parsed?.info;
  const amount = Number(info?.tokenAmount?.amount || 0);
  const lamports = Number(entry.account?.lamports || 0);

  return {
    address: entry.pubkey.toString(),
    publicKey: entry.pubkey as PublicKey,
    mint: info?.mint || "unknown",
    owner: info?.owner || "unknown",
    programId,
    programIdString: programId.toString(),
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
    const owner = new PublicKey(wallet);
    const connection = new Connection(SOLANA_RPC_URL, "confirmed");

    const [classic, token2022] = await Promise.allSettled([
      getTokenAccounts(connection, owner, TOKEN_PROGRAM_ID),
      getTokenAccounts(connection, owner, TOKEN_2022_PROGRAM_ID),
    ]);

    const accounts = [
      ...(classic.status === "fulfilled" ? classic.value.value.map((entry: any) => parseAccount(entry, TOKEN_PROGRAM_ID)) : []),
      ...(token2022.status === "fulfilled" ? token2022.value.value.map((entry: any) => parseAccount(entry, TOKEN_2022_PROGRAM_ID)) : []),
    ];

    const recoverableAccounts = accounts.filter((account) => {
      const closeAuthorityMatches = !account.closeAuthority || account.closeAuthority === wallet;
      return account.isEmpty && account.lamports > 0 && account.owner === wallet && closeAuthorityMatches;
    });

    if (recoverableAccounts.length === 0) {
      return NextResponse.json({ error: "No recoverable empty token accounts found." }, { status: 400 });
    }

    const selectedAccounts = recoverableAccounts.slice(0, MAX_ACCOUNTS_PER_TX);
    const reclaimableLamports = selectedAccounts.reduce((sum, account) => sum + account.lamports, 0);
    const feeBps = Number(process.env.GHOST_FEE_BPS || 700);
    const feeWallet = process.env.GHOST_FEE_WALLET;
    const feeLamports = feeWallet ? Math.floor((reclaimableLamports * feeBps) / 10_000) : 0;
    const userReceivesLamports = Math.max(reclaimableLamports - feeLamports, 0);

    const latestBlockhash = await connection.getLatestBlockhash("confirmed");
    const tx = new Transaction({
      feePayer: owner,
      recentBlockhash: latestBlockhash.blockhash,
    });

    for (const account of selectedAccounts) {
      tx.add(
        createCloseAccountInstruction(
          account.publicKey,
          owner,
          owner,
          [],
          account.programId,
        ),
      );
    }

    if (feeWallet && feeLamports > 0) {
      tx.add(
        SystemProgram.transfer({
          fromPubkey: owner,
          toPubkey: new PublicKey(feeWallet),
          lamports: feeLamports,
        }),
      );
    }

    const serializedTransaction = tx.serialize({ requireAllSignatures: false, verifySignatures: false }).toString("base64");

    return NextResponse.json({
      wallet,
      transactionBase64: serializedTransaction,
      latestBlockhash,
      accountsInTransaction: selectedAccounts.length,
      totalRecoverableAccounts: recoverableAccounts.length,
      reclaimableLamports,
      reclaimableSol: reclaimableLamports / LAMPORTS_PER_SOL,
      feeBps: feeWallet ? feeBps : 0,
      feeLamports,
      feeSol: feeLamports / LAMPORTS_PER_SOL,
      userReceivesLamports,
      userReceivesSol: userReceivesLamports / LAMPORTS_PER_SOL,
      feeWalletConfigured: Boolean(feeWallet),
      accounts: selectedAccounts.map((account) => ({
        address: account.address,
        mint: account.mint,
        programId: account.programIdString,
        reclaimableSol: account.reclaimableSol,
      })),
      safety: "This transaction must be reviewed and signed by the connected wallet. GhostWallet never receives seed phrases or private keys.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not build recovery transaction." },
      { status: 500 },
    );
  }
}
