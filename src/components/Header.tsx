import Link from "next/link";
import Image from "next/image";
import { getAdminSession, getMemberSession } from "@/lib/auth";
import { HeaderMenu } from "./HeaderMenu";

export async function Header() {
  const [isAdmin, member] = await Promise.all([getAdminSession(), getMemberSession()]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-14 max-w-4xl mx-auto items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 sm:gap-2 font-bold text-base sm:text-lg text-foreground hover:text-primary transition-colors shrink-0 whitespace-nowrap"
        >
          <Image src="/icon-192.png" alt="Dapur Ardya" width={28} height={28} className="rounded-lg sm:w-[32px] sm:h-[32px]" />
          Dapur Ardya
        </Link>
        <nav className="flex items-center gap-2">
          {isAdmin ? (
            <HeaderMenu member={{ id: "admin", name: "Admin", email: "", credits: 999 }} isAdmin />
          ) : (
            <HeaderMenu member={member} />
          )}
        </nav>
      </div>
    </header>
  );
}
