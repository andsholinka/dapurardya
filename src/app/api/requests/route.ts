import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/auth";
import type { RecipeRequestDoc } from "@/types/recipe-request";

const COLLECTION = "recipe_requests";

// Public: submit request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, recipeName, message } = body;

    if (!name?.trim() || !recipeName?.trim()) {
      return NextResponse.json({ error: "Nama dan nama resep wajib diisi" }, { status: 400 });
    }

    const db = await getDb();
    const col = db.collection<RecipeRequestDoc>(COLLECTION);
    const doc: Omit<RecipeRequestDoc, "_id"> = {
      name: name.trim(),
      recipeName: recipeName.trim(),
      message: message?.trim() || undefined,
      status: "pending",
      createdAt: new Date(),
    };

    const result = await col.insertOne(doc as RecipeRequestDoc);
    return NextResponse.json({ _id: result.insertedId.toString(), ...doc }, { status: 201 });
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
