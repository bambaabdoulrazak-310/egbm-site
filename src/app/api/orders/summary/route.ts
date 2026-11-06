import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getOrderSummary } from "@/lib/order-stats";

export async function GET(): Promise<NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  return NextResponse.json(await getOrderSummary(), { headers: { "Cache-Control": "no-store" } });
}
