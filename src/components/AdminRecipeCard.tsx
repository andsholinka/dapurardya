"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/lib/button-variants";
import type { Recipe } from "@/types/recipe";
import { cn } from "@/lib/utils";
import { getPrimaryRecipeImageAsset } from "@/lib/recipe-gallery";
import { getRecipeImageStyles } from "@/lib/recipe-images";
import { Pencil, Trash2 } from "lucide-react";

const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300' fill='%23fce7f3'%3E%3Crect width='400' height='300' fill='%23fce7f3'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23be185d' font-size='24' font-family='sans-serif'%3E🍳%3C/text%3E%3C/svg%3E";

interface AdminRecipeCardProps {
  recipe: Recipe & { _id?: string };
  className?: string;
}

export function AdminRecipeCard({ recipe, className }: AdminRecipeCardProps) {
  const router = useRouter();
  const primaryImage = getPrimaryRecipeImageAsset(recipe.gallery, recipe.images, recipe.image);
  const imgSrc = primaryImage?.url || placeholderImage;
  const imageStyle = getRecipeImageStyles(primaryImage);
  const isDataUrl = imgSrc.startsWith("data:");

  async function handleDelete() {
    if (!recipe._id) return;
    if (!confirm("Hapus resep ini?")) return;
    const res = await fetch(`/api/recipes/${recipe._id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      alert("Gagal menghapus.");
    }
  }

  return (
    <Card className={cn("gap-0 overflow-hidden rounded-2xl border-2 py-0", className)}>
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {isDataUrl ? (
          <img src={imgSrc} alt={recipe.title} className="object-cover w-full h-full" style={imageStyle} />
        ) : (
          <Image
            src={imgSrc}
            alt={recipe.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 33vw"
            style={imageStyle}
          />
        )}
        <span className="absolute top-2 left-2 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium px-2 py-0.5">
          {recipe.category}
        </span>
        <div className="absolute top-2 right-2 flex gap-1">
          <Link
            href={`/admin/resep/${recipe._id}/edit`}
            className={cn(buttonVariants({ variant: "secondary", size: "icon-sm" }), "rounded-lg bg-white/95")}
          >
            <Pencil className="size-3.5" />
          </Link>
          <Button variant="destructive" size="icon-sm" className="rounded-lg" onClick={handleDelete}>
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
      <CardHeader className="pb-1 pt-3">
        <h3 className="font-semibold text-foreground line-clamp-2">{recipe.title}</h3>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
        {recipe.published === false && (
          <span className="inline-block mt-2 rounded-full bg-muted text-muted-foreground text-xs px-2 py-0.5">
            Draft
          </span>
        )}
      </CardContent>
    </Card>
  );
}
