import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { addMemberCredits, recordCreditUsage } from "@/lib/member-credits";

const PACKAGE_AMOUNTS: Record<number, number> = {
  15000: 10,
  25000: 25,
  40000: 50,
};

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log("[MAYAR_WEBHOOK] Received:", JSON.stringify(payload, null, 2));

    // Handle payment.received or similar event
    // Mayar usually sends event in 'event' field or just the payload for v1
    const event = payload.event || "payment.received";
    
    if (event !== "payment.received") {
      return NextResponse.json({ message: "Event ignored" });
    }

    // Extraction depends on Mayar payload structure
    // Typically: { data: { customer_email, amount, status, ... } }
    const payment = payload.data || payload;
    const status = payment.status?.toLowerCase();
    const email = payment.customer_email || payment.email;
    const amount = parseInt(payment.amount || payment.total);

    if (status !== "success" && status !== "completed" && status !== "paid" && status !== "settlement") {
      // Some gateways use different success statuses
      // For HL v1 paid is common
      if (payment.status !== "paid") {
           return NextResponse.json({ message: "Status not paid" });
      }
    }

    if (!email || !amount) {
      return NextResponse.json({ error: "Missing identity or amount" }, { status: 400 });
    }

    const creditsToAdd = PACKAGE_AMOUNTS[amount];
    if (!creditsToAdd) {
      console.warn("[MAYAR_WEBHOOK] No credit mapping for amount:", amount);
      return NextResponse.json({ message: "Amount mapping not found" });
    }

    const db = await getDb();
    
    // Find user by email to get Id for logging
    const user = await db.collection("members").findOne({ email });
    if (!user) {
      console.error("[MAYAR_WEBHOOK] User not found for email:", email);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updated = await addMemberCredits(db, email, creditsToAdd);
    
    if (updated) {
      await recordCreditUsage(db, user._id.toString(), {
        action: "admin_adjustment", // Or create a new action type "payment"
        amount: creditsToAdd,
        description: `Mayar Payment - ${amount}`,
        metadata: { gateway: "mayar", payload },
      });
      console.log(`[MAYAR_WEBHOOK] Successfully added ${creditsToAdd} credits to ${email}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[MAYAR_WEBHOOK_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
