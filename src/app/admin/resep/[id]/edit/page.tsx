import Link from "next/link";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { Recipe, RecipeDoc } from "@/types/recipe";
import { buttonVariants } from "@/lib/button-variants";
import { RecipeForm } from "@/components/RecipeForm";
import { cn } from "@/lib/utils";

const COLLECTION = "recipes";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRecipePage({ params }: PageProps) {
  const { id } = await params;
  let recipe: (Recipe & { _id?: string }) | null = null;
  try {
    if (!ObjectId.isValid(id)) {
      notFound();
    }
    const db = await getDb();
    const col = db.collection<RecipeDoc>(COLLECTION);
    const doc = await col.findOne({ _id: new ObjectId(id) });
    if (doc) {
      recipe = { ...doc, _id: doc._id?.toString() };
    }
  } catch {
    recipe = null;
  }
  if (!recipe) notFound();

  return (
    <>
      <Link href="/admin" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-4 -ml-1 inline-block")}>
        ← Kembali ke Daftar Resep
      </Link>
      <h2 className="text-xl font-bold mb-4">Edit: {recipe.title}</h2>
      <RecipeForm
        mode="edit"
        initial={{
          _id: recipe._id,
          title: recipe.title,
          description: recipe.description,
          image: recipe.image,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          category: recipe.category,
          prepTimeMinutes: recipe.prepTimeMinutes,
          cookTimeMinutes: recipe.cookTimeMinutes,
          servings: recipe.servings,
          published: recipe.published,
          memberOnly: recipe.memberOnly,
        }}
      />
    </>
  );
}
