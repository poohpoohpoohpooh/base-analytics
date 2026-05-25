import { NextResponse, type NextRequest } from "next/server";
import { analyzeWallet } from "@/lib/analyze";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { input?: unknown };
    const input = typeof body.input === "string" ? body.input : "";

    const result = await analyzeWallet(input);

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to analyze wallet.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
