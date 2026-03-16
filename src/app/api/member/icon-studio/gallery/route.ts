import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-v2";
import { getDb } from "@/lib/mongodb";
import { tryConvertObjectId } from "@/lib/mongodb";
import { apiError } from "@/lib/logger";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = await getDb();
    const id = tryConvertObjectId(session.id);
    const icons = await db.collection("member_icons")
      .find({ memberId: id })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({
      icons: icons.map((i) => ({
        id: i._id.toString(),
        url: i.url,
        prompt: i.prompt,
        perspective: i.perspective,
        createdAt: i.createdAt,
      })),
    });
  } catch (error) {
    return apiError("ICON_GALLERY", error, "Gagal memuat galeri");
  }
}
