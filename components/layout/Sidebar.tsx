"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// ── SVG Icons ─────────────────────────────────────────────────────────────────

const Icons = {
  overview: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  clients: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="4" />
      <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
      <path d="M16 3.13a4 4 0 010 7.75" />
      <path d="M21 21v-2a4 4 0 00-3-3.87" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.74" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  upload: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  report: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  history: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 15" />
    </svg>
  ),
};

// ── NDG Brand Logo Mark ───────────────────────────────────────────────────────
// The N-shape doubles as a rising trend line — data analytics meets Nashville

function NDGMark() {
  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      {/* Glow layer */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 blur-sm opacity-60 scale-95" />
      {/* Icon card */}
      <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 rounded-2xl flex items-center justify-center shadow-xl">
        {/* N as trend-line — the zigzag path IS the letter N */}
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <polyline
            points="4,18 4,6 13,17 20,6 20,18"
            stroke="white"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Tiny data-point dots */}
          <circle cx="4" cy="6" r="1.4" fill="white" fillOpacity="0.8" />
          <circle cx="20" cy="6" r="1.4" fill="white" fillOpacity="0.8" />
        </svg>
      </div>
    </div>
  );
}

// ── Nav Config ────────────────────────────────────────────────────────────────

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const ADMIN_NAV: NavItem[] = [
  { href: "/admin",         label: "Overview",  icon: Icons.overview  },
  { href: "/admin/clients", label: "Clients",   icon: Icons.clients   },
  { href: "/admin/users",   label: "Users",     icon: Icons.users     },
  { href: "/admin/settings",label: "Settings",  icon: Icons.settings  },
];

const TEAM_NAV: NavItem[] = [
  { href: "/team",        label: "Dashboard",   icon: Icons.dashboard },
  { href: "/team/upload", label: "Upload Data", icon: Icons.upload    },
];

const CLIENT_NAV: NavItem[] = [
  { href: "/client",         label: "My Report",   icon: Icons.report  },
  { href: "/client/reports", label: "Past Reports", icon: Icons.history },
];

const NAV_MAP: Record<string, NavItem[]> = {
  ADMIN:  ADMIN_NAV,
  TEAM:   TEAM_NAV,
  CLIENT: CLIENT_NAV,
};

// ── Role styles ───────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  ADMIN:  { label: "Administrator", color: "text-violet-300 bg-violet-500/10 border-violet-500/20", dot: "bg-violet-400" },
  TEAM:   { label: "Team Member",   color: "text-sky-300   bg-sky-500/10   border-sky-500/20",     dot: "bg-sky-400"    },
  CLIENT: { label: "Client",        color: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-400" },
};

// ── Sidebar Component ─────────────────────────────────────────────────────────

export default function Sidebar({ role }: { role: string }) {
  const pathname  = usePathname();
  const navItems  = NAV_MAP[role] ?? [];
  const roleConf  = ROLE_CONFIG[role];

  return (
    <aside className="w-72 flex-shrink-0 bg-[#080c14] flex flex-col border-r border-white/[0.05]">

      {/* ── Brand / Logo area ─────────────────────────────────────────────── */}
      <div className="px-5 pt-7 pb-6">
        <div className="flex items-center gap-3.5">
          <NDGMark />
          <div className="min-w-0">
            {/* Company name */}
            <div className="flex items-center gap-2">
              <span className="text-white font-extrabold text-[15px] tracking-tight leading-none">
                Nashville
              </span>
              <span className="text-[10px] font-bold tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded-md leading-none">
                NDG
              </span>
            </div>
            <p className="text-slate-400 text-[13px] font-medium tracking-wide mt-0.5 leading-none">
              Digital Group
            </p>
            {/* App tag */}
            <div className="flex items-center gap-2 mt-2.5">
              <div className="h-px flex-1 bg-slate-800" />
              <span className="text-[10px] font-semibold text-slate-600 tracking-[0.12em] uppercase">
                Reports
              </span>
              <div className="h-px flex-1 bg-slate-800" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Role badge ────────────────────────────────────────────────────── */}
      <div className="px-4 pb-5">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${roleConf?.color ?? "text-slate-400 bg-slate-800 border-slate-700"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${roleConf?.dot ?? "bg-slate-400"}`} />
          {roleConf?.label ?? role}
        </div>
      </div>

      {/* ── Nav section label ──────────────────────────────────────────────── */}
      <div className="px-5 pb-2">
        <p className="text-[10.5px] font-bold text-slate-600 uppercase tracking-[0.14em]">
          Navigation
        </p>
      </div>

      {/* ── Nav items ─────────────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 space-y-0.5 pb-6">
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
              className={`
                relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium
                transition-all duration-150 group
                ${active
                  ? "text-white bg-indigo-500/[0.15] border border-indigo-500/20"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent"
                }
              `}
            >
              {/* Left accent bar */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-indigo-500 rounded-r-full" />
              )}

              {/* Icon */}
              <span className={`
                flex-shrink-0 w-[17px] h-[17px] transition-colors duration-150
                ${active ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}
              `}>
                {item.icon}
              </span>

              {/* Label */}
              <span className="flex-1">{item.label}</span>

              {/* Active dot */}
              {active && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Divider ───────────────────────────────────────────────────────── */}
      <div className="mx-4 h-px bg-white/[0.05] mb-4" />

      {/* ── Footer / Agency info ─────────────────────────────────────────── */}
      <div className="px-4 pb-6 space-y-4">
        {/* Powered-by block */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3.5">
          <div className="flex items-center gap-2.5 mb-1.5">
            {/* Small NDG mark */}
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-md flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
                <polyline points="4,18 4,8 13,16 20,8 20,18" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-white text-[12px] font-bold leading-none">Nashville Digital Group</p>
              <p className="text-slate-600 text-[10px] mt-0.5">nashvilledigitalgroup.com</p>
            </div>
          </div>
          <p className="text-slate-600 text-[10.5px] leading-relaxed">
            Digital marketing reporting platform for NDG clients.
          </p>
        </div>

        {/* Status row */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            {/* Animated pulse dot */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] text-slate-500 font-medium">All systems online</span>
          </div>
          <span className="text-[10px] text-slate-700 font-mono">v1.0</span>
        </div>
      </div>

    </aside>
  );
}
