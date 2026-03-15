"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { RotateCcw, Star, X } from "lucide-react";
import { getRecipeImageBounds, getRecipeImageStyles } from "@/lib/recipe-images";
import type { RecipeImageAsset } from "@/types/recipe";

interface RecipeImageEditorCardProps {
  image: RecipeImageAsset;
  index: number;
  isCover: boolean;
  onRemove: () => void;
  onSetCover: () => void;
  onChange: (patch: Partial<RecipeImageAsset>) => void;
}

interface Point {
  x: number;
  y: number;
}

interface GestureState {
  type: "drag" | "pinch";
  startPoint?: Point;
  startOffsetX: number;
  startOffsetY: number;
  startZoom: number;
  startDistance?: number;
  startMidpoint?: Point;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 2.5;

export function RecipeImageEditorCard({
  image,
  index,
  isCover,
  onRemove,
  onSetCover,
  onChange,
}: RecipeImageEditorCardProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const pointersRef = useRef(new Map<number, Point>());
  const gestureRef = useRef<GestureState | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    frameRef.current?.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    syncGestureState();
    setIsInteracting(true);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!pointersRef.current.has(event.pointerId)) return;

    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const frame = frameRef.current;
    const gesture = gestureRef.current;
    if (!frame || !gesture) return;

    const rect = frame.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    if (gesture.type === "pinch" && pointersRef.current.size >= 2) {
      const [first, second] = Array.from(pointersRef.current.values());
      const distance = getDistance(first, second);
      const midpoint = getMidpoint(first, second);
      const nextZoom = clamp((gesture.startZoom ?? 1) * (distance / (gesture.startDistance || distance)), MIN_ZOOM, MAX_ZOOM);
      const nextBounds = getRecipeImageBounds({ ...image, zoom: nextZoom });
      const startBounds = getRecipeImageBounds({ ...image, zoom: gesture.startZoom });
      const startTranslateX = (startBounds.maxTranslateX * (gesture.startOffsetX ?? 0)) / 100;
      const startTranslateY = (startBounds.maxTranslateY * (gesture.startOffsetY ?? 0)) / 100;
      const deltaX = ((midpoint.x - (gesture.startMidpoint?.x ?? midpoint.x)) / rect.width) * 100;
      const deltaY = ((midpoint.y - (gesture.startMidpoint?.y ?? midpoint.y)) / rect.height) * 100;
      const nextTranslateX = clamp(startTranslateX - deltaX, -nextBounds.maxTranslateX, nextBounds.maxTranslateX);
      const nextTranslateY = clamp(startTranslateY - deltaY, -nextBounds.maxTranslateY, nextBounds.maxTranslateY);

      onChange({
        zoom: nextZoom,
        offsetX: nextBounds.maxTranslateX > 0 ? (nextTranslateX / nextBounds.maxTranslateX) * 100 : 0,
        offsetY: nextBounds.maxTranslateY > 0 ? (nextTranslateY / nextBounds.maxTranslateY) * 100 : 0,
      });
      return;
    }

    if (gesture.type === "drag" && gesture.startPoint) {
      const bounds = getRecipeImageBounds(image);
      const startTranslateX = (bounds.maxTranslateX * (gesture.startOffsetX ?? 0)) / 100;
      const startTranslateY = (bounds.maxTranslateY * (gesture.startOffsetY ?? 0)) / 100;
      const deltaX = ((event.clientX - gesture.startPoint.x) / rect.width) * 100;
      const deltaY = ((event.clientY - gesture.startPoint.y) / rect.height) * 100;
      const nextTranslateX = clamp(startTranslateX - deltaX, -bounds.maxTranslateX, bounds.maxTranslateX);
      const nextTranslateY = clamp(startTranslateY - deltaY, -bounds.maxTranslateY, bounds.maxTranslateY);

      onChange({
        offsetX: bounds.maxTranslateX > 0 ? (nextTranslateX / bounds.maxTranslateX) * 100 : 0,
        offsetY: bounds.maxTranslateY > 0 ? (nextTranslateY / bounds.maxTranslateY) * 100 : 0,
      });
    }
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    pointersRef.current.delete(event.pointerId);
    if (frameRef.current?.hasPointerCapture(event.pointerId)) {
      frameRef.current.releasePointerCapture(event.pointerId);
    }
    syncGestureState();
    if (pointersRef.current.size === 0) {
      setIsInteracting(false);
    }
  }

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    const delta = event.deltaY < 0 ? 0.1 : -0.1;
    const nextZoom = clamp((image.zoom ?? 1) + delta, MIN_ZOOM, MAX_ZOOM);
    const bounds = getRecipeImageBounds({ ...image, zoom: nextZoom });
    const currentBounds = getRecipeImageBounds(image);
    const currentTranslateX = (currentBounds.maxTranslateX * (image.offsetX ?? 0)) / 100;
    const currentTranslateY = (currentBounds.maxTranslateY * (image.offsetY ?? 0)) / 100;
    const nextTranslateX = clamp(currentTranslateX, -bounds.maxTranslateX, bounds.maxTranslateX);
    const nextTranslateY = clamp(currentTranslateY, -bounds.maxTranslateY, bounds.maxTranslateY);

    onChange({
      zoom: nextZoom,
      offsetX: bounds.maxTranslateX > 0 ? (nextTranslateX / bounds.maxTranslateX) * 100 : 0,
      offsetY: bounds.maxTranslateY > 0 ? (nextTranslateY / bounds.maxTranslateY) * 100 : 0,
    });
  }

  function resetFraming() {
    onChange({ zoom: 1, offsetX: 0, offsetY: 0 });
  }

  function syncGestureState() {
    const pointers = Array.from(pointersRef.current.values());
    if (pointers.length >= 2) {
      const [first, second] = pointers;
      gestureRef.current = {
        type: "pinch",
        startOffsetX: image.offsetX ?? 0,
        startOffsetY: image.offsetY ?? 0,
        startZoom: image.zoom ?? 1,
        startDistance: getDistance(first, second),
        startMidpoint: getMidpoint(first, second),
      };
      return;
    }

    if (pointers.length === 1) {
      gestureRef.current = {
        type: "drag",
        startPoint: pointers[0],
        startOffsetX: image.offsetX ?? 0,
        startOffsetY: image.offsetY ?? 0,
        startZoom: image.zoom ?? 1,
      };
      return;
    }

    gestureRef.current = null;
  }

  return (
    <div className="rounded-2xl border-2 bg-card/70 p-3 shadow-sm">
      <div
        ref={frameRef}
        className={`relative aspect-square overflow-hidden rounded-xl border bg-muted ${
          isInteracting ? "cursor-grabbing" : "cursor-grab"
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        style={{ touchAction: "none" }}
      >
        <Image
          src={image.url}
          alt={`Preview ${index + 1}`}
          fill
          className="object-cover transition-transform duration-150"
          style={getRecipeImageStyles(image)}
          draggable={false}
          onLoadingComplete={(img) => {
            if (image.width === img.naturalWidth && image.height === img.naturalHeight) return;
            onChange({
              width: img.naturalWidth,
              height: img.naturalHeight,
            });
          }}
        />

        <div className="absolute left-2 top-2 flex items-center gap-2">
          {isCover ? (
            <span className="rounded-full bg-black/70 px-2 py-1 text-[10px] font-medium text-white">
              Cover
            </span>
          ) : (
            <button
              type="button"
              onClick={onSetCover}
              className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium text-foreground shadow-sm transition hover:bg-white"
            >
              <Star className="size-3" />
              Jadikan Cover
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white shadow-lg hover:bg-black/80"
        >
          <X className="size-4" />
        </button>

        <div className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2.5 py-1 text-[10px] text-white">
          Geser foto. Cubit untuk zoom.
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Zoom {(image.zoom ?? 1).toFixed(1)}x
        </p>
        <button
          type="button"
          onClick={resetFraming}
          className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs text-muted-foreground transition hover:bg-muted"
        >
          <RotateCcw className="size-3.5" />
          Reset
        </button>
      </div>
    </div>
  );
}

function getDistance(first: Point, second: Point) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function getMidpoint(first: Point, second: Point) {
  return {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
