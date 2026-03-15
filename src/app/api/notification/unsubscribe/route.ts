import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { endpoint } = await req.json();

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint is required" }, { status: 400 });
    }

    const db = await getDb();
    await db.collection("push_subscriptions").deleteOne({ endpoint });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PUSH_UNSUBSCRIBE_ERROR]", error);
    return NextResponse.json({ error: "Gagal menghapus subscription" }, { status: 500 });
  }
}
