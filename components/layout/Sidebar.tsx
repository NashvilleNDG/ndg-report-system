"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// ── Brand colours (from Nashville Digital Group logo) ─────────────────────────
// Cyan:   #00aeef / #29d4ff   (top face, text)
// Blue:   #0075c2             (right face)
// Purple: #5c3d9f / #3d1f7a  (left face)
// ─────────────────────────────────────────────────────────────────────────────

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

// ── NDG Isometric Cube Logo Mark ──────────────────────────────────────────────
// Faithfully recreates the 3-face isometric cube from the NDG brand logo
// Top face: bright cyan  |  Right face: blue  |  Left face: purple
function NDGCubeMark({ size = 44 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 52 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Top face — bright cyan */}
        <linearGradient id="ndg-top" x1="0" y1="0" x2="1" y2="0.6" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#29d4ff"/>
          <stop offset="100%" stopColor="#00a8e8"/>
        </linearGradient>
        {/* Right face — medium blue */}
        <linearGradient id="ndg-right" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#0090d0"/>
          <stop offset="100%" stopColor="#0060a8"/>
        </linearGradient>
        {/* Left face — purple */}
        <linearGradient id="ndg-left" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#6644c0"/>
          <stop offset="100%" stopColor="#3a1878"/>
        </linearGradient>
      </defs>

      {/* ── Top face (isometric diamond) ── */}
      <polygon points="26,2 50,15 26,28 2,15" fill="url(#ndg-top)"/>

      {/* ── Right face ── */}
      <polygon points="50,15 50,40 26,53 26,28" fill="url(#ndg-right)"/>

      {/* ── Left face ── */}
      <polygon points="2,15 26,28 26,53 2,40" fill="url(#ndg-left)"/>

      {/* ── N cutout on top face (white void) ── */}
      <polygon points="26,6 46,17 26,24 6,17" fill="white" opacity="0.88"/>

      {/* ── Restore left N-pillar (cyan strip on top face) ── */}
      <polygon points="6,17 13,13 13,18 6,22" fill="#18c8ec"/>

      {/* ── Restore right N-pillar (cyan strip on top face) ── */}
      <polygon points="39,13 46,17 46,22 39,18" fill="#18c8ec"/>
    </svg>
  );
}

// ── Nav Config ────────────────────────────────────────────────────────────────
interface NavItem { href: string; label: string; icon: React.ReactNode }

const ADMIN_NAV: NavItem[]  = [
  { href: "/admin",          label: "Overview",   icon: Icons.overview  },
  { href: "/admin/clients",  label: "Clients",    icon: Icons.clients   },
  { href: "/admin/users",    label: "Users",      icon: Icons.users     },
  { href: "/admin/settings", label: "Settings",   icon: Icons.settings  },
];
const TEAM_NAV: NavItem[]   = [
  { href: "/team",           label: "Dashboard",   icon: Icons.dashboard },
  { href: "/team/upload",    label: "Upload Data", icon: Icons.upload    },
];
const CLIENT_NAV: NavItem[] = [
  { href: "/client",         label: "My Report",   icon: Icons.report  },
  { href: "/client/reports", label: "Past Reports",icon: Icons.history },
];
const NAV_MAP: Record<string, NavItem[]> = { ADMIN: ADMIN_NAV, TEAM: TEAM_NAV, CLIENT: CLIENT_NAV };

// ── Role config ───────────────────────────────────────────────────────────────
const ROLE_CONFIG: Record<string, { label: string; color: string; border: string; dot: string }> = {
  ADMIN:  { label: "Administrator", color: "#00aeef", border: "rgba(0,174,239,0.25)",  dot: "#00aeef" },
  TEAM:   { label: "Team Member",   color: "#60a5fa", border: "rgba(96,165,250,0.25)", dot: "#60a5fa" },
  CLIENT: { label: "Client",        color: "#34d399", border: "rgba(52,211,153,0.25)", dot: "#34d399" },
};

// ── Sidebar ───────────────────────────────────────────────────────────────────
export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const navItems = NAV_MAP[role] ?? [];
  const roleConf = ROLE_CONFIG[role];

  return (
    <aside
      className="w-72 flex-shrink-0 flex flex-col"
      style={{
        background: "linear-gradient(180deg, #0b1628 0%, #081020 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >

      {/* ── Brand / Logo ──────────────────────────────────────────────────── */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3.5">
          {/* Cube logo mark */}
          <div className="flex-shrink-0 drop-shadow-lg">
            <NDGCubeMark size={46} />
          </div>

          {/* Company wordmark */}
          <div className="min-w-0">
            {/* "NASHVILLE" in brand cyan */}
            <p
              className="font-black text-[13px] tracking-[0.06em] leading-tight uppercase"
              style={{ color: "#00aeef" }}
            >
              Nashville
            </p>
            {/* "DIGITAL GROUP" slightly smaller */}
            <p
              className="font-bold text-[12px] tracking-[0.06em] leading-tight uppercase"
              style={{ color: "#00aeef" }}
            >
              Digital Group
            </p>
            {/* App context tag */}
            <div className="flex items-center gap-1.5 mt-2">
              <div className="h-px flex-1" style={{ background: "rgba(0,174,239,0.2)" }} />
              <span
                className="text-[9px] font-bold tracking-[0.2em] uppercase"
                style={{ color: "rgba(0,174,239,0.5)" }}
              >
                Reports
              </span>
              <div className="h-px flex-1" style={{ background: "rgba(0,174,239,0.2)" }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Divider ───────────────────────────────────────────────────────── */}
      <div className="mx-4 mb-4" style={{ height: 1, background: "rgba(0,174,239,0.1)" }} />

      {/* ── Role badge ────────────────────────────────────────────────────── */}
      <div className="px-4 pb-4">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold"
          style={{
            color: roleConf?.color ?? "#94a3b8",
            borderColor: roleConf?.border ?? "rgba(255,255,255,0.1)",
            background: `${roleConf?.color ?? "#94a3b8"}18`,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: roleConf?.dot ?? "#94a3b8" }} />
          {roleConf?.label ?? role}
        </div>
      </div>

      {/* ── Section label ─────────────────────────────────────────────────── */}
      <div className="px-5 pb-2">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ color: "rgba(0,174,239,0.3)" }}
        >
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
              className="relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150 group"
              style={
                active
                  ? {
                      color: "#ffffff",
                      background: "rgba(0,174,239,0.12)",
                      border: "1px solid rgba(0,174,239,0.22)",
                    }
                  : {
                      color: "#4d7a9e",
                      background: "transparent",
                      border: "1px solid transparent",
                    }
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
              {/* Cyan left accent bar for active item */}
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                  style={{ background: "#00aeef" }}
                />
              )}

              {/* Icon */}
              <span
                className="flex-shrink-0 w-[17px] h-[17px]"
                style={{ color: active ? "#00aeef" : undefined }}
              >
                {item.icon}
              </span>

              {/* Label */}
              <span className="flex-1">{item.label}</span>

              {/* Active indicator dot */}
              {active && (
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: "#00aeef" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom divider ─────────────────────────────────────────────────── */}
      <div className="mx-4 mb-4" style={{ height: 1, background: "rgba(0,174,239,0.08)" }} />

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div className="px-4 pb-6 space-y-3">
        {/* Agency info card */}
        <div
          className="rounded-xl p-3.5 space-y-2.5"
          style={{
            background: "rgba(0,174,239,0.05)",
            border: "1px solid rgba(0,174,239,0.1)",
          }}
        >
          {/* Mini cube + name */}
          <div className="flex items-center gap-2.5">
            <NDGCubeMark size={26} />
            <div>
              <p className="text-[11.5px] font-bold leading-tight" style={{ color: "#00aeef" }}>
                Nashville Digital Group
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: "rgba(0,174,239,0.4)" }}>
                nashvilledigitalgroup.com
              </p>
            </div>
          </div>
          <p className="text-[10.5px] leading-relaxed" style={{ color: "rgba(255,255,255,0.25)" }}>
            AI-powered digital marketing solutions for growing businesses.
          </p>
        </div>

        {/* Status row */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                style={{ background: "#34d399" }}
              />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#34d399" }} />
            </span>
            <span className="text-[11px] font-medium" style={{ color: "rgba(0,174,239,0.35)" }}>
              All systems online
            </span>
          </div>
          <span className="text-[10px] font-mono" style={{ color: "rgba(0,174,239,0.2)" }}>v1.0</span>
        </div>
      </div>

    </aside>
  );
}
