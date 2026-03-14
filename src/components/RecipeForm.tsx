"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { RecipeInput } from "@/types/recipe";
import { Plus, Trash2, ImagePlus, X } from "lucide-react";

interface RecipeFormProps {
  initial?: Partial<RecipeInput> & { _id?: string };
  mode: "new" | "edit";
}

const defaultRecipe: RecipeInput = {
  title: "",
  description: "",
  image: "",
  ingredients: [""],
  steps: [""],
  category: "Makanan",
  prepTimeMinutes: undefined,
  cookTimeMinutes: undefined,
  servings: undefined,
  published: true,
  memberOnly: false,
};

export function RecipeForm({ initial, mode }: RecipeFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<RecipeInput>(() => ({
    ...defaultRecipe,
    ...initial,
    ingredients: initial?.ingredients?.length ? initial.ingredients : [""],
    steps: initial?.steps?.length ? initial.steps : [""],
  }));

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal upload");
      setForm((f) => ({ ...f, image: data.url }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function addIngredient() {
    setForm((f) => ({ ...f, ingredients: [...f.ingredients, ""] }));
  }
  function removeIngredient(i: number) {
    setForm((f) => ({
      ...f,
      ingredients: f.ingredients.filter((_, idx) => idx !== i),
    }));
  }
  function setIngredient(i: number, v: string) {
    setForm((f) => {
      const next = [...f.ingredients];
      next[i] = v;
      return { ...f, ingredients: next };
    });
  }

  function addStep() {
    setForm((f) => ({ ...f, steps: [...f.steps, ""] }));
  }
  function removeStep(i: number) {
    setForm((f) => ({
      ...f,
      steps: f.steps.filter((_, idx) => idx !== i),
    }));
  }
  function setStep(i: number, v: string) {
    setForm((f) => {
      const next = [...f.steps];
      next[i] = v;
      return { ...f, steps: next };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const payload = {
      ...form,
      ingredients: form.ingredients.filter(Boolean),
      steps: form.steps.filter(Boolean),
    };
    if (payload.ingredients.length === 0 || payload.steps.length === 0) {
      setError("Minimal satu bahan dan satu langkah.");
      setSaving(false);
      return;
    }
    try {
      const url = mode === "edit" && initial?._id ? `/api/recipes/${initial._id}` : "/api/recipes";
      const method = mode === "edit" ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan");
        setSaving(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Gagal menyimpan. Coba lagi.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="rounded-2xl border-2">
        <CardHeader>
          <h2 className="font-semibold">Informasi Resep</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Judul</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1 rounded-xl border-2"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="mt-1 rounded-xl border-2 min-h-[80px]"
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Kategori</Label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="mt-1 w-full rounded-xl border-2 border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Makanan">Makanan</option>
              <option value="Minuman">Minuman</option>
              <option value="Cemilan">Cemilan</option>
            </select>
          </div>
          <div>
            <Label>Gambar (opsional)</Label>
            <div className="mt-1 space-y-2">
              {form.image ? (
                <div className="relative w-full h-48 rounded-xl overflow-hidden border-2">
                  <Image src={form.image} alt="Preview" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, image: "" }))}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                  <ImagePlus className="size-6 text-muted-foreground mb-1" />
                  <span className="text-sm text-muted-foreground">
                    {uploading ? "Mengupload..." : "Klik untuk pilih gambar"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="prep">Persiapan (menit)</Label>
              <Input
                id="prep"
                type="number"
                min={0}
                value={form.prepTimeMinutes ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, prepTimeMinutes: e.target.value ? Number(e.target.value) : undefined }))}
                className="mt-1 rounded-xl border-2"
              />
            </div>
            <div>
              <Label htmlFor="cook">Memasak (menit)</Label>
              <Input
                id="cook"
                type="number"
                min={0}
                value={form.cookTimeMinutes ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, cookTimeMinutes: e.target.value ? Number(e.target.value) : undefined }))}
                className="mt-1 rounded-xl border-2"
              />
            </div>
            <div>
              <Label htmlFor="servings">Porsi</Label>
              <Input
                id="servings"
                type="number"
                min={1}
                value={form.servings ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, servings: e.target.value ? Number(e.target.value) : undefined }))}
                className="mt-1 rounded-xl border-2"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={form.published}
              onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
              className="rounded border-input"
            />
            <Label htmlFor="published">Publikasikan (tampil di website)</Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="memberOnly"
              checked={form.memberOnly ?? false}
              onChange={(e) => setForm((f) => ({ ...f, memberOnly: e.target.checked }))}
              className="rounded border-input"
            />
            <Label htmlFor="memberOnly">Khusus Member (detail hanya untuk member terdaftar)</Label>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="font-semibold">Bahan-bahan</h2>
          <Button type="button" variant="outline" size="sm" onClick={addIngredient} className="rounded-xl">
            <Plus className="size-4 mr-1" /> Tambah
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {form.ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={ing}
                onChange={(e) => setIngredient(i, e.target.value)}
                placeholder={`Bahan ${i + 1}`}
                className="rounded-xl border-2"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeIngredient(i)}
                disabled={form.ingredients.length <= 1}
                className="shrink-0 rounded-xl"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="font-semibold">Langkah</h2>
          <Button type="button" variant="outline" size="sm" onClick={addStep} className="rounded-xl">
            <Plus className="size-4 mr-1" /> Tambah
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {form.steps.map((step, i) => (
            <div key={i} className="flex gap-2">
              <span className="flex items-center justify-center w-8 h-9 rounded-lg bg-muted text-sm font-medium shrink-0">
                {i + 1}
              </span>
              <Textarea
                value={step}
                onChange={(e) => setStep(i, e.target.value)}
                placeholder={`Langkah ${i + 1}`}
                className="rounded-xl border-2 min-h-[60px] flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeStep(i)}
                disabled={form.steps.length <= 1}
                className="shrink-0 rounded-xl"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {error && <p className="text-destructive text-sm">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={saving} className="rounded-xl">
          {saving ? "Menyimpan…" : mode === "edit" ? "Simpan Perubahan" : "Simpan Resep"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-xl">
          Batal
        </Button>
      </div>
    </form>
  );
}
