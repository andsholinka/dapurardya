"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MemberAuthForm({ defaultTab }: { defaultTab: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"login" | "register">(defaultTab);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function switchTab(t: "login" | "register") {
    setTab(t);
    setError("");
    router.replace(`/member/auth?tab=${t}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (tab === "login") {
        // Cek admin dulu
        const adminRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        if (adminRes.ok) {
          router.push("/admin");
          router.refresh();
          return;
        }
        // Bukan admin, coba login member
        const memberRes = await fetch("/api/member/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        const data = await memberRes.json();
        if (!memberRes.ok) { setError(data.error || "Email atau password salah"); return; }
        router.push("/member");
        router.refresh();
      } else {
        const res = await fetch("/api/member/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Gagal mendaftar"); return; }
        router.push("/member");
        router.refresh();
      }
    } catch {
      setError("Gagal terhubung. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-12">
      <Card className="rounded-2xl border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-center">Dapur Ardya</CardTitle>
          {/* Tabs */}
          <div className="flex rounded-xl border-2 overflow-hidden mt-2">
            <button
              className={`flex-1 py-2 text-sm font-medium transition-colors ${tab === "login" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
              onClick={() => switchTab("login")}
            >
              Masuk
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium transition-colors ${tab === "register" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
              onClick={() => switchTab("register")}
            >
              Daftar
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "register" && (
              <div>
                <Label htmlFor="name">Nama</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nama kamu" className="mt-1 rounded-xl border-2" required />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@example.com" className="mt-1 rounded-xl border-2" autoComplete="email" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="••••••••" className="mt-1 rounded-xl border-2" autoComplete={tab === "login" ? "current-password" : "new-password"} required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full rounded-xl" disabled={loading}>
              {loading ? "Memproses…" : tab === "login" ? "Masuk" : "Daftar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
