"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function RequestForm() {
  const [form, setForm] = useState({ name: "", recipeName: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim");
      setSuccess(true);
      setForm({ name: "", recipeName: "", message: "" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card className="rounded-2xl border-2">
        <CardContent className="py-8 text-center space-y-2">
          <p className="text-2xl">🎉</p>
          <p className="font-semibold">Request terkirim!</p>
          <p className="text-muted-foreground text-sm">Ardya akan segera memasak resep pilihanmu.</p>
          <Button variant="outline" className="rounded-xl mt-2" onClick={() => setSuccess(false)}>
            Request lagi
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-2">
      <CardHeader>
        <h2 className="font-semibold text-lg">Request Resep</h2>
        <p className="text-muted-foreground text-sm">Ada resep yang ingin kamu lihat? Minta ke Ardya!</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="req-name">Nama kamu</Label>
            <Input
              id="req-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Contoh: Budi"
              className="mt-1 rounded-xl border-2"
              required
            />
          </div>
          <div>
            <Label htmlFor="req-recipe">Resep yang diminta</Label>
            <Input
              id="req-recipe"
              value={form.recipeName}
              onChange={(e) => setForm((f) => ({ ...f, recipeName: e.target.value }))}
              placeholder="Contoh: Rendang Padang"
              className="mt-1 rounded-xl border-2"
              required
            />
          </div>
          <div>
            <Label htmlFor="req-message">Pesan tambahan (opsional)</Label>
            <Textarea
              id="req-message"
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="Misal: versi pedas ya kak!"
              className="mt-1 rounded-xl border-2 min-h-[70px]"
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full rounded-xl">
            {loading ? "Mengirim..." : "Kirim Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
