"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icons = {
  overview: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  clients: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="4"/>
      <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
      <path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87"/>
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.74"/>
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  ),
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  upload: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  report: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  history: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/>
    </svg>
  ),
};

// ── Nav config ────────────────────────────────────────────────────────────────
interface NavItem { href: string; label: string; icon: React.ReactNode }

const ADMIN_NAV: NavItem[]  = [
  { href: "/admin",          label: "Overview",    icon: Icons.overview  },
  { href: "/admin/clients",  label: "Clients",     icon: Icons.clients   },
  { href: "/admin/users",    label: "Users",       icon: Icons.users     },
  { href: "/admin/settings", label: "Settings",    icon: Icons.settings  },
];
const TEAM_NAV: NavItem[]   = [
  { href: "/team",           label: "Dashboard",   icon: Icons.dashboard },
  { href: "/team/upload",    label: "Upload Data", icon: Icons.upload    },
];
const CLIENT_NAV: NavItem[] = [
  { href: "/client",         label: "My Report",   icon: Icons.report    },
  { href: "/client/reports", label: "Past Reports",icon: Icons.history   },
];
const NAV_MAP: Record<string, NavItem[]> = { ADMIN: ADMIN_NAV, TEAM: TEAM_NAV, CLIENT: CLIENT_NAV };

// ── Role config ───────────────────────────────────────────────────────────────
const ROLE_CONFIG: Record<string, { label: string; color: string; border: string; dot: string }> = {
  ADMIN:  { label: "Administrator", color: "#00c2f0", border: "rgba(0,194,240,0.2)",  dot: "#00c2f0" },
  TEAM:   { label: "Team Member",   color: "#60a5fa", border: "rgba(96,165,250,0.2)", dot: "#60a5fa" },
  CLIENT: { label: "Client",        color: "#34d399", border: "rgba(52,211,153,0.2)", dot: "#34d399" },
};

// ── Sidebar ───────────────────────────────────────────────────────────────────
export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const navItems = NAV_MAP[role] ?? [];
  const roleConf = ROLE_CONFIG[role];

  return (
    <aside
      className="w-64 flex-shrink-0 flex flex-col h-full"
      style={{
        background: "#0b1628",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >

      {/* ── Logo / Brand ──────────────────────────────────────────────────── */}
      <div className="px-5 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        {/* Actual NDG logo image (transparent PNG on dark bg) */}
        <div className="flex items-center justify-center">
          <Image
            src="/ndg-logo-transparent.png"
            alt="Nashville Digital Group"
            width={190}
            height={70}
            style={{ objectFit: "contain", maxHeight: 64 }}
            priority
          />
        </div>

        {/* App context tag */}
        <div className="flex items-center gap-2 mt-3">
          <div className="h-px flex-1" style={{ background: "rgba(0,174,239,0.15)" }} />
          <span className="text-[9.5px] font-bold tracking-[0.2em] uppercase" style={{ color: "rgba(0,174,239,0.45)" }}>
            Reports Platform
          </span>
          <div className="h-px flex-1" style={{ background: "rgba(0,174,239,0.15)" }} />
        </div>
      </div>

      {/* ── Role badge ────────────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-2">
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11.5px] font-semibold"
          style={{
            color: roleConf?.color ?? "#94a3b8",
            borderColor: roleConf?.border ?? "rgba(255,255,255,0.1)",
            background: `${roleConf?.color ?? "#94a3b8"}14`,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: roleConf?.dot ?? "#94a3b8" }} />
          {roleConf?.label ?? role}
        </div>
      </div>

      {/* ── Section label ─────────────────────────────────────────────────── */}
      <div className="px-5 pt-3 pb-1.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.2)" }}>
          Navigation
        </p>
      </div>

      {/* ── Nav items ─────────────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 space-y-0.5 pb-4">
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
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 group"
              style={
                active
                  ? { color: "#ffffff", background: "rgba(0,174,239,0.13)", border: "1px solid rgba(0,174,239,0.2)" }
                  : { color: "#4d7a9e", background: "transparent", border: "1px solid transparent" }
              }
              onMouseEnter={(e) => {
                if (!active) {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = "#c8e8f8";
                  el.style.background = "rgba(255,255,255,0.04)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = "#4d7a9e";
                  el.style.background = "transparent";
                }
              }}
            >
              {/* Cyan left accent */}
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full"
                  style={{ background: "#00aeef" }}
                />
              )}
              {/* Icon */}
              <span className="w-4 h-4 flex-shrink-0" style={{ color: active ? "#00aeef" : "inherit" }}>
                {item.icon}
              </span>
              {/* Label */}
              <span className="flex-1">{item.label}</span>
              {/* Active dot */}
              {active && (
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#00aeef" }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div className="px-4 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        {/* Company tagline row */}
        <div className="flex items-center gap-2 mb-2">
          <Image
            src="/ndg-logo-transparent.png"
            alt="Nashville Digital Group"
            width={100}
            height={36}
            style={{ objectFit: "contain", maxHeight: 28, opacity: 0.5 }}
          />
        </div>
        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: "#34d399" }} />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "#34d399" }} />
            </span>
            <span className="text-[10.5px]" style={{ color: "rgba(255,255,255,0.2)" }}>All systems online</span>
          </div>
          <span className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.15)" }}>v1.0</span>
        </div>
      </div>

    </aside>
  );
}
