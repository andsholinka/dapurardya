import Link from "next/link";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-14 max-w-4xl mx-auto items-center justify-between px-4">
        <Link
          href="/"
          className="font-semibold text-lg text-foreground hover:text-primary transition-colors"
        >
          🍳 Dapur Ardya
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/resep" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Semua Resep
          </Link>
          <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
