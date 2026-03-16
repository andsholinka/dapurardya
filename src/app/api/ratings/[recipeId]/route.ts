import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getSession, isMember } from "@/lib/auth-v2";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { apiError } from "@/lib/logger";

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
    const session = await getSession();
    if (session) {
      const memberId = session.role === "admin" ? "admin" : session.id;
      userReview = reviews.find(r => r.memberId === memberId) || null;
    }

    return NextResponse.json({ avg, count, userReview, reviews });
  } catch (e) { return apiError("RATING_GET", e, "Gagal mengambil ulasan"); }
}

// POST — submit atau update ulasan { rating: 1-5, comment?, image? }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ recipeId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Login dulu untuk memberi ulasan" }, { status: 401 });
  }

  const { recipeId } = await params;
  const body = await req.json();
  const { rating, comment, image } = body;

  if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating harus antara 1-5" }, { status: 400 });
  }

  // Sanitize string inputs
  const safeComment = typeof comment === "string" ? comment.trim().slice(0, 500) : "";
  const safeImage = typeof image === "string" ? image.slice(0, 500) : "";

  const memberId = session.role === "admin" ? "admin" : session.id;
  const memberName = session.name;

  try {
    const db = await getDb();
    const col = db.collection(COLLECTION);

    const updateData = {
      recipeId,
      memberId,
      memberName,
      rating,
      comment: safeComment,
      image: safeImage,
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
  } catch (e) { return apiError("RATING_POST", e, "Gagal menyimpan ulasan"); }
}
