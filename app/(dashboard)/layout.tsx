import { redirect } from "next/navigation";
import { auth } from "@/auth";
import DashboardShell from "@/components/layout/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <DashboardShell
      role={session.user.role}
      name={session.user.name ?? undefined}
      email={session.user.email ?? undefined}
      user={{
        name:  session.user.name  ?? "",
        email: session.user.email ?? "",
        role:  session.user.role,
      }}
    >
      {children}
    </DashboardShell>
  );
}
