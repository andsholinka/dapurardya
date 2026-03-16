import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth-v2";
import { ObjectId } from "mongodb";
import type { RecipeRequestDoc } from "@/types/recipe-request";
import { sendRequestDoneNotification } from "@/lib/email";
import { logger, apiError } from "@/lib/logger";

const COLLECTION = "recipe_requests";

// Admin: mark as done / delete
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const db = await getDb();
    const col = db.collection<RecipeRequestDoc>(COLLECTION);

    // Ambil data request sebelum diupdate untuk keperluan email
    const existing = await col.findOne({ _id: new ObjectId(id) });

    await col.updateOne({ _id: new ObjectId(id) }, { $set: { status: "done" } });

    // Kirim email ke member jika ada email tersimpan (non-blocking)
    if (existing?.memberEmail) {
      sendRequestDoneNotification({
        memberEmail: existing.memberEmail,
        memberName: existing.name,
        recipeName: existing.recipeName,
        message: existing.message,
      }).catch((err) => logger.error("Gagal kirim notifikasi email done", "EMAIL", err));
    }

    return NextResponse.json({ success: true });
  } catch (e) { return apiError("REQUEST_PATCH", e, "Gagal update"); }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const db = await getDb();
    const col = db.collection<RecipeRequestDoc>(COLLECTION);
    await col.deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (e) { return apiError("REQUEST_DELETE", e, "Gagal hapus"); }
}
