"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getRecipeImageStyles } from "@/lib/recipe-images";
import type { RecipeImageAsset } from "@/types/recipe";

interface RecipeImageCarouselProps {
  images: RecipeImageAsset[];
  title: string;
  placeholderImage: string;
  blurDataURL: string;
  categoryLabel?: string;
}

export function RecipeImageCarousel({
  images,
  title,
  placeholderImage,
  blurDataURL,
  categoryLabel,
}: RecipeImageCarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = images.length > 0 ? images : [{ url: placeholderImage, zoom: 1, offsetX: 0, offsetY: 0 }];

  function scrollToIndex(index: number) {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const nextIndex = Math.max(0, Math.min(index, slides.length - 1));
    viewport.scrollTo({
      left: nextIndex * viewport.clientWidth,
      behavior: "smooth",
    });
    setActiveIndex(nextIndex);
  }

  function handleScroll() {
    const viewport = viewportRef.current;
    if (!viewport || viewport.clientWidth === 0) return;

    const nextIndex = Math.round(viewport.scrollLeft / viewport.clientWidth);
    if (nextIndex !== activeIndex) {
      setActiveIndex(nextIndex);
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted">
        <div
          ref={viewportRef}
          className="flex h-full overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={handleScroll}
        >
          {slides.map((image, index) => {
            const isDataUrl = image.url.startsWith("data:");
            const imageStyle = getRecipeImageStyles(image);

            return (
              <div key={`${image.url}-${index}`} className="relative h-full min-w-full snap-center">
                {isDataUrl ? (
                  <img
                    src={image.url}
                    alt={`${title} ${index + 1}`}
                    className="h-full w-full object-cover"
                    style={imageStyle}
                  />
                ) : (
                  <Image
                    src={image.url}
                    alt={`${title} ${index + 1}`}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, 672px"
                    placeholder="blur"
                    blurDataURL={blurDataURL}
                    style={imageStyle}
                  />
                )}
              </div>
            );
          })}
        </div>

        {categoryLabel && (
          <span className="absolute left-3 top-3 rounded-full bg-primary/90 px-3 py-1 text-sm font-medium text-primary-foreground">
            {categoryLabel}
          </span>
        )}

        {slides.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Foto sebelumnya"
              onClick={() => scrollToIndex(activeIndex - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white transition hover:bg-black/70"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Foto berikutnya"
              onClick={() => scrollToIndex(activeIndex + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white transition hover:bg-black/70"
            >
              <ChevronRight className="size-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/45 px-3 py-2 backdrop-blur-sm">
              {slides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Lihat foto ${index + 1}`}
                  onClick={() => scrollToIndex(index)}
                  className={`h-2 w-2 rounded-full transition ${
                    index === activeIndex ? "bg-white" : "bg-white/45"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {slides.length > 1 && (
        <p className="text-center text-xs text-muted-foreground">
          Geser ke samping untuk melihat semua foto
        </p>
      )}
    </div>
  );
}
