import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getDb } from "@/lib/mongodb";
import { getSession } from "@/lib/auth-v2";
import type { Recipe, RecipeDoc } from "@/types/recipe";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import { ShareButton } from "@/components/ShareButton";
import { BookmarkButton } from "@/components/BookmarkButton";
import { RecipeCard } from "@/components/RecipeCard";
import { RecipeImageCarousel } from "@/components/RecipeImageCarousel";
import { RatingStars } from "@/components/RatingStars";
import { CookingInstructions } from "@/components/CookingInstructions";
import { getPrimaryRecipeImageAsset, normalizeRecipeGallery } from "@/lib/recipe-gallery";

const COLLECTION = "recipes";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://dapurardya.vercel.app";
const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800' fill='%23fce7f3'%3E%3Crect width='800' height='800' fill='%23fce7f3'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23be185d' font-size='64' font-family='sans-serif'%3E🍳%3C/text%3E%3C/svg%3E";
const blurDataURL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23fce7f3'/%3E%3C/svg%3E";

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
    const primaryImage = getPrimaryRecipeImageAsset(doc.gallery, doc.images, doc.image);
    const image = primaryImage?.url && !primaryImage.url.startsWith("data:") ? primaryImage.url : `${BASE_URL}/icon-512.png`;
    const url = `${BASE_URL}/resep/${slug}`;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url,
        siteName: "Dapur Ardya",
        images: [{ url: image, width: 800, height: 800, alt: doc.title }],
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
    const session = await getSession();
    if (!session) {
      redirect(`/member/auth?tab=register`);
    }
  }

  const session = await getSession();
  const isMember = !!session;

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

  const recipeImages = normalizeRecipeGallery(recipe.gallery, recipe.images, recipe.image);
  const primaryImage = recipeImages[0]?.url && !recipeImages[0].url.startsWith("data:") ? recipeImages[0].url : `${BASE_URL}/icon-512.png`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.description,
    image: [primaryImage],
    url: `${BASE_URL}/resep/${slug}`,
    author: { "@type": "Organization", name: "Dapur Ardya" },
    datePublished: recipe.createdAt ? new Date(recipe.createdAt).toISOString() : undefined,
    dateModified: recipe.updatedAt ? new Date(recipe.updatedAt).toISOString() : undefined,
    recipeCategory: recipe.category,
    keywords: recipe.tags?.join(", "),
    recipeYield: recipe.servings ? `${recipe.servings} porsi` : undefined,
    prepTime: recipe.prepTimeMinutes ? `PT${recipe.prepTimeMinutes}M` : undefined,
    cookTime: recipe.cookTimeMinutes ? `PT${recipe.cookTimeMinutes}M` : undefined,
    totalTime: recipe.prepTimeMinutes && recipe.cookTimeMinutes
      ? `PT${recipe.prepTimeMinutes + recipe.cookTimeMinutes}M`
      : undefined,
    recipeIngredient: recipe.ingredients,
    recipeInstructions: recipe.steps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text: step,
    })),
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 pb-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link href="/resep" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-4 -ml-1 inline-block")}>
        ← Semua Resep
      </Link>

      <article>
        <div className="mb-6">
          <RecipeImageCarousel
            images={recipeImages}
            title={recipe.title}
            placeholderImage={placeholderImage}
            blurDataURL={blurDataURL}
            categoryLabel={recipe.category}
          />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          {recipe.title}
        </h1>
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          {recipe.servings != null && (
            <p className="text-muted-foreground text-sm font-medium flex items-center gap-1.5">
              <span>🍽</span> {recipe.servings} Porsi
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

        <div className="mb-6">
          <RatingStars recipeId={recipe._id!} isMember={isMember} />
        </div>

        <div className="mt-8 mb-6">
          <CookingInstructions 
            recipeId={recipe._id!} 
            recipeTitle={recipe.title}
            ingredients={recipe.ingredients} 
            steps={recipe.steps} 
          />
        </div>


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
