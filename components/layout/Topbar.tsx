"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface TopbarProps {
  user:        { name: string; email: string; role: string };
  onMenuClick?: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Overview",
  "/admin/clients": "Clients",
  "/admin/users": "Users",
  "/admin/settings": "Settings",
  "/admin/reports": "All Reports",
  "/team": "Dashboard",
  "/team/upload": "Upload Data",
  "/client": "My Report",
  "/client/reports": "Past Reports",
  "/profile": "My Profile",
};

function getPageTitle(pathname: string): string {
  // Exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // Prefix match for dynamic routes
  if (pathname.startsWith("/admin/clients/")) return "Client Detail";
  if (pathname.startsWith("/team/entry/")) return "Enter Report Data";
  if (pathname.startsWith("/team/preview/")) return "Report Preview";
  if (pathname.startsWith("/client/reports/")) return "Report";
  return "Dashboard";
}

const AVATAR_COLORS: Record<string, string> = {
  ADMIN: "bg-violet-100 text-violet-700 ring-violet-200",
  TEAM: "bg-sky-100 text-sky-700 ring-sky-200",
  CLIENT: "bg-emerald-100 text-emerald-700 ring-emerald-200",
};

export default function Topbar({ user, onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const avatarColor = AVATAR_COLORS[user.role] ?? "bg-indigo-100 text-indigo-700 ring-indigo-200";

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 shadow-sm gap-3">
      {/* Left: hamburger (mobile) + page title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 className="text-sm sm:text-base font-semibold text-gray-800 truncate">{title}</h2>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Profile link */}
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-xl px-3 py-1.5 hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-200"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors leading-tight">
              {user.name}
            </p>
            <p className="text-xs text-gray-400 leading-tight">{user.email}</p>
          </div>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ring-2 ring-offset-1 transition-all ${avatarColor}`}>
            {user.name.charAt(0).toUpperCase()}
          </div>
        </Link>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200" />

        {/* Sign out */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-red-50"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </header>
  );
}
