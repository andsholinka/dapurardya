"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ShoppingBasket, ArrowRight, Loader2, BrainCircuit, Lock, Crown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RecipeCard } from "@/components/RecipeCard";
import Link from "next/link";

interface SuggestedRecipe {
  _id: string;
  title: string;
  slug: string;
  description: string;
  image?: string;
  images?: string[];
  category: string;
  servings?: number;
  matchScore: number;
  reason: string;
}

interface MemberInfo {
  id: string;
  name: string;
  email: string;
}

interface AIUsageStatus {
  credits: number;
  canUseAI: boolean;
}

export default function FridgePage() {
  const router = useRouter();
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SuggestedRecipe[]>([]);
  const [searched, setSearched] = useState(false);
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [aiStatus, setAIStatus] = useState<AIUsageStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    loadAIStatus();
  }, []);

  async function loadAIStatus() {
    try {
      const res = await fetch("/api/member/ai-status");
      const data = await res.json();
      setMember(data.member ?? null);
      setAIStatus(data.aiStatus ?? null);
    } catch (error) {
      console.error(error);
    } finally {
      setStatusLoading(false);
    }
  }

  const addIngredient = () => {
    const val = ingredientInput.trim();
    if (val && !ingredients.includes(val)) {
      setIngredients([...ingredients, val]);
      setIngredientInput("");
    }
  };

  const removeIngredient = (idx: number) => {
    setIngredients(ingredients.filter((_, i) => i !== idx));
  };

  const clearIngredients = () => {
    setIngredients([]);
    setIngredientInput("");
    setResults([]);
    setSearched(false);
    setRequestError("");
  };

  const handleSuggest = async () => {
    if (ingredients.length === 0) return;
    if (!member) {
      setRequestError("Bahanmu sudah siap. Masuk sebagai member untuk melihat rekomendasi Chef AI.");
      router.push("/member/auth?tab=login");
      return;
    }
    if (aiStatus && !aiStatus.canUseAI) {
      setRequestError("Kuota Chef AI mingguan kamu sudah habis. Upgrade paket berbayar untuk akses lebih banyak.");
      router.push("/member/upgrade");
      return;
    }

    setLoading(true);
    setSearched(true);
    setRequestError("");
    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRequestError(data.error || "Chef AI sedang belum bisa digunakan.");
        setResults([]);
        if (data.aiStatus) setAIStatus(data.aiStatus);
        if (res.status === 401) setMember(null);
        return;
      }
      setResults(data.suggestions || []);
      if (data.aiStatus) setAIStatus(data.aiStatus);
      router.refresh();
    } catch (err) {
      console.error(err);
      setRequestError("Terjadi gangguan saat menghubungi Chef AI. Coba lagi sebentar.");
    } finally {
      setLoading(false);
    }
  };

  const buttonDisabled = loading || ingredients.length === 0 || statusLoading;
  const primaryButtonLabel = !member
    ? "Masuk untuk Gunakan AI"
    : aiStatus && !aiStatus.canUseAI
      ? "Upgrade untuk Lanjut"
      : "Tanyakan Chef AI";

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
      {/* Header Section */}
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
          <Sparkles className="size-3" />
          Powered by Chef AI
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
          Isi Kulkasmu <span className="text-primary">Ada Apa?</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Masukkan bahan-bahan yang tersisa, dan biar Chef AI Dapur Ardya mencarikan resep terbaik untukmu.
        </p>
      </div>

      <div className="max-w-3xl mx-auto mb-8">
        {statusLoading ? (
          <div className="rounded-2xl border-2 border-border/60 bg-card px-5 py-4 text-sm text-muted-foreground">
            Mengecek akses Chef AI...
          </div>
        ) : !member ? (
          <div className="rounded-3xl border-2 border-primary/20 bg-card px-5 py-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Lock className="size-5" />
              </div>
              <div className="flex-1 space-y-2">
                <h2 className="text-lg font-semibold">Chef AI Khusus Member</h2>
                <p className="text-sm text-muted-foreground">
                  Fitur ini memerlukan 1 Credit untuk setiap penggunaan. Member baru akan mendapatkan 3 Credit saat bergabung.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <Link href="/member/auth?tab=login">
                    <Button className="rounded-xl w-full sm:w-auto">Masuk Member</Button>
                  </Link>
                  <Link href="/member/auth?tab=register">
                    <Button variant="outline" className="rounded-xl w-full sm:w-auto">Daftar Member</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Input Section */}
      <div className="bg-card border-2 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden mb-12">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <ShoppingBasket className="size-32" />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addIngredient()}
                placeholder="Masukkan bahan (misal: Telur)"
                className="h-12 md:h-14 rounded-2xl border-2 pl-4 pr-12 text-base md:text-lg shadow-sm w-full"
              />
              <button 
                onClick={addIngredient}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-muted transition-colors"
                title="Tambah Bahan"
              >
                <ArrowRight className="size-5 text-primary" />
              </button>
            </div>
            <Button 
              onClick={handleSuggest} 
              disabled={buttonDisabled}
              className="h-12 md:h-14 px-6 md:px-10 rounded-2xl font-bold shadow-lg w-full sm:w-auto"
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <BrainCircuit className="mr-2 h-5 w-5" />}
              {primaryButtonLabel}
            </Button>
          </div>

          {/* Tags Container */}
          <div className="min-h-[40px]">
            {ingredients.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Belum ada bahan yang ditambahkan...</p>
            ) : (
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-1 flex-wrap gap-2">
                  {ingredients.map((ing, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-xl border-2 bg-muted px-4 py-2 text-sm font-semibold animate-in fade-in zoom-in duration-300"
                    >
                      {ing}
                      <button onClick={() => removeIngredient(i)} className="hover:text-destructive">
                        <span className="text-lg leading-none">&times;</span>
                      </button>
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={clearIngredients}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Trash2 className="size-3.5" />
                  Clear bahan
                </button>
              </div>
            )}
          </div>
          {!member && ingredients.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Bahanmu sudah tersimpan di sini. Masuk sebagai member untuk membuka rekomendasi Chef AI.
            </p>
          )}
          {member && aiStatus && !aiStatus.canUseAI && (
            <p className="text-xs text-muted-foreground">
              Credit kamu sudah habis. Silakan kumpulkan Credit atau Top Up paket untuk akses Chef AI.
            </p>
          )}
          {requestError && <p className="text-sm text-destructive">{requestError}</p>}
        </div>
      </div>

      {/* Results Section */}
      {searched && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <h2 className="text-xl font-bold flex items-center gap-2">
              Rekomendasi Chef <Sparkles className="size-5 text-yellow-500" />
            </h2>
            <div className="h-px flex-1 bg-border" />
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="size-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-8 text-primary" />
              </div>
              <p className="font-semibold text-lg animate-pulse">Chef Ardya sedang meracik ide untukmu...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((recipe) => (
                <div key={recipe._id} className="relative group">
                  <div className="absolute -top-3 -right-3 z-10 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-lg border-2 border-background shadow-lg group-hover:scale-110 transition-transform">
                    {recipe.matchScore}% Match
                  </div>
                  <RecipeCard recipe={recipe} />
                  <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/10 text-xs italic leading-relaxed text-muted-foreground">
                    &quot;{recipe.reason}&quot;
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center space-y-4 bg-muted/30 rounded-3xl border-2 border-dashed">
              <div className="text-4xl">🤔</div>
              <p className="text-muted-foreground">Wah, sepertinya resep yang pas belum ditemukan di database Chef Ardya.</p>
              <Link href="/resep">
                <Button variant="outline" className="rounded-xl">Lihat Semua Resep</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
