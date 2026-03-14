import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getMemberSession, getAdminSession } from "@/lib/auth";

const COLLECTION = "recipe_ratings";

// GET — ambil avg rating + rating milik user yang sedang login
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> }
) {
  const { recipeId } = await params;
  try {
    const db = await getDb();
    const col = db.collection(COLLECTION);

    const agg = await col.aggregate([
      { $match: { recipeId } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]).toArray();

    const avg = agg[0] ? Math.round(agg[0].avg * 10) / 10 : 0;
    const count = agg[0]?.count ?? 0;

    // Rating milik user yang login (opsional)
    let userRating: number | null = null;
    const member = await getMemberSession();
    if (member) {
      const existing = await col.findOne({ recipeId, memberId: member.id });
      userRating = existing?.rating ?? null;
    }

    return NextResponse.json({ avg, count, userRating });
  } catch (e) {
    console.error("[RATING GET]", e);
    return NextResponse.json({ error: "Gagal mengambil rating" }, { status: 500 });
  }
}

// POST — submit atau update rating { rating: 1-5 }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> }
) {
  const member = await getMemberSession();
  const isAdmin = await getAdminSession();
  if (!member && !isAdmin) {
    return NextResponse.json({ error: "Login dulu untuk memberi rating" }, { status: 401 });
  }

  const { recipeId } = await params;
  const { rating } = await req.json();

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating harus antara 1-5" }, { status: 400 });
  }

  const memberId = member?.id ?? "admin";

  try {
    const db = await getDb();
    const col = db.collection(COLLECTION);

    await col.updateOne(
      { recipeId, memberId },
      { $set: { recipeId, memberId, rating, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );

    // Hitung ulang avg setelah update
    const agg = await col.aggregate([
      { $match: { recipeId } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]).toArray();

    const avg = agg[0] ? Math.round(agg[0].avg * 10) / 10 : 0;
    const count = agg[0]?.count ?? 0;

    return NextResponse.json({ avg, count, userRating: rating });
  } catch (e) {
    console.error("[RATING POST]", e);
    return NextResponse.json({ error: "Gagal menyimpan rating" }, { status: 500 });
  }
}
