import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getSession, isAdmin } from "@/lib/auth-v2";
import { slugify } from "@/lib/slug";
import { getLegacyRecipeImagesFromGallery, normalizeRecipeGallery } from "@/lib/recipe-gallery";
import type { RecipeDoc, RecipeInput } from "@/types/recipe";
import { logger, apiError } from "@/lib/logger";

const COLLECTION = "recipes";

const PAGE_SIZE = 12;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const session = await getSession();
    const admin = await isAdmin(session);
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

    const [total, recipes] = await Promise.all([
      col.countDocuments(filter),
      col.find(filter).sort({ updatedAt: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).toArray(),
    ]);

    // Join rating dari koleksi recipe_ratings
    const ids = recipes.map((r) => r._id!.toString());
    const ratings = await db.collection("recipe_ratings").aggregate([
      { $match: { recipeId: { $in: ids } } },
      { $group: { _id: "$recipeId", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]).toArray();
    const ratingMap = new Map(ratings.map((r) => [r._id, { avg: Math.round(r.avg * 10) / 10, count: r.count }]));

    return NextResponse.json({
      recipes: recipes.map((r) => {
        const rid = r._id?.toString();
        const rdata = rid ? ratingMap.get(rid) : undefined;
        return {
          ...r,
          _id: rid,
          avgRating: rdata?.avg ?? 0,
          ratingCount: rdata?.count ?? 0,
        };
      }),
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total,
        totalPages: Math.ceil(total / PAGE_SIZE),
        hasNext: page * PAGE_SIZE < total,
        hasPrev: page > 1,
      },
    });
  } catch (e) { return apiError("RECIPES_GET", e, "Gagal mengambil resep"); }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = (await request.json()) as RecipeInput;
    const { title, description, ingredients, steps, category, image, images, gallery, prepTimeMinutes, cookTimeMinutes, servings, published, memberOnly, tags } = body;
    if (!title?.trim() || !description?.trim() || !Array.isArray(ingredients) || !Array.isArray(steps) || !category?.trim()) {
      return NextResponse.json(
        { error: "Judul, deskripsi, bahan, langkah, dan kategori wajib diisi" },
        { status: 400 }
      );
    }
    const slug = slugify(title);
    const normalizedGallery = normalizeRecipeGallery(gallery, images, image);
    const normalizedImages = getLegacyRecipeImagesFromGallery(normalizedGallery);
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
      image: normalizedImages[0],
      images: normalizedImages,
      gallery: normalizedGallery,
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
    const result = await col.insertOne(doc as RecipeDoc);
    if (!result.insertedId) {
      logger.error("insertedId is null", "RECIPE_INSERT");
      return NextResponse.json({ error: "Gagal menyimpan resep" }, { status: 500 });
    }
    return NextResponse.json({ _id: result.insertedId.toString(), ...doc });
  } catch (e) { return apiError("RECIPE_INSERT", e, "Gagal menyimpan resep"); }
}
