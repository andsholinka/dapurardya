import Link from "next/link";
import { buttonVariants } from "@/lib/button-variants";
import { RecipeForm } from "@/components/RecipeForm";
import { cn } from "@/lib/utils";

export default function NewRecipePage() {
  return (
    <>
      <Link href="/admin" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-4 -ml-1 inline-block")}>
        ← Kembali ke Daftar Resep
      </Link>
      <h2 className="text-xl font-bold mb-4">Tambah Resep Baru</h2>
      <RecipeForm mode="new" />
    </>
  );
}
