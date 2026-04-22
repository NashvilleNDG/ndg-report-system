"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { ToastProvider } from "@/components/ui/Toast";

interface Props {
  role:     string;
  name?:    string;
  email?:   string;
  user:     { name: string; email: string; role: string };
  children: React.ReactNode;
}

export default function DashboardShell({ role, name, email, user, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
    <div className="flex h-screen overflow-hidden" style={{ background: "#f5f7fa" }}>

      {/* ── Mobile backdrop ───────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      {/*
          Mobile  : fixed, full-height, slides in from left (z-50)
          Desktop : static column, always visible
      */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:z-auto
          no-print
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar
          role={role}
          name={name}
          email={email}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* ── Main area ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <div className="no-print">
          <Topbar
            user={user}
            onMenuClick={() => setSidebarOpen(true)}
          />
        </div>
        <main
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"
          style={{ background: "linear-gradient(180deg, #f5f7fa 0%, #eef1f6 100%)" }}
        >
          {children}
        </main>
      </div>
    </div>
    </ToastProvider>
  );
}
