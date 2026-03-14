import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import type { Recipe, RecipeInput } from "@/types/recipe";
import { ObjectId } from "mongodb";

const COLLECTION = "recipes";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const admin = await getAdminSession();
    const db = await getDb();
    const col = db.collection<Recipe>(COLLECTION);

    const filter: Record<string, unknown> = {};
    if (!admin) filter.published = true;
    if (category) filter.category = category;
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { ingredients: { $elemMatch: { $regex: q, $options: "i" } } },
      ];
    }

    const recipes = await col
      .find(filter)
      .sort({ updatedAt: -1 })
      .toArray();

    return NextResponse.json(
      recipes.map((r) => ({
        ...r,
        _id: r._id?.toString(),
      }))
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Gagal mengambil resep" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = (await request.json()) as RecipeInput;
    const { title, description, ingredients, steps, category, image, prepTimeMinutes, cookTimeMinutes, servings, published } = body;
    if (!title?.trim() || !description?.trim() || !Array.isArray(ingredients) || !Array.isArray(steps) || !category?.trim()) {
      return NextResponse.json(
        { error: "Judul, deskripsi, bahan, langkah, dan kategori wajib diisi" },
        { status: 400 }
      );
    }
    const slug = slugify(title);
    const db = await getDb();
    const col = db.collection<Recipe>(COLLECTION);
    const existing = await col.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { error: "Resep dengan judul serupa sudah ada" },
        { status: 400 }
      );
    }
    const now = new Date();
    const doc: Recipe = {
      title: title.trim(),
      slug,
      description: description.trim(),
      image: image?.trim() || undefined,
      ingredients: ingredients.filter(Boolean),
      steps: steps.filter(Boolean),
      category: category.trim(),
      prepTimeMinutes,
      cookTimeMinutes,
      servings,
      published: published ?? true,
      createdAt: now,
      updatedAt: now,
    };
    const result = await col.insertOne(doc);
    return NextResponse.json({
      _id: result.insertedId.toString(),
      ...doc,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Gagal menyimpan resep" },
      { status: 500 }
    );
  }
}
