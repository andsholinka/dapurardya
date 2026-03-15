import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Recipe } from "@/types/recipe";
import { cn } from "@/lib/utils";
import { getPrimaryRecipeImageAsset } from "@/lib/recipe-gallery";
import { getRecipeImageStyles } from "@/lib/recipe-images";
import { Lock } from "lucide-react";
import { RatingStars } from "@/components/RatingStars";

const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400' fill='%23fce7f3'%3E%3Crect width='400' height='400' fill='%23fce7f3'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23be185d' font-size='24' font-family='sans-serif'%3E🍳%3C/text%3E%3C/svg%3E";
const blurDataURL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23fce7f3'/%3E%3C/svg%3E";

interface RecipeCardProps {
  recipe: Partial<Recipe> & { _id?: string; title: string; slug: string; description: string; category: string };
  className?: string;
  isMember?: boolean;
}

export function RecipeCard({ recipe, className, isMember = false }: RecipeCardProps) {
  const href = `/resep/${recipe.slug || recipe._id}`;
  const primaryImage = getPrimaryRecipeImageAsset(recipe.gallery, recipe.images, recipe.image);
  const imgSrc = primaryImage?.url || placeholderImage;
  const imageStyle = getRecipeImageStyles(primaryImage);
  const isDataUrl = imgSrc.startsWith("data:");
  const locked = recipe.memberOnly && !isMember;

  const cardContent = (
    <Card className={cn(
      "gap-0 overflow-hidden rounded-2xl border-2 border-border/80 bg-card py-0 shadow-sm transition-all",
      locked ? "cursor-pointer hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5" : "hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5"
    )}>
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {isDataUrl ? (
          <img
            src={imgSrc}
            alt={recipe.title}
            className={cn("object-cover w-full h-full", locked && "blur-[2px]")}
            style={imageStyle}
          />
        ) : (
          <Image
            src={imgSrc}
            alt={recipe.title}
            fill
            className={cn("object-cover", locked && "blur-[2px]")}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL={blurDataURL}
            style={imageStyle}
          />
        )}
        <span className="absolute top-2 left-2 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium px-2 py-0.5">
          {recipe.category}
        </span>
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="flex flex-col items-center gap-1 text-white">
              <Lock className="size-6" />
              <span className="text-xs font-medium">Khusus Member</span>
            </div>
          </div>
        )}
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
        <div className="flex items-center justify-between mt-2 flex-wrap gap-1">
          {recipe.servings != null && (
            <p className="text-xs text-muted-foreground">
              🍽 {recipe.servings} Porsi
            </p>
          )}
          {(recipe.ratingCount ?? 0) > 0 && (
            <RatingStars
              recipeId={recipe._id ?? ""}
              isMember={false}
              compact
              initialAvg={recipe.avgRating ?? 0}
              initialCount={recipe.ratingCount ?? 0}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Link href={href} className={cn("block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl", className)}>
      {cardContent}
    </Link>
  );
}
