import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getAdminSession, getMemberSession } from "@/lib/auth";
import type { RecipeRequestDoc } from "@/types/recipe-request";
import { sendRequestNotification } from "@/lib/email";
import { getMemberRecipeRequestStatus } from "@/lib/member-request";

const COLLECTION = "recipe_requests";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, recipeName, message } = body;

    if (!name?.trim() || !recipeName?.trim()) {
      return NextResponse.json({ error: "Nama dan nama resep wajib diisi" }, { status: 400 });
    }

    const memberSession = await getMemberSession();
    if (!memberSession) {
      return NextResponse.json(
        { error: "Silakan masuk sebagai member untuk mengirim request resep", code: "MEMBER_REQUIRED" },
        { status: 401 }
      );
    }

    const db = await getDb();
    const col = db.collection<RecipeRequestDoc>(COLLECTION);
    const requestStatus = await getMemberRecipeRequestStatus(db, memberSession);

    if (!requestStatus.canRequest) {
      return NextResponse.json(
        {
          error: "Paket free hanya bisa request resep 1 kali per bulan. Upgrade untuk request tanpa batas.",
          code: "REQUEST_QUOTA_EXCEEDED",
          requestStatus,
        },
        { status: 403 }
      );
    }

    const doc: Omit<RecipeRequestDoc, "_id"> = {
      memberId: memberSession.id,
      memberEmail: memberSession.email,
      name: name.trim(),
      recipeName: recipeName.trim(),
      message: message?.trim() || undefined,
      status: "pending",
      createdAt: new Date(),
    };

    const result = await col.insertOne(doc as RecipeRequestDoc);

    // Kirim notifikasi email ke admin (non-blocking)
    sendRequestNotification({
      name: doc.name,
      recipeName: doc.recipeName,
      message: doc.message,
      memberId: memberSession.id,
    }).catch((err) => console.error("[EMAIL] Gagal kirim notifikasi:", err));

    const updatedRequestStatus = await getMemberRecipeRequestStatus(db, memberSession);

    return NextResponse.json(
      { _id: result.insertedId.toString(), ...doc, requestStatus: updatedRequestStatus },
      { status: 201 }
    );
  } catch (e) {
    console.error("[REQUEST] Error:", e);
    return NextResponse.json({ error: "Gagal mengirim request" }, { status: 500 });
  }
}

// Admin: get all requests
export async function GET() {
  const isAdmin = await getAdminSession();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = await getDb();
    const col = db.collection<RecipeRequestDoc>(COLLECTION);
    const list = await col.find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(list.map((r) => ({ ...r, _id: r._id?.toString() })));
  } catch (e) {
    console.error("[REQUEST] Error:", e);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}
