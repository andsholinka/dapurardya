import { redirect } from "next/navigation";

export default function LoginPage() {
  redirect("/member/auth");
}
