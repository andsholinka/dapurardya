import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { addMemberCredits, recordCreditUsage } from "@/lib/member-credits";
import { logger, apiError } from "@/lib/logger";

const PACKAGE_AMOUNTS: Record<number, number> = {
  15000: 10,
  25000: 25,
  40000: 50,
};

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const event = payload.event || "payment.received";
    if (event !== "payment.received") {
      return NextResponse.json({ message: "Event ignored" });
    }

    const payment = payload.data || payload;
    const status = payment.status?.toLowerCase();
    const email = payment.customer_email || payment.email;
    const amount = parseInt(payment.amount || payment.total);

    // Cek status pembayaran
    const successStatuses = ["success", "completed", "paid", "settlement"];
    if (!successStatuses.includes(status) && payment.status !== "paid") {
      return NextResponse.json({ message: "Status not paid" });
    }

    if (!email || !amount) {
      return NextResponse.json({ error: "Missing identity or amount" }, { status: 400 });
    }

    // Idempotency key: gunakan payment_id dari Mayar, fallback ke hash email+amount+tanggal
    const paymentId =
      payment.id ||
      payment.payment_id ||
      payment.transaction_id ||
      `${email}:${amount}:${payment.created_at || new Date().toISOString().slice(0, 10)}`;

    const db = await getDb();

    // Cek apakah payment ini sudah pernah diproses
    const existing = await db.collection("payment_logs").findOne({ paymentId });
    if (existing) {
      logger.info(`Duplicate webhook ignored: ${paymentId}`, "MAYAR_WEBHOOK");
      return NextResponse.json({ success: true, duplicate: true });
    }

    const creditsToAdd = PACKAGE_AMOUNTS[amount];
    if (!creditsToAdd) {
      logger.warn("No credit mapping for amount", "MAYAR_WEBHOOK", { amount });
      return NextResponse.json({ message: "Amount mapping not found" });
    }

    const user = await db.collection("members").findOne({ email });
    if (!user) {
      logger.warn("User not found for email", "MAYAR_WEBHOOK", { email });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Simpan log dulu (idempotency guard) sebelum tambah kredit
    await db.collection("payment_logs").insertOne({
      paymentId,
      email,
      amount,
      creditsAdded: creditsToAdd,
      status: "processing",
      gateway: "mayar",
      rawPayload: payload,
      createdAt: new Date(),
    });

    const updated = await addMemberCredits(db, email, creditsToAdd);
    if (updated) {
      await recordCreditUsage(db, user._id.toString(), {
        action: "admin_adjustment",
        amount: creditsToAdd,
        description: `Mayar Payment - Rp${amount.toLocaleString("id-ID")}`,
        metadata: { gateway: "mayar", paymentId },
      });

      // Update log status ke done
      await db.collection("payment_logs").updateOne(
        { paymentId },
        { $set: { status: "done", processedAt: new Date() } }
      );

      logger.info(`Added ${creditsToAdd} credits to ${email} (paymentId: ${paymentId})`, "MAYAR_WEBHOOK");
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return apiError("MAYAR_WEBHOOK", error, "Internal server error");
  }
}
