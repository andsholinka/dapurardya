"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, RotateCcw, Timer as TimerIcon, ChefHat } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StepTimer } from "./StepTimer";
import { CookMode } from "./CookMode";
import { Play } from "lucide-react";

interface CookingInstructionsProps {
  recipeId: string;
  recipeTitle: string;
  ingredients: string[];
  steps: string[];
}

export function CookingInstructions({ recipeId, recipeTitle, ingredients, steps }: CookingInstructionsProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [isClient, setIsClient] = useState(false);
  const [showCookMode, setShowCookMode] = useState(false);

  // Load progress from localStorage
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem(`cooking_progress_${recipeId}`);
    if (saved) {
      try {
        const { ingredients: savedIngs, steps: savedSteps } = JSON.parse(saved);
        setCheckedIngredients(savedIngs || {});
        setCheckedSteps(savedSteps || {});
      } catch (e) {
        console.error("Failed to load cooking progress", e);
      }
    }
  }, [recipeId]);

  // Save progress to localStorage
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(
      `cooking_progress_${recipeId}`,
      JSON.stringify({ ingredients: checkedIngredients, steps: checkedSteps })
    );
  }, [checkedIngredients, checkedSteps, recipeId, isClient]);

  const toggleIngredient = (idx: number) => {
    setCheckedIngredients((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleStep = (idx: number) => {
    setCheckedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const resetProgress = () => {
    if (confirm("Reset seluruh progress memasak?")) {
      setCheckedIngredients({});
      setCheckedSteps({});
    }
  };

  const parseDuration = (text: string): number | null => {
    // Matches: 10 menit, 5 min, 15 minutes, etc.
    const match = text.match(/(\d+)\s*(menit|min|minutes|minute)/i);
    return match ? parseInt(match[1], 10) : null;
  };

  const allIngredientsChecked = ingredients.length > 0 && 
    ingredients.every((_, i) => checkedIngredients[i]);
  const allStepsChecked = steps.length > 0 && 
    steps.every((_, i) => checkedSteps[i]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-primary">
          <ChefHat className="size-5" />
          <h2 className="font-bold text-lg">Mode Memasak</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            onClick={() => setShowCookMode(true)}
            className="rounded-xl bg-primary text-primary-foreground shadow-sm hover:scale-105 transition-transform"
          >
            <Play className="size-3 mr-1 fill-current" /> Buka Fokus Mode
          </Button>
          {(Object.keys(checkedIngredients).length > 0 || Object.keys(checkedSteps).length > 0) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetProgress}
              className="text-xs text-muted-foreground hover:text-destructive rounded-xl"
            >
              <RotateCcw className="size-3 mr-1" /> Reset
            </Button>
          )}
        </div>
      </div>

      {showCookMode && (
        <CookMode 
          recipeTitle={recipeTitle} 
          steps={steps} 
          onClose={() => setShowCookMode(false)} 
        />
      )}

      {/* Bahan-bahan Checklist */}
      <Card className="rounded-2xl border-2 transition-all hover:border-primary/20">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <h3 className="text-lg font-semibold">Bahan-bahan</h3>
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
            {Object.values(checkedIngredients).filter(Boolean).length} / {ingredients.length}
          </span>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {ingredients.map((ing, i) => (
              <button
                key={i}
                onClick={() => toggleIngredient(i)}
                className={cn(
                  "flex items-start text-left gap-3 p-2.5 rounded-xl transition-all border border-transparent",
                  checkedIngredients[i] 
                    ? "bg-primary/5 text-muted-foreground" 
                    : "hover:bg-muted/50 hover:border-border"
                )}
              >
                <div className="mt-0.5 shrink-0">
                  {checkedIngredients[i] ? (
                    <CheckCircle2 className="size-5 text-primary fill-primary/10" />
                  ) : (
                    <Circle className="size-5 text-muted-foreground/30" />
                  )}
                </div>
                <span className={cn(
                  "text-sm leading-relaxed",
                  checkedIngredients[i] && "line-through opacity-70"
                )}>
                  {ing}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Langkah Memasak Checklist */}
      <Card className="rounded-2xl border-2 transition-all hover:border-primary/20">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <h3 className="text-lg font-semibold">Langkah-langkah</h3>
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
            {Object.values(checkedSteps).filter(Boolean).length} / {steps.length}
          </span>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {steps.map((step, i) => {
              const duration = parseDuration(step);
              return (
                <div key={i} className="flex gap-3">
                  <button
                    onClick={() => toggleStep(i)}
                    className={cn(
                      "mt-0.5 shrink-0 transition-transform active:scale-90",
                      checkedSteps[i] ? "text-primary" : "text-muted-foreground/30"
                    )}
                  >
                    {checkedSteps[i] ? (
                      <CheckCircle2 className="size-6 fill-primary/10" />
                    ) : (
                      <div className="size-6 rounded-full border-2 border-current flex items-center justify-center text-[10px] font-bold">
                        {i + 1}
                      </div>
                    )}
                  </button>
                  
                  <div className="flex-1 space-y-2 pb-4 border-b last:border-0 border-border/50">
                    <p className={cn(
                      "text-sm leading-relaxed transition-all",
                      checkedSteps[i] && "text-muted-foreground line-through opacity-70"
                    )}>
                      {step}
                    </p>
                    
                    {duration && (
                      <StepTimer minutes={duration} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {allStepsChecked && allIngredientsChecked && (
        <div className="p-6 text-center bg-primary/10 rounded-2xl border-2 border-primary/20 animate-in fade-in zoom-in duration-500">
          <p className="text-3xl mb-2">🎉</p>
          <h3 className="font-bold text-primary">Selamat! Masakan Selesai!</h3>
          <p className="text-sm text-muted-foreground">Semoga hasilnya lezat dan memuaskan.</p>
        </div>
      )}
    </div>
  );
}
