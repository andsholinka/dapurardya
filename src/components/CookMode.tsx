"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Timer as TimerIcon, Volume2, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StepTimer } from "./StepTimer";

interface CookModeProps {
  recipeTitle: string;
  steps: string[];
  onClose: () => void;
}

export function CookMode({ recipeTitle, steps, onClose }: CookModeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [wakeLock, setWakeLock] = useState<any>(null);

  // Request Wake Lock to keep screen on
  useEffect(() => {
    async function requestWakeLock() {
      if ("wakeLock" in navigator) {
        try {
          const wl = await (navigator as any).wakeLock.request("screen");
          setWakeLock(wl);
          console.log("Wake Lock active");
        } catch (err: any) {
          console.error(`${err.name}, ${err.message}`);
        }
      }
    }
    requestWakeLock();
    return () => {
      wakeLock?.release().then(() => setWakeLock(null));
    };
  }, []);

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  const parseDuration = (text: string): number | null => {
    const match = text.match(/(\d+)\s*(menit|min|minutes|minute)/i);
    return match ? parseInt(match[1], 10) : null;
  };

  const currentStepText = steps[currentStep];
  const duration = parseDuration(currentStepText);

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex-1">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-0.5">Cook Mode</p>
          <h2 className="text-sm font-semibold truncate max-w-[200px] sm:max-w-md">{recipeTitle}</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="size-6" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-muted">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-12 sm:py-20 flex flex-col items-center justify-start sm:justify-center text-center">
        <div className="w-full max-w-2xl space-y-8 sm:space-y-12">
          {/* Step Indicator */}
          <div className="inline-flex items-center justify-center size-14 sm:size-20 rounded-full bg-primary text-primary-foreground text-xl sm:text-3xl font-black shadow-lg shadow-primary/20">
            {currentStep + 1}
          </div>

          {/* Step Text */}
          <p className="text-2xl sm:text-4xl md:text-5xl font-medium leading-tight sm:leading-tight text-foreground px-2">
            {currentStepText}
          </p>

          {/* Dynamic Timer integration */}
          {duration && (
            <div className="flex justify-center scale-125 sm:scale-150 py-4">
              <StepTimer minutes={duration} />
            </div>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="p-6 sm:p-10 border-t bg-card grid grid-cols-2 gap-4 sm:gap-8 max-w-4xl mx-auto w-full">
        <Button 
          variant="outline" 
          size="lg" 
          onClick={prevStep}
          disabled={currentStep === 0}
          className="h-16 sm:h-20 rounded-2xl text-lg font-bold border-2"
        >
          <ChevronLeft className="size-6 mr-2" /> Kembali
        </Button>
        <Button 
          size="lg" 
          onClick={nextStep}
          disabled={currentStep === steps.length - 1}
          className="h-16 sm:h-20 rounded-2xl text-lg font-bold"
        >
          {currentStep === steps.length - 1 ? "Selesai!" : "Lanjut"} <ChevronRight className="size-6 ml-2" />
        </Button>
      </div>

      {/* Shortcuts / Info */}
      <div className="hidden sm:flex justify-center pb-4 text-[10px] text-muted-foreground gap-4 uppercase tracking-tighter">
        <span>Gunakan tombol panah untuk navigasi</span>
        <span>•</span>
        <span>Layar akan tetap menyala secara otomatis</span>
      </div>
    </div>
  );
}
