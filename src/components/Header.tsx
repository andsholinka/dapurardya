import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth-v2";
import { HeaderMenu } from "./HeaderMenu";

export async function Header() {
  const session = await getSession();
  const isAdmin = session?.role === "admin";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto w-full max-w-4xl flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image src="/icon-192.png" alt="Dapur Ardya" width={32} height={32} className="rounded-lg" />
          <span className="font-bold text-lg">Dapur Ardya</span>
        </Link>
        <nav className="flex items-center gap-3">
          <HeaderMenu member={session} isAdmin={isAdmin} />
        </nav>
      </div>
    </header>
  );
}
