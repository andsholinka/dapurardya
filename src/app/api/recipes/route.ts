import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import type { Recipe, RecipeDoc, RecipeInput } from "@/types/recipe";

const COLLECTION = "recipes";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const admin = await getAdminSession();
    const db = await getDb();
    const col = db.collection<RecipeDoc>(COLLECTION);

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

    // Join rating dari koleksi recipe_ratings
    const ids = recipes.map((r) => r._id!.toString());
    const ratings = await db.collection("recipe_ratings").aggregate([
      { $match: { recipeId: { $in: ids } } },
      { $group: { _id: "$recipeId", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]).toArray();
    const ratingMap = new Map(ratings.map((r) => [r._id, { avg: Math.round(r.avg * 10) / 10, count: r.count }]));

    return NextResponse.json(
      recipes.map((r) => {
        const rid = r._id?.toString();
        const rdata = rid ? ratingMap.get(rid) : undefined;
        return {
          ...r,
          _id: rid,
          avgRating: rdata?.avg ?? 0,
          ratingCount: rdata?.count ?? 0,
        };
      })
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
    const { title, description, ingredients, steps, category, image, prepTimeMinutes, cookTimeMinutes, servings, published, memberOnly, tags } = body;
    if (!title?.trim() || !description?.trim() || !Array.isArray(ingredients) || !Array.isArray(steps) || !category?.trim()) {
      return NextResponse.json(
        { error: "Judul, deskripsi, bahan, langkah, dan kategori wajib diisi" },
        { status: 400 }
      );
    }
    const slug = slugify(title);
    const db = await getDb();
    const col = db.collection<RecipeDoc>(COLLECTION);
    const existing = await col.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { error: "Resep dengan judul serupa sudah ada" },
        { status: 400 }
      );
    }
    const now = new Date();
    const doc: Omit<RecipeDoc, "_id"> = {
      title: title.trim(),
      slug,
      description: description.trim(),
      image: image?.trim() || undefined,
      ingredients: ingredients.filter(Boolean),
      steps: steps.filter(Boolean),
      category: category.trim(),
      tags: Array.isArray(tags) ? tags.filter(Boolean) : [],
      prepTimeMinutes,
      cookTimeMinutes,
      servings,
      published: published ?? true,
      memberOnly: memberOnly ?? false,
      createdAt: now,
      updatedAt: now,
    };
    // console.log("[INSERT] Attempting to insert recipe:", JSON.stringify(doc));
    const result = await col.insertOne(doc as RecipeDoc);
    if (!result.insertedId) {
      console.error("[INSERT] Failed: insertedId is null");
      return NextResponse.json({ error: "Gagal menyimpan resep" }, { status: 500 });
    }
    // console.log("[INSERT] Success, insertedId:", result.insertedId.toString());
    return NextResponse.json({
      _id: result.insertedId.toString(),
      ...doc,
    });
  } catch (e) {
    console.error("[INSERT] Exception:", e);
    return NextResponse.json(
      { error: "Gagal menyimpan resep" },
      { status: 500 }
    );
  }
}
