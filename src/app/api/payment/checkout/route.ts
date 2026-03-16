import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-v2";
import { createMayarPaymentLink } from "@/lib/mayar";
import { validateOrThrow, checkoutSchema } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { apiError } from "@/lib/logger";

const PACKAGES = {
  starter: { amount: 15000, credits: 10, name: "Starter Credits" },
  basic: { amount: 25000, credits: 25, name: "Basic Credits" },
  pro: { amount: 40000, credits: 50, name: "Pro Credits" },
};

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 10 checkout attempts per hour per user
  const ip = getClientIp(req);
  const rl = rateLimit(`checkout:${session.id ?? ip}`, { limit: 10, windowSec: 60 * 60 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { packageId, mobile } = validateOrThrow(checkoutSchema, body);
    const pkg = PACKAGES[packageId];

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dapurardya.my.id";

    const result = await createMayarPaymentLink({
      name: session.name,
      email: session.email,
      amount: pkg.amount,
      mobile: mobile || "081234567890",
      description: `Top Up ${pkg.credits} Credits - Dapur Ardya`,
      redirectURL: `${baseUrl}/member/upgrade/success`,
      expiredAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    });

    const paymentLink = result.data?.[0]?.link || result.data?.link || result.link;
    if (!paymentLink) throw new Error("Payment link not found in API response");

    return NextResponse.json({ url: paymentLink });
  } catch (e) { return apiError("PAYMENT_CHECKOUT", e, "Gagal membuat link pembayaran"); }
}
