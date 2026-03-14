import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getMemberSession, setMemberSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const session = await getMemberSession();
    if (!session) {
      return NextResponse.json({ error: "Sesi tidak valid" }, { status: 401 });
    }

    const { name } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Nama tidak boleh kosong" }, { status: 400 });
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
      { $set: { name: name.trim(), updatedAt: new Date() } }
    );

    // Update session cookie if it's a cookie-based session
    // For NextAuth, we can't easily update the session from here, 
    // but the modified getMemberSession (which I'll do next) will handle it.
    
    // We update the cookie-based session anyway if it exists
    const updatedSession = { ...session, name: name.trim() };
    await setMemberSession(updatedSession);

    revalidatePath("/");
    revalidatePath("/member");

    return NextResponse.json({ success: true, name: name.trim() });
  } catch (e) {
    console.error("[UPDATE_NAME]", e);
    return NextResponse.json({ error: "Gagal memperbarui nama" }, { status: 500 });
  }
}
