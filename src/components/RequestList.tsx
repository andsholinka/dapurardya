"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { RecipeRequest } from "@/types/recipe-request";
import { Button } from "@/components/ui/button";
import { Check, Trash2 } from "lucide-react";

export function RequestList({ requests }: { requests: RecipeRequest[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function markDone(id: string) {
    setLoading(id + "-done");
    await fetch(`/api/requests/${id}`, { method: "PATCH" });
    setLoading(null);
    router.refresh();
  }

  async function remove(id: string) {
    setLoading(id + "-del");
    await fetch(`/api/requests/${id}`, { method: "DELETE" });
    setLoading(null);
    router.refresh();
  }

  if (requests.length === 0) {
    return <p className="text-muted-foreground text-center py-6">Belum ada request masuk.</p>;
  }

  return (
    <ul className="space-y-3">
      {requests.map((r) => (
        <li
          key={r._id}
          className={`flex items-start justify-between gap-4 p-4 rounded-xl border-2 ${
            r.status === "done" ? "opacity-50" : ""
          }`}
        >
          <div className="space-y-0.5 min-w-0">
            <p className="font-medium truncate">
              {r.recipeName}
              {r.status === "done" && (
                <span className="ml-2 text-xs text-green-600 font-normal">✓ selesai</span>
              )}
            </p>
            <p className="text-sm text-muted-foreground">dari: {r.name}</p>
            {r.message && <p className="text-sm italic text-muted-foreground">"{r.message}"</p>}
            <p className="text-xs text-muted-foreground">
              {new Date(r.createdAt).toLocaleDateString("id-ID", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {r.status === "pending" && (
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl"
                disabled={loading === r._id + "-done"}
                onClick={() => markDone(r._id!)}
              >
                <Check className="size-4 mr-1" /> Selesai
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="rounded-xl text-destructive hover:text-destructive"
              disabled={loading === r._id + "-del"}
              onClick={() => remove(r._id!)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
