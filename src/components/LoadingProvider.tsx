"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ChefHat, UtensilsCrossed, Soup, Loader2 } from "lucide-react";

interface LoadingContextType {
  setIsLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  // Prevent scroll when loading
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isLoading]);

  return (
    <LoadingContext.Provider value={{ setIsLoading }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-6">
            <div className="relative flex items-center justify-center">
              {/* Outer Glow */}
              <div className="absolute inset-0 size-24 bg-primary/20 rounded-full blur-2xl animate-pulse" />
              
              {/* Spinning Ring */}
              <div className="size-20 rounded-full border-4 border-dashed border-primary/30 animate-[spin_4s_linear_infinite]" />
              
              {/* Content Icons */}
              <div className="absolute flex items-center justify-center">
                <div className="relative size-12 flex items-center justify-center">
                   <div className="absolute inset-0 animate-[bounce_2s_ease-in-out_infinite]">
                      <ChefHat className="size-12 text-primary" />
                   </div>
                   <UtensilsCrossed className="absolute -right-8 -top-2 size-6 text-primary/40 animate-[pulse_1.5s_ease-in-out_infinite]" />
                   <Soup className="absolute -left-8 -bottom-2 size-6 text-primary/40 animate-[pulse_1.5s_ease-in-out_infinite_delay-300ms]" />
                </div>
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-xl font-black tracking-tight text-foreground">Chef AI sedang beraksi</p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-sm text-muted-foreground">Menyiapkan inspirasi dapur...</p>
                <div className="flex gap-1">
                  <div className="size-1.5 rounded-full bg-primary animate-bounce" />
                  <div className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                  <div className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export function useGlobalLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useGlobalLoading must be used within a LoadingProvider");
  }
  return context;
}
