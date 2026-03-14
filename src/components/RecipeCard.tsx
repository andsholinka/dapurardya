import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Recipe } from "@/types/recipe";
import { cn } from "@/lib/utils";

const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300' fill='%23fce7f3'%3E%3Crect width='400' height='300' fill='%23fce7f3'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23be185d' font-size='24' font-family='sans-serif'%3E🍳%3C/text%3E%3C/svg%3E";

interface RecipeCardProps {
  recipe: Recipe & { _id?: string };
  className?: string;
}

export function RecipeCard({ recipe, className }: RecipeCardProps) {
  const href = `/resep/${recipe.slug || recipe._id}`;
  const imgSrc = recipe.image || placeholderImage;
  const isDataUrl = imgSrc.startsWith("data:");

  return (
    <Link href={href} className={cn("block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl", className)}>
      <Card className="overflow-hidden rounded-2xl border-2 border-border/80 bg-card shadow-sm transition-all hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
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
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          )}
          <span className="absolute top-2 left-2 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium px-2 py-0.5">
            {recipe.category}
          </span>
        </div>
        <CardHeader className="pb-1 pt-3">
          <h3 className="font-semibold text-foreground line-clamp-2 leading-tight">
            {recipe.title}
          </h3>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {recipe.description}
          </p>
          {(recipe.prepTimeMinutes != null || recipe.cookTimeMinutes != null) && (
            <p className="text-xs text-muted-foreground mt-2">
              ⏱ {(recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0)} menit
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
