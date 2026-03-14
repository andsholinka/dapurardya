import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getMemberSession, getAdminSession } from "@/lib/auth";

const COLLECTION = "recipe_ratings";

// GET — ambil ulasan lengkap + ulasan milik user yang sedang login
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> }
) {
  const { recipeId } = await params;
  try {
    const db = await getDb();
    const col = db.collection(COLLECTION);

    // 1. Ambil semua ulasan untuk resep ini
    const reviews = await col
      .find({ recipeId })
      .sort({ updatedAt: -1 })
      .toArray();

    // 2. Hitung aggregasi (avg & count)
    const agg = await col.aggregate([
      { $match: { recipeId } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]).toArray();

    const avg = agg[0] ? Math.round(agg[0].avg * 10) / 10 : 0;
    const count = agg[0]?.count ?? 0;

    // 3. Cari ulasan milik user yang sedang login
    let userReview: any = null;
    const member = await getMemberSession();
    if (member) {
      userReview = reviews.find(r => r.memberId === member.id) || null;
    } else {
      const admin = await getAdminSession();
      if (admin) userReview = reviews.find(r => r.memberId === "admin") || null;
    }

    return NextResponse.json({ avg, count, userReview, reviews });
  } catch (e) {
    console.error("[REVIEW GET]", e);
    return NextResponse.json({ error: "Gagal mengambil ulasan" }, { status: 500 });
  }
}

// POST — submit atau update ulasan { rating: 1-5, comment?, image? }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> }
) {
  const member = await getMemberSession();
  const isAdmin = await getAdminSession();
  if (!member && !isAdmin) {
    return NextResponse.json({ error: "Login dulu untuk memberi ulasan" }, { status: 401 });
  }

  const { recipeId } = await params;
  const { rating, comment, image } = await req.json();

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating harus antara 1-5" }, { status: 400 });
  }

  const memberId = member?.id ?? "admin";
  const memberName = member?.name ?? "Admin";

  try {
    const db = await getDb();
    const col = db.collection(COLLECTION);

    const updateData = {
      recipeId,
      memberId,
      memberName,
      rating,
      comment: comment?.trim() || "",
      image: image || "",
      updatedAt: new Date(),
    };

    await col.updateOne(
      { recipeId, memberId },
      { $set: updateData, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );

    // Hitung ulang avg setelah update
    const agg = await col.aggregate([
      { $match: { recipeId } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]).toArray();

    const avg = agg[0] ? Math.round(agg[0].avg * 10) / 10 : 0;
    const count = agg[0]?.count ?? 0;

    return NextResponse.json({ avg, count, userReview: updateData });
  } catch (e) {
    console.error("[REVIEW POST]", e);
    return NextResponse.json({ error: "Gagal menyimpan ulasan" }, { status: 500 });
  }
}
