"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

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
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-card border-2 shadow-2xl scale-110 sm:scale-125 transition-transform">
            <div className="relative">
               <div className="size-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
               <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-5 text-primary" />
            </div>
            <p className="text-sm font-bold text-foreground animate-pulse">Memproses...</p>
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
