import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getSession, setAuthCookie } from "@/lib/auth-v2";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { apiError } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Sesi tidak valid" }, { status: 401 });
    }

    // Rate limit: 10 name changes per hour per user
    const rl = rateLimit(`update-name:${session.id}`, { limit: 10, windowSec: 60 * 60 });
    if (!rl.allowed) {
      return NextResponse.json({ error: "Terlalu sering mengubah nama." }, { status: 429 });
    }

    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    if (!name || name.length < 2 || name.length > 100) {
      return NextResponse.json({ error: "Nama harus antara 2-100 karakter" }, { status: 400 });
    }

    const db = await getDb();
    const col = db.collection("members");

    // Update in DB
    // id could be an email (for google) or an ObjectId (for credentials)
    let query = {};
    if (ObjectId.isValid(session.id)) {
      query = { _id: new ObjectId(session.id) };
    } else {
      query = { email: session.email };
    }

    await col.updateOne(
      query,
      { $set: { name: name, updatedAt: new Date() } }
    );

    // Update session cookie with new name
    const updatedSession = { ...session, name: name };
    await setAuthCookie(updatedSession);

    revalidatePath("/");
    revalidatePath("/member");

    return NextResponse.json({ success: true, name: name });
  } catch (e) { return apiError("UPDATE_NAME", e, "Gagal memperbarui nama"); }
}
