"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RecipeImageEditorCard } from "@/components/RecipeImageEditorCard";
import {
  getLegacyRecipeImagesFromGallery,
  normalizeRecipeGallery,
} from "@/lib/recipe-gallery";
import type { RecipeImageAsset, RecipeInput } from "@/types/recipe";
import { Trash2, ImagePlus, X } from "lucide-react";

interface RecipeFormProps {
  initial?: Partial<RecipeInput> & { _id?: string };
  mode: "new" | "edit";
}

const defaultRecipe: RecipeInput = {
  title: "",
  description: "",
  image: "",
  images: [],
  gallery: [],
  ingredients: [""],
  steps: [""],
  category: "Makanan",
  tags: [],
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
    image: initial?.image ?? "",
    images: initial?.images ?? [],
    gallery: normalizeRecipeGallery(initial?.gallery, initial?.images, initial?.image),
    ingredients: initial?.ingredients?.length ? initial.ingredients : [""],
    steps: initial?.steps?.length ? initial.steps : [""],
    tags: initial?.tags ?? [],
  }));
  const [tagInput, setTagInput] = useState("");

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          const fd = new FormData();
          fd.append("file", file);
          const res = await fetch("/api/upload", { method: "POST", body: fd });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Gagal upload");
          return {
            url: data.url as string,
            width: typeof data.width === "number" ? data.width : undefined,
            height: typeof data.height === "number" ? data.height : undefined,
          };
        })
      );

      setForm((f) => {
        const gallery = [
          ...(f.gallery ?? []),
          ...uploadedUrls.map((asset) => ({
            url: asset.url,
            zoom: 1,
            offsetX: 0,
            offsetY: 0,
            width: asset.width,
            height: asset.height,
          })),
        ];
        return {
          ...f,
          image: gallery[0]?.url ?? "",
          images: getLegacyRecipeImagesFromGallery(gallery),
          gallery,
        };
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeImage(index: number) {
    setForm((f) => {
      const gallery = (f.gallery ?? []).filter((_, currentIndex) => currentIndex !== index);
      return {
        ...f,
        image: gallery[0]?.url ?? "",
        images: getLegacyRecipeImagesFromGallery(gallery),
        gallery,
      };
    });
  }

  function setCoverImage(index: number) {
    setForm((f) => {
      const gallery = [...(f.gallery ?? [])];
      const selected = gallery[index];
      if (!selected) return f;

      gallery.splice(index, 1);
      gallery.unshift(selected);

      return {
        ...f,
        image: gallery[0]?.url ?? "",
        images: getLegacyRecipeImagesFromGallery(gallery),
        gallery,
      };
    });
  }

  function updateGalleryImage(index: number, patch: Partial<RecipeImageAsset>) {
    setForm((f) => {
      const gallery = [...(f.gallery ?? [])];
      const current = gallery[index];
      if (!current) return f;

      gallery[index] = { ...current, ...patch };

      return {
        ...f,
        image: gallery[0]?.url ?? "",
        images: getLegacyRecipeImagesFromGallery(gallery),
        gallery,
      };
    });
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

  function addTag(tag: string) {
    const t = tag.trim().toLowerCase();
    if (!t) return;
    setForm((f) => {
      const current = f.tags ?? [];
      if (current.includes(t)) return f;
      return { ...f, tags: [...current, t] };
    });
    setTagInput("");
  }

  function removeTag(tag: string) {
    setForm((f) => ({ ...f, tags: (f.tags ?? []).filter((t) => t !== tag) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const payload = {
      ...form,
      image: form.gallery?.[0]?.url ?? "",
      images: getLegacyRecipeImagesFromGallery(form.gallery),
      gallery: form.gallery ?? [],
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div>
              <Label htmlFor="category">Kategori</Label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="mt-1 w-full rounded-xl border-2 border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring h-10"
              >
                <option value="Makanan">Makanan</option>
                <option value="Minuman">Minuman</option>
                <option value="Cemilan">Cemilan</option>
              </select>
            </div>
            <div>
              <Label htmlFor="servings">Porsi Masakan</Label>
              <Input
                id="servings"
                type="number"
                min={1}
                placeholder="Contoh: 2"
                value={form.servings ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, servings: e.target.value ? Number(e.target.value) : undefined }))}
                className="mt-1 rounded-xl border-2 h-10"
              />
            </div>
            <div>
              <Label>Tags (opsional)</Label>
              <div className="flex gap-2 items-center mt-1">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addTag(tagInput);
                    }
                  }}
                  placeholder="Tambah tag..."
                  className="rounded-xl border-2 text-sm h-10"
                />
                <Button type="button" variant="outline" onClick={() => addTag(tagInput)} className="rounded-xl shrink-0 h-10 px-4">
                  Tambah
                </Button>
              </div>
              {form.tags && form.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {form.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full border border-primary/20 animate-in zoom-in-95">
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive transition-colors">
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <Label>Foto Resep (opsional)</Label>
            <div className="mt-1 space-y-2">
              {(form.gallery?.length ?? 0) > 0 ? (
                <div className="space-y-4">
                  {(form.gallery ?? []).map((image, index) => (
                    <RecipeImageEditorCard
                      key={`${image.url}-${index}`}
                      image={image}
                      index={index}
                      isCover={index === 0}
                      onSetCover={() => setCoverImage(index)}
                      onRemove={() => removeImage(index)}
                      onChange={(patch) => updateGalleryImage(index, patch)}
                    />
                  ))}
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/50 transition-colors bg-muted/20">
                  <ImagePlus className="size-6 text-muted-foreground mb-1" />
                  <span className="text-sm text-muted-foreground">
                    {uploading ? "Mengupload..." : "Klik untuk pilih satu atau beberapa foto"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={uploading}
                  />
                </label>
              )}
              {(form.images?.length ?? 0) > 0 && (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/50 transition-colors bg-muted/20">
                  <ImagePlus className="size-5 text-muted-foreground mb-1" />
                  <span className="text-sm text-muted-foreground">
                    {uploading ? "Mengupload..." : "Tambah foto lagi"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={uploading}
                  />
                </label>
              )}
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
            <Label htmlFor="memberOnly">Khusus Member</Label>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="font-semibold">Bahan-bahan</h2>
        </CardHeader>
        <CardContent className="space-y-2">
          {form.ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={ing}
                onChange={(e) => setIngredient(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addIngredient();
                  }
                }}
                placeholder={`Bahan ${i + 1}`}
                className="rounded-xl border-2"
                autoFocus={i > 0 && i === form.ingredients.length - 1}
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
        </CardHeader>
        <CardContent className="space-y-4">
          {form.steps.map((step, i) => (
            <div key={i} className="flex gap-2">
              <span className="flex items-center justify-center w-8 h-10 rounded-lg bg-muted text-sm font-medium shrink-0">
                {i + 1}
              </span>
              <Textarea
                value={step}
                onChange={(e) => setStep(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    addStep();
                  }
                }}
                placeholder={`Terangkan langkah ${i + 1}...`}
                className="rounded-xl border-2 min-h-[40px] h-10 flex-1 py-2"
                autoFocus={i > 0 && i === form.steps.length - 1}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeStep(i)}
                disabled={form.steps.length <= 1}
                className="shrink-0 rounded-xl size-10"
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
