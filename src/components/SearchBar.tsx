"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  const submit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      router.push(`/resep${params.toString() ? `?${params}` : ""}`);
    },
    [q, router]
  );

  return (
    <form onSubmit={submit} className="flex gap-2 w-full max-w-md">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Cari resep..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9 rounded-xl border-2 bg-background"
          aria-label="Cari resep"
        />
      </div>
      <Button type="submit" size="default" className="rounded-xl shrink-0">
        Cari
      </Button>
    </form>
  );
}
