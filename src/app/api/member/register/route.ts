import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/mongodb";
import { setMemberSession } from "@/lib/auth";
import type { MemberDoc } from "@/types/member";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
    }

    const db = await getDb();
    const col = db.collection<MemberDoc>("members");
    const existing = await col.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await col.insertOne({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      aiPlan: "free",
      passwordHash,
      createdAt: new Date(),
    } as MemberDoc);

    await setMemberSession({
      id: result.insertedId.toString(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      aiPlan: "free",
    });
    revalidatePath("/member");
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[REGISTER]", e);
    return NextResponse.json({ error: "Gagal mendaftar" }, { status: 500 });
  }
}
