import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/auth";
import { ObjectId } from "mongodb";
import type { RecipeRequestDoc } from "@/types/recipe-request";

const COLLECTION = "recipe_requests";

// Admin: mark as done / delete
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await getAdminSession();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const db = await getDb();
    const col = db.collection<RecipeRequestDoc>(COLLECTION);
    await col.updateOne({ _id: new ObjectId(id) }, { $set: { status: "done" } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[REQUEST PATCH] Error:", e);
    return NextResponse.json({ error: "Gagal update" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await getAdminSession();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const db = await getDb();
    const col = db.collection<RecipeRequestDoc>(COLLECTION);
    await col.deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[REQUEST DELETE] Error:", e);
    return NextResponse.json({ error: "Gagal hapus" }, { status: 500 });
  }
}
