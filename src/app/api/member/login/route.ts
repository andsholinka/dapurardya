import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/mongodb";
import { setMemberSession } from "@/lib/auth";
import type { MemberDoc } from "@/types/member";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
    }

    const db = await getDb();
    const member = await db.collection<MemberDoc>("members").findOne({ email: email.toLowerCase().trim() });
    if (!member) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, member.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    await setMemberSession({
      id: member._id!.toString(),
      name: member.name,
      email: member.email,
      aiPlan: member.aiPlan === "premium" ? "premium" : "free",
    });
    revalidatePath("/member");
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[MEMBER LOGIN]", e);
    return NextResponse.json({ error: "Gagal login" }, { status: 500 });
  }
}
