import { NextRequest, NextResponse } from "next/server";
import { Connection } from "@solana/web3.js";

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const rawTransactionBase64 = String(body?.rawTransactionBase64 || "");

  if (!rawTransactionBase64) {
    return NextResponse.json({ error: "Missing signed transaction." }, { status: 400 });
  }

  try {
    const connection = new Connection(SOLANA_RPC_URL, "confirmed");
    const rawTransaction = Buffer.from(rawTransactionBase64, "base64");
    const signature = await connection.sendRawTransaction(rawTransaction, {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });

    return NextResponse.json({ signature });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not send signed transaction." },
      { status: 500 },
    );
  }
}
