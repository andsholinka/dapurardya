import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { getDb } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/auth";

webpush.setVapidDetails(
  "mailto:admin@dapurardya.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, body, url } = await req.json();

    if (!title || !body) {
      return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
    }

    const db = await getDb();
    const subscriptions = await db.collection("push_subscriptions").find({}).toArray();

    const payload = JSON.stringify({ title, body, url: url || "/" });

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          payload
        )
      )
    );

    // Filter yang gagal (mungkin token sudah expired)
    const failures = results.filter((r) => r.status === "rejected");
    
    return NextResponse.json({
      success: true,
      sentCount: subscriptions.length - failures.length,
      failureCount: failures.length,
    });
  } catch (error) {
    console.error("[PUSH_BROADCAST_ERROR]", error);
    return NextResponse.json({ error: "Gagal mengirim notifikasi" }, { status: 500 });
  }
}
