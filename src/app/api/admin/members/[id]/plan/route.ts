import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/auth-v2";
import { getDb } from "@/lib/mongodb";
import { apiError } from "@/lib/logger";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const nextCredits = body?.credits !== undefined ? Number(body.credits) : undefined;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID member tidak valid" }, { status: 400 });
    }

    const db = await getDb();
    const members = db.collection("members");

    const updateData: any = {};
    if (nextCredits !== undefined) updateData.credits = nextCredits;

    const result = await members.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "Member tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      member: {
        id: result._id.toString(),
        name: result.name || result.email,
        email: result.email,
        credits: result.credits || 0,
        createdAt: result.createdAt instanceof Date ? result.createdAt.toISOString() : null,
      },
    });
  } catch (error) { return apiError("ADMIN_MEMBER_PLAN", error, "Gagal memperbarui data member"); }
}
