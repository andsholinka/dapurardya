import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import { getAdminSession, getMemberSession } from "@/lib/auth";
import { HeaderMenu } from "./HeaderMenu";

export async function Header() {
  const [isAdmin, member] = await Promise.all([getAdminSession(), getMemberSession()]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-14 max-w-4xl mx-auto items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-lg text-foreground hover:text-primary transition-colors"
        >
          <Image src="/icon-192.png" alt="Dapur Ardya" width={32} height={32} className="rounded-md" quality={100} />
          Dapur Ardya
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/resep" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Semua Resep
          </Link>
          {isAdmin ? (
            <HeaderMenu member={{ id: "admin", name: "Admin", email: "" }} isAdmin />
          ) : (
            <HeaderMenu member={member} />
          )}
        </nav>
      </div>
    </header>
  );
}
