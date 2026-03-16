"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface CreditsContextValue {
  credits: number | null;
  setCredits: (n: number) => void;
}

const CreditsContext = createContext<CreditsContextValue>({
  credits: null,
  setCredits: () => {},
});

export function CreditsProvider({ initialCredits, children }: { initialCredits: number; children: ReactNode }) {
  const [credits, setCreditsState] = useState<number>(initialCredits);
  const setCredits = useCallback((n: number) => setCreditsState(n), []);
  return (
    <CreditsContext.Provider value={{ credits, setCredits }}>
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  return useContext(CreditsContext);
}
