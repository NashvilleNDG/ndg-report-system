import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function RootPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const role = session.user.role;
  if (role === "ADMIN") redirect("/admin");
  if (role === "TEAM") redirect("/team");
  redirect("/client");
}
