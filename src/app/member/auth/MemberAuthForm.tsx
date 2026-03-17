"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
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
      // Check if there's a saved redirect path
      const savedRedirect = localStorage.getItem('kulkas_redirect');
      const redirectPath = savedRedirect || "/member";
      
      if (tab === "login") {
        // Cek admin dulu
        const adminRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        if (adminRes.ok) {
          localStorage.removeItem('kulkas_redirect'); // Clear redirect
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
        
        // Clear redirect after successful login
        localStorage.removeItem('kulkas_redirect');
        router.push(redirectPath);
        router.refresh();
      } else {
        const res = await fetch("/api/member/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Gagal mendaftar"); return; }
        
        // Clear redirect after successful register
        localStorage.removeItem('kulkas_redirect');
        router.push(redirectPath);
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
            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs text-muted-foreground"><span className="bg-background px-2">atau</span></div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-xl flex items-center gap-2"
              onClick={() => signIn("google", { callbackUrl: "/member" })}
            >
              <svg className="size-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Masuk dengan Google
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
