import { NextRequest, NextResponse } from "next/server";
import { getMemberSession } from "@/lib/auth";
import { createMayarPaymentLink } from "@/lib/mayar";

const PACKAGES = {
  starter: { amount: 15000, credits: 10, name: "Starter Credits" },
  basic: { amount: 25000, credits: 25, name: "Basic Credits" },
  pro: { amount: 40000, credits: 50, name: "Pro Credits" },
};

export async function POST(req: NextRequest) {
  try {
    const session = await getMemberSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { packageId, mobile } = await req.json();
    const pkg = PACKAGES[packageId as keyof typeof PACKAGES];

    if (!pkg) {
      return NextResponse.json({ error: "Invalid package" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dapurardya.my.id";
    
    // Create payment link
    const result = await createMayarPaymentLink({
      name: session.name,
      email: session.email,
      amount: pkg.amount,
      mobile: mobile || "081234567890", // Mayar requires mobile
      description: `Top Up ${pkg.credits} Credits - Dapur Ardya`,
      redirectURL: `${baseUrl}/member/upgrade/success`,
      expiredAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    });

    const paymentLink = result.data?.[0]?.link || result.data?.link || result.link;

    if (!paymentLink) {
      throw new Error("Payment link not found in API response");
    }

    return NextResponse.json({ url: paymentLink });
  } catch (error: any) {
    console.error("[PAYMENT_CHECKOUT]", error);
    return NextResponse.json({ error: error.message || "Failed to initiate payment" }, { status: 500 });
  }
}
