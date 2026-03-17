"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ShoppingBasket, Loader2, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [fromAI, setFromAI] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [aiStatus, setAIStatus] = useState<AIUsageStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    loadAIStatus();
    
    // Restore ingredients from localStorage after login
    const savedIngredients = localStorage.getItem('kulkas_ingredients');
    if (savedIngredients) {
      try {
        setIngredientInput(savedIngredients);
        localStorage.removeItem('kulkas_ingredients'); // Clear after restore
      } catch (error) {
        // Silent fail
      }
    }
  }, []);

  async function loadAIStatus() {
    try {
      const res = await fetch("/api/member/ai-status");
      const data = await res.json();
      setMember(data.member ?? null);
      setAIStatus(data.aiStatus ?? null);
    } catch (error) {
      // silent — status tidak kritis
    } finally {
      setStatusLoading(false);
    }
  }

  // Parse ingredients from textarea input
  const parseIngredients = (text: string): string[] => {
    // Split by newline or comma, trim, filter empty
    return text
      .split(/[\n,]+/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  };

  const clearIngredients = () => {
    setIngredientInput("");
    setIngredients([]);
    setResults([]);
    setSearched(false);
    setRequestError("");
  };

  const handleSuggest = async () => {
    // Parse ingredients from input
    const parsedIngredients = parseIngredients(ingredientInput);
    
    if (parsedIngredients.length === 0) {
      setRequestError("Masukkan minimal 1 bahan untuk mendapatkan rekomendasi.");
      return;
    }
    
    setIngredients(parsedIngredients);
    
    if (!member) {
      // Save ingredients to localStorage before redirecting to login
      localStorage.setItem('kulkas_ingredients', ingredientInput);
      localStorage.setItem('kulkas_redirect', '/kulkas');
      
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
        body: JSON.stringify({ ingredients: parsedIngredients }),
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
      setFromAI(data.fromAI ?? false);
      setFromCache(data.fromCache ?? false);
      if (data.aiStatus) setAIStatus(data.aiStatus);
      router.refresh();
    } catch (err) {
      setRequestError("Chef AI sedang tidak bisa dihubungi. Rekomendasi ditampilkan berdasarkan kecocokan bahan.");
    } finally {
      setLoading(false);
    }
  };

  const buttonDisabled = loading || ingredientInput.trim().length === 0 || statusLoading;
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
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
          <Link href="/kulkas/scanner">
            <Button className="rounded-full bg-gradient-to-r from-primary via-[#FFA9B9] to-accent hover:opacity-90 shadow-lg hover:shadow-xl transition-all gap-2 px-8 py-5 text-base font-bold text-white">
              <Sparkles className="size-4 animate-pulse" />
              Scan Kulkas Pakai AI
            </Button>
          </Link>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-card border-2 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden mb-12">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <ShoppingBasket className="size-32" />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">
              Bahan-bahan yang Tersedia
            </label>
            <textarea
              value={ingredientInput}
              onChange={(e) => setIngredientInput(e.target.value)}
              placeholder="Contoh: Telur, Susu, Keju, Sosis..."
              className="w-full h-32 rounded-2xl border-2 px-4 py-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="text-xs text-muted-foreground">
              💡 Tips: Pisahkan setiap bahan dengan enter atau koma. Contoh: Telur, Susu, Keju
            </p>
          </div>

          <Button 
            onClick={handleSuggest} 
            disabled={buttonDisabled}
            className="h-12 md:h-14 px-6 md:px-10 rounded-2xl font-bold shadow-lg w-full"
          >
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ChefHat className="mr-2 h-5 w-5" />}
            {primaryButtonLabel}
          </Button>

          {/* Preview Bahan */}
          {ingredients.length > 0 && (
            <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  Bahan yang akan dianalisis ({ingredients.length}):
                </p>
                <button
                  type="button"
                  onClick={clearIngredients}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  Clear semua
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ing, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-background border px-3 py-1 text-sm font-medium"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {!member && ingredientInput.trim().length > 0 && (
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
              Rekomendasi Chef <Sparkles className="size-5 text-accent" />
            </h2>
            <div className="h-px flex-1 bg-border" />
          </div>

          {!loading && searched && !fromAI && results.length > 0 && (
            <div className="rounded-xl border border-accent/40 bg-accent/20 px-4 py-3 text-sm text-foreground flex items-center gap-2">
              <span>⚡</span>
              <span>Chef AI sedang tidak tersedia. Rekomendasi ini berdasarkan kecocokan bahan — <strong>kredit tidak dipotong</strong>.</span>
            </div>
          )}

          {!loading && searched && fromAI && fromCache && results.length > 0 && (
            <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground flex items-center gap-2">
              <span>⚡</span>
              <span>Rekomendasi dari cache Chef AI — <strong>kredit tidak dipotong</strong>.</span>
            </div>
          )}

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="relative flex items-center justify-center">
                <div className="size-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <div className="absolute size-9 rounded-full bg-background flex items-center justify-center">
                  <ChefHat className="size-5 text-primary" />
                </div>
              </div>
              <p className="font-semibold text-lg animate-pulse text-center">Chef Ardya sedang meracik ide untukmu...</p>
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
