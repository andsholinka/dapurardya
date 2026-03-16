import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { apiError } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const subscription = await req.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }

    const db = await getDb();
    
    // Simpan subscription. Gunakan endpoint sebagai unique key agar tidak duplikat.
    await db.collection("push_subscriptions").updateOne(
      { endpoint: subscription.endpoint },
      { $set: { ...subscription, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) { return apiError("PUSH_SUBSCRIBE", error, "Gagal menyimpan subscription"); }
}
