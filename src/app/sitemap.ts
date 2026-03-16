import type { MetadataRoute } from "next";
import { getDb } from "@/lib/mongodb";
import type { RecipeDoc } from "@/types/recipe";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://dapurardya.my.id";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/resep`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  ];

  try {
    const db = await getDb();
    const recipes = await db.collection<RecipeDoc>("recipes")
      .find({ published: true }, { projection: { slug: 1, updatedAt: 1 } })
      .toArray();

    const recipeRoutes: MetadataRoute.Sitemap = recipes.map((r) => ({
      url: `${BASE_URL}/resep/${r.slug}`,
      lastModified: r.updatedAt || new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...recipeRoutes];
  } catch {
    return staticRoutes;
  }
}
