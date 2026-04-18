import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#f5f7fa" }}>
      <div className="no-print">
        <Sidebar role={session.user.role} name={session.user.name ?? undefined} email={session.user.email ?? undefined} />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <div className="no-print">
          <Topbar user={session.user} />
        </div>
        <main className="flex-1 overflow-y-auto p-6 lg:p-8" style={{ background: "linear-gradient(180deg, #f5f7fa 0%, #eef1f6 100%)" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
