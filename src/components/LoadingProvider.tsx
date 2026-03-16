"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ChefHat } from "lucide-react";

interface LoadingState {
  title: string;
  subtitle: string;
}

interface LoadingContextType {
  setIsLoading: (loading: boolean, state?: Partial<LoadingState>) => void;
}

const DEFAULT_STATE: LoadingState = {
  title: "Dapur Ardya",
  subtitle: "Menyiapkan inspirasi masakan untukmu...",
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingState, setLoadingState] = useState<LoadingState | null>(null);

  useEffect(() => {
    document.body.style.overflow = loadingState ? "hidden" : "unset";
  }, [loadingState]);

  function setIsLoading(loading: boolean, state?: Partial<LoadingState>) {
    if (loading) {
      setLoadingState({ ...DEFAULT_STATE, ...state });
    } else {
      setLoadingState(null);
    }
  }

  return (
    <LoadingContext.Provider value={{ setIsLoading }}>
      {children}
      {loadingState && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex items-center justify-center">
              <div className="size-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute size-9 rounded-full bg-background flex items-center justify-center">
                <ChefHat className="size-5 text-primary" />
              </div>
            </div>
            <div className="text-center space-y-1.5">
              <p className="text-xl font-bold text-foreground">{loadingState.title}</p>
              <p className="text-sm text-muted-foreground animate-pulse">{loadingState.subtitle}</p>
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
