import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth-v2";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/member/auth");
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Admin</h1>
          <p className="text-muted-foreground text-sm">Kelola resep dan request</p>
        </div>
        <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-xl")}>
          ← Ke Beranda
        </Link>
      </div>
      {children}
    </div>
  );
}
