import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { getLegacyRecipeImagesFromGallery, normalizeRecipeGallery } from "@/lib/recipe-gallery";
import type { RecipeDoc, RecipeInput } from "@/types/recipe";
import { ObjectId } from "mongodb";

const COLLECTION = "recipes";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();
    const col = db.collection<RecipeDoc>(COLLECTION);
    const isAdmin = await getAdminSession();
    const byId = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { slug: id };
    const filter = byId as { _id?: ObjectId; slug?: string };
    if (!isAdmin) (filter as Record<string, unknown>).published = true;
    const recipe = await col.findOne(filter);
    if (!recipe) {
      return NextResponse.json({ error: "Resep tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({
      ...recipe,
      _id: recipe._id?.toString(),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Gagal mengambil resep" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const body = (await request.json()) as RecipeInput;
    const { title, description, ingredients, steps, category, image, images, gallery, prepTimeMinutes, cookTimeMinutes, servings, published, memberOnly, tags } = body;
    if (!title?.trim() || !description?.trim() || !Array.isArray(ingredients) || !Array.isArray(steps) || !category?.trim()) {
      return NextResponse.json(
        { error: "Judul, deskripsi, bahan, langkah, dan kategori wajib diisi" },
        { status: 400 }
      );
    }
    const db = await getDb();
    const col = db.collection<RecipeDoc>(COLLECTION);
    const oid = new ObjectId(id);
    const slug = slugify(title);
    const normalizedGallery = normalizeRecipeGallery(gallery, images, image);
    const normalizedImages = getLegacyRecipeImagesFromGallery(normalizedGallery);
    const existingOther = await col.findOne({ slug, _id: { $ne: oid } });
    if (existingOther) {
      return NextResponse.json(
        { error: "Resep dengan judul serupa sudah ada" },
        { status: 400 }
      );
    }
    const now = new Date();
    const update = {
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
      updatedAt: now,
    };
    const result = await col.findOneAndUpdate(
      { _id: oid },
      { $set: update },
      { returnDocument: "after" }
    );
    if (!result) {
      return NextResponse.json({ error: "Resep tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({
      ...result,
      _id: result._id?.toString(),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Gagal memperbarui resep" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const db = await getDb();
    const col = db.collection<RecipeDoc>(COLLECTION);
    const oid = new ObjectId(id);
    const result = await col.deleteOne({ _id: oid });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Resep tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Gagal menghapus resep" },
      { status: 500 }
    );
  }
}
