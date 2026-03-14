import { NextRequest, NextResponse } from "next/server";
import { getMemberSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

// GET /api/member/bookmarks — ambil daftar slug yang di-bookmark member
export async function GET() {
  const session = await getMemberSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const doc = await db.collection("member_bookmarks").findOne({ memberId: session.id });
  return NextResponse.json({ bookmarks: doc?.recipeIds ?? [] });
}

// POST /api/member/bookmarks — toggle bookmark { recipeId: string }
export async function POST(req: NextRequest) {
  const session = await getMemberSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { recipeId } = await req.json();
  if (!recipeId) return NextResponse.json({ error: "recipeId required" }, { status: 400 });

  const db = await getDb();
  const col = db.collection("member_bookmarks");
  const doc = await col.findOne({ memberId: session.id });
  const current: string[] = doc?.recipeIds ?? [];
  const isBookmarked = current.includes(recipeId);

  const updated = isBookmarked
    ? current.filter((id) => id !== recipeId)
    : [...current, recipeId];

  await col.updateOne(
    { memberId: session.id },
    { $set: { memberId: session.id, recipeIds: updated, updatedAt: new Date() } },
    { upsert: true }
  );

  return NextResponse.json({ bookmarked: !isBookmarked, recipeIds: updated });
}
