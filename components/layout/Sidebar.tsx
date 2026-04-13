"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Overview", icon: "⬛" },
  { href: "/admin/clients", label: "Clients", icon: "👥" },
  { href: "/admin/users", label: "Users", icon: "🔑" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

const TEAM_NAV: NavItem[] = [
  { href: "/team", label: "Dashboard", icon: "⬛" },
  { href: "/team/upload", label: "Upload Data", icon: "📤" },
];

const CLIENT_NAV: NavItem[] = [
  { href: "/client", label: "My Report", icon: "📊" },
  { href: "/client/reports", label: "Past Reports", icon: "📁" },
];

const NAV_MAP: Record<string, NavItem[]> = {
  ADMIN: ADMIN_NAV,
  TEAM: TEAM_NAV,
  CLIENT: CLIENT_NAV,
};

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const navItems = NAV_MAP[role] ?? [];

  return (
    <aside className="w-56 flex-shrink-0 bg-slate-900 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-slate-700">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span className="text-white font-semibold text-sm">NDG Reports</span>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-5 pt-4 pb-2">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {role.charAt(0) + role.slice(1).toLowerCase()}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin" &&
              item.href !== "/team" &&
              item.href !== "/client" &&
              pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-slate-700">
        <p className="text-xs text-slate-500 text-center">NDG Agency</p>
      </div>
    </aside>
  );
}
