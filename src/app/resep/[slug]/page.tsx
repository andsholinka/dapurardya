import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getDb } from "@/lib/mongodb";
import { getMemberSession, getAdminSession } from "@/lib/auth";
import type { Recipe, RecipeDoc } from "@/types/recipe";
import { buttonVariants } from "@/lib/button-variants";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ShareButton } from "@/components/ShareButton";
import { BookmarkButton } from "@/components/BookmarkButton";
import { RecipeCard } from "@/components/RecipeCard";

const COLLECTION = "recipes";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://dapurardya.vercel.app";
const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450' fill='%23fce7f3'%3E%3Crect width='800' height='450' fill='%23fce7f3'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23be185d' font-size='64' font-family='sans-serif'%3E🍳%3C/text%3E%3C/svg%3E";
const blurDataURL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='45' viewBox='0 0 80 45'%3E%3Crect width='80' height='45' fill='%23fce7f3'/%3E%3C/svg%3E";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const db = await getDb();
    const doc = await db.collection<RecipeDoc>(COLLECTION).findOne({ slug, published: true });
    if (!doc) return {};
    const title = `${doc.title} – Dapur Ardya`;
    const description = doc.description;
    const image = doc.image && !doc.image.startsWith("data:") ? doc.image : `${BASE_URL}/icon-512.png`;
    const url = `${BASE_URL}/resep/${slug}`;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url,
        siteName: "Dapur Ardya",
        images: [{ url: image, width: 800, height: 600, alt: doc.title }],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
      },
      alternates: { canonical: url },
    };
  } catch {
    return {};
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function RecipeDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let recipe: (Recipe & { _id?: string }) | null = null;
  try {
    const db = await getDb();
    const col = db.collection<RecipeDoc>(COLLECTION);
    const doc = await col.findOne({ slug, published: true });
    if (doc) {
      recipe = { ...doc, _id: doc._id?.toString() };
    }
  } catch {
    recipe = null;
  }
  if (!recipe) notFound();

  // Cek akses member only
  if (recipe.memberOnly) {
    const [member, isAdmin] = await Promise.all([getMemberSession(), getAdminSession()]);
    if (!member && !isAdmin) {
      redirect(`/member/auth?tab=register`);
    }
  }

  const member = await getMemberSession();
  const isAdmin = await getAdminSession();
  const isMember = !!(member || isAdmin);

  // Ambil related recipes — sama kategori atau punya tag yang sama, exclude resep ini
  let relatedRecipes: (Recipe & { _id: string })[] = [];
  try {
    const db = await getDb();
    const col = db.collection<RecipeDoc>(COLLECTION);
    const tagFilter = recipe.tags?.length ? { tags: { $in: recipe.tags } } : {};
    const related = await col
      .find({
        published: true,
        slug: { $ne: slug },
        $or: [{ category: recipe.category }, tagFilter],
      })
      .sort({ updatedAt: -1 })
      .limit(3)
      .toArray();
    relatedRecipes = related.map((r) => ({ ...r, _id: r._id!.toString() })) as (Recipe & { _id: string })[];
  } catch { /* silent */ }

  const imgSrc = recipe.image || placeholderImage;
  const isDataUrl = imgSrc.startsWith("data:");

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 pb-12">
      <Link href="/resep" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-4 -ml-1 inline-block")}>
        ← Semua Resep
      </Link>

      <article>
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-muted mb-6">
          {isDataUrl ? (
            <img
              src={imgSrc}
              alt={recipe.title}
              className="object-cover w-full h-full"
            />
          ) : (
            <Image
              src={imgSrc}
              alt={recipe.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 672px"
              placeholder="blur"
              blurDataURL={blurDataURL}
            />
          )}
          <span className="absolute top-3 left-3 rounded-full bg-primary/90 text-primary-foreground text-sm font-medium px-3 py-1">
            {recipe.category}
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          {recipe.title}
        </h1>
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          {(recipe.prepTimeMinutes != null || recipe.cookTimeMinutes != null || recipe.servings != null) && (
            <p className="text-muted-foreground text-sm">
              ⏱ Persiapan: {recipe.prepTimeMinutes ?? 0} menit · Masak: {recipe.cookTimeMinutes ?? 0} menit
              {recipe.servings != null && ` · Porsi: ${recipe.servings}`}
            </p>
          )}
          <ShareButton title={recipe.title} />
          <BookmarkButton recipeId={recipe._id!} isMember={isMember} />
        </div>
        <p className="text-foreground mb-4">{recipe.description}</p>

        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {recipe.tags.map((tag) => (
              <span key={tag} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <Card className="rounded-2xl border-2 mb-6">
          <CardHeader>
            <h2 className="text-lg font-semibold">Bahan-bahan</h2>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-foreground">
              {recipe.ingredients.map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-2">
          <CardHeader>
            <h2 className="text-lg font-semibold">Langkah</h2>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-3 text-foreground">
              {recipe.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {relatedRecipes.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold mb-1">Resep Serupa</h2>
            <p className="text-sm text-muted-foreground mb-4">Resep lain yang mungkin kamu suka</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedRecipes.map((r) => (
                <RecipeCard key={r._id} recipe={r} isMember={isMember} />
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
