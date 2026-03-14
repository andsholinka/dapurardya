import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const isAdmin = await getAdminSession();
  if (isAdmin) redirect("/admin");
  return <LoginForm />;
}
