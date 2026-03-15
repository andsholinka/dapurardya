import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 pb-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold">Admin Dapur Ardya</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-xl")}>
            Dashboard
          </Link>
          <Link
            href="/admin/members"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-xl")}
          >
            Member Premium
          </Link>
          <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-xl")}>
            Beranda
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
