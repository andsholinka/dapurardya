import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { buttonVariants } from "@/lib/button-variants";
import { LogoutButton } from "@/components/LogoutButton";
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
    <div className="container max-w-4xl mx-auto px-4 py-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold">Admin – Kelola Resep</h1>
        <div className="flex gap-2">
          <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-xl")}>
            Beranda
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
