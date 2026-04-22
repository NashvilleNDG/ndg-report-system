"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { periodLabel } from "@/lib/report-utils";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";

// ── Types ─────────────────────────────────────────────────────────────────────
const TABS = ["Instagram", "Facebook", "TikTok", "YouTube", "GMB", "Website", "Email"] as const;
type Tab = typeof TABS[number];
type FormValues = Record<string, string>;

// ── Field definitions ─────────────────────────────────────────────────────────
const FIELDS: Record<Tab, { key: string; label: string; hint?: string; isFloat?: boolean }[]> = {
  Instagram: [
    { key: "views",               label: "Views",                hint: "Total profile views" },
    { key: "contentInteractions", label: "Content Interactions", hint: "Likes, comments, shares" },
    { key: "follows",             label: "Followers",            hint: "Total follower count" },
    { key: "numberOfPosts",       label: "Number of Posts",      hint: "Posts published this period" },
  ],
  Facebook: [
    { key: "views",               label: "Views",                hint: "Total page views" },
    { key: "contentInteractions", label: "Content Interactions", hint: "Likes, comments, shares" },
    { key: "follows",             label: "Followers",            hint: "Total follower count" },
    { key: "numberOfPosts",       label: "Number of Posts",      hint: "Posts published this period" },
  ],
  TikTok: [
    { key: "views",               label: "Views",                hint: "Total video views" },
    { key: "contentInteractions", label: "Content Interactions", hint: "Likes, comments, shares" },
    { key: "follows",             label: "Followers",            hint: "Total follower count" },
    { key: "numberOfReels",       label: "Number of Reels",      hint: "Videos published this period" },
  ],
  YouTube: [
    { key: "views",          label: "Views",            hint: "Total video views" },
    { key: "numberOfVideos", label: "Number of Videos", hint: "Videos published this period" },
  ],
  GMB: [
    { key: "profileInteractions", label: "Profile Interactions", hint: "Calls, directions, website clicks" },
    { key: "views",               label: "Views",                hint: "Business profile views" },
    { key: "searches",            label: "Searches",             hint: "Times appeared in search" },
    { key: "numberOfReviews",     label: "Number of Reviews",    hint: "Total reviews received" },
  ],
  Website: [
    { key: "totalUsers", label: "Total Users", hint: "All users this period" },
    { key: "newUsers",   label: "New Users",   hint: "First-time visitors" },
    { key: "views",      label: "Page Views",  hint: "Total pages viewed" },
    { key: "eventCount", label: "Event Count", hint: "Tracked events / conversions" },
  ],
  Email: [
    { key: "numberOfEmails", label: "Emails Sent",  hint: "Unique campaigns sent" },
    { key: "totalSends",     label: "Total Sends",   hint: "Total recipients reached" },
    { key: "openRate",       label: "Open Rate (%)", hint: "e.g. 24.5", isFloat: true },
  ],
};

// ── Platform config ───────────────────────────────────────────────────────────
const PLATFORM_CONFIG: Record<Tab, {
  gradient: string;
  lightBg: string;
  ring: string;
  textColor: string;
  icon: React.ReactNode;
}> = {
  Instagram: {
    gradient: "from-pink-500 via-rose-500 to-purple-600",
    lightBg:  "bg-pink-50",
    ring:     "ring-pink-300",
    textColor:"text-pink-700",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  Facebook: {
    gradient: "from-blue-600 to-blue-500",
    lightBg:  "bg-blue-50",
    ring:     "ring-blue-300",
    textColor:"text-blue-700",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  TikTok: {
    gradient: "from-gray-900 to-gray-700",
    lightBg:  "bg-gray-100",
    ring:     "ring-gray-400",
    textColor:"text-gray-700",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ),
  },
  YouTube: {
    gradient: "from-red-600 to-red-500",
    lightBg:  "bg-red-50",
    ring:     "ring-red-300",
    textColor:"text-red-700",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  GMB: {
    gradient: "from-orange-500 to-amber-400",
    lightBg:  "bg-orange-50",
    ring:     "ring-orange-300",
    textColor:"text-orange-700",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C7.802 0 4 3.403 4 7.602C4 11.8 7.469 16.812 12 24C16.531 16.812 20 11.8 20 7.602C20 3.403 16.199 0 12 0ZM12 11C10.343 11 9 9.657 9 8C9 6.343 10.343 5 12 5C13.657 5 15 6.343 15 8C15 9.657 13.657 11 12 11Z"/>
      </svg>
    ),
  },
  Website: {
    gradient: "from-teal-600 to-cyan-500",
    lightBg:  "bg-teal-50",
    ring:     "ring-teal-300",
    textColor:"text-teal-700",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
  Email: {
    gradient: "from-violet-600 to-purple-500",
    lightBg:  "bg-violet-50",
    ring:     "ring-violet-300",
    textColor:"text-violet-700",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
};

function parseFormToNumbers(values: FormValues): Record<string, number | null> {
  return Object.fromEntries(
    Object.entries(values).map(([k, v]) => [k, v === "" ? null : Number(v)])
  );
}

function hasData(values: FormValues): boolean {
  return Object.values(values).some((v) => v !== "" && v !== undefined);
}

export default function TeamEntryPage() {
  const params = useParams<{ clientId: string; month: string }>();
  const { clientId, month } = params;

  const [activeTab,  setActiveTab]  = useState<Tab>("Instagram");
  const [reportId,   setReportId]   = useState<string | null>(null);
  const [saving,     setSaving]     = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [clientName, setClientName] = useState("");

  const [instagram, setInstagram] = useState<FormValues>({});
  const [facebook,  setFacebook]  = useState<FormValues>({});
  const [tiktok,    setTiktok]    = useState<FormValues>({});
  const [youtube,   setYoutube]   = useState<FormValues>({});
  const [gmb,       setGmb]       = useState<FormValues>({});
  const [website,   setWebsite]   = useState<FormValues>({});
  const [email,     setEmail]     = useState<FormValues>({});

  const stateMap: Record<Tab, [FormValues, (fn: (f: FormValues) => FormValues) => void]> = {
    Instagram: [instagram, setInstagram],
    Facebook:  [facebook,  setFacebook],
    TikTok:    [tiktok,    setTiktok],
    YouTube:   [youtube,   setYoutube],
    GMB:       [gmb,       setGmb],
    Website:   [website,   setWebsite],
    Email:     [email,     setEmail],
  };

  useEffect(() => {
    const init = async () => {
      const clientRes = await fetch("/api/clients");
      if (clientRes.ok) {
        const clients: { id: string; name: string }[] = await clientRes.json();
        const c = clients.find((x) => x.id === clientId);
        if (c) setClientName(c.name);
      }

      const reportsRes = await fetch(`/api/reports?clientId=${clientId}&period=${month}`);
      if (reportsRes.ok) {
        const reports: { id: string; period: string }[] = await reportsRes.json();
        const existing = reports.find((r) => r.period === month);
        if (existing) {
          setReportId(existing.id);
          const dataRes = await fetch(`/api/reports/${existing.id}/data`);
          if (dataRes.ok) {
            const data = await dataRes.json();
            const toStr = (obj: Record<string, unknown> | null | undefined): FormValues =>
              obj ? Object.fromEntries(Object.entries(obj).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)])) : {};
            if (data.socialMedia) {
              setInstagram(toStr(data.socialMedia.instagram));
              setFacebook(toStr(data.socialMedia.facebook));
              setTiktok(toStr(data.socialMedia.tiktok));
              setYoutube(toStr(data.socialMedia.youtube));
            }
            setGmb(toStr(data.gmbData));
            setWebsite(toStr(data.websiteData));
            setEmail(toStr(data.emailMarketing));
          }
        }
      }
      setLoading(false);
    };
    init();
  }, [clientId, month]);

  const ensureReport = async (): Promise<string | null> => {
    if (reportId) return reportId;
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, period: month }),
    });
    if (!res.ok) {
      if (res.status === 409) {
        const r2 = await fetch(`/api/reports?clientId=${clientId}&period=${month}`);
        if (r2.ok) {
          const reports: { id: string; period: string }[] = await r2.json();
          const existing = reports.find((r) => r.period === month);
          if (existing) { setReportId(existing.id); return existing.id; }
        }
      }
      const data = await res.json();
      throw new Error(data.error ?? "Failed to create report");
    }
    const report = await res.json();
    setReportId(report.id);
    return report.id;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const id = await ensureReport();
      if (!id) throw new Error("No report ID");
      const res = await fetch(`/api/reports/${id}/data`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instagram: parseFormToNumbers(instagram),
          facebook:  parseFormToNumbers(facebook),
          tiktok:    parseFormToNumbers(tiktok),
          youtube:   parseFormToNumbers(youtube),
          gmb:       parseFormToNumbers(gmb),
          website:   parseFormToNumbers(website),
          email:     parseFormToNumbers(email),
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Save failed"); }
      toastSuccess("Data saved!", "All platform metrics have been saved successfully.");
    } catch (err) {
      toastError("Save failed", err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const { success: toastSuccess, error: toastError } = useToast();
  const tabScrollRef = useRef<HTMLDivElement>(null);

  const cfg     = PLATFORM_CONFIG[activeTab];
  const [values, setValues] = stateMap[activeTab];
  const filledCount = TABS.filter((t) => hasData(stateMap[t][0])).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-8 h-8 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p className="text-sm text-gray-400">Loading report data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 page-content">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-2xl p-5 shadow-lg shadow-indigo-200/40">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white leading-tight">{clientName || "Client"}</h1>
              <p className="text-indigo-200 text-sm mt-0.5">{periodLabel(month)} · Data Entry</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Progress pill */}
            <div className="bg-white/15 border border-white/20 rounded-xl px-4 py-2 flex items-center gap-2.5">
              <div className="flex gap-1">
                {TABS.map((t) => (
                  <div
                    key={t}
                    className={`w-2 h-2 rounded-full transition-colors ${hasData(stateMap[t][0]) ? "bg-emerald-400" : "bg-white/25"}`}
                    title={t}
                  />
                ))}
              </div>
              <span className="text-white text-xs font-semibold">{filledCount}/{TABS.length} platforms</span>
            </div>
            <Link
              href={`/team/preview/${clientId}/${month}`}
              className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview
            </Link>
          </div>
        </div>
      </div>

      {/* ── Mobile horizontal tab bar (hidden on desktop) ─────────────────── */}
      <div className="lg:hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
        <div ref={tabScrollRef} className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {TABS.map((tab) => {
            const c = PLATFORM_CONFIG[tab];
            const active = tab === activeTab;
            const filled = hasData(stateMap[tab][0]);
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                  active
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${c.gradient}`}>
                  <span className="text-white scale-[0.6]">{c.icon}</span>
                </div>
                {tab}
                {filled && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Two-column body ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">

        {/* LEFT: Platform selector — desktop only ─────────────────────────── */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 p-3 h-fit">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 pb-2">Platforms</p>
          <div className="space-y-1">
            {TABS.map((tab) => {
              const c   = PLATFORM_CONFIG[tab];
              const active = tab === activeTab;
              const filled = hasData(stateMap[tab][0]);
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 text-left group ${
                    active
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {/* Platform icon */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${c.gradient} shadow-sm`}>
                    <span className="text-white">{c.icon}</span>
                  </div>
                  <span className="flex-1">{tab}</span>
                  {/* Filled indicator */}
                  {filled ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" title="Has data" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-gray-200 flex-shrink-0 group-hover:bg-gray-300 transition-colors" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Form area ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Platform header */}
          <div className={`bg-gradient-to-r ${cfg.gradient} px-6 py-5 flex items-center gap-4`}>
            <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/20">
              <span className="text-white">{cfg.icon}</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">{activeTab}</h2>
              <p className="text-white/70 text-xs mt-0.5">
                {FIELDS[activeTab].length} metric{FIELDS[activeTab].length !== 1 ? "s" : ""} · {periodLabel(month)}
              </p>
            </div>
            {hasData(values) && (
              <span className="ml-auto inline-flex items-center gap-1.5 bg-white/20 border border-white/25 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Data entered
              </span>
            )}
          </div>

          {/* Fields */}
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {FIELDS[activeTab].map(({ key, label, hint, isFloat }) => {
                const filled = values[key] !== "" && values[key] !== undefined;
                return (
                  <div key={key} className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      {label}
                    </label>
                    {hint && (
                      <p className="text-xs text-gray-400 mb-2 leading-tight">{hint}</p>
                    )}
                    <div className="relative">
                      <input
                        type="number"
                        step={isFloat ? "0.01" : "1"}
                        min="0"
                        value={values[key] ?? ""}
                        onChange={(e) => setValues((f) => ({ ...f, [key]: e.target.value }))}
                        placeholder="0"
                        className={`w-full border rounded-xl px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent transition-all placeholder:text-gray-300 ${
                          filled
                            ? `border-emerald-200 focus:ring-emerald-400 bg-emerald-50/30`
                            : `border-gray-200 focus:ring-indigo-400 hover:border-gray-300`
                        }`}
                      />
                      {filled && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigate between tabs */}
            <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100">
              <button
                onClick={() => {
                  const idx = TABS.indexOf(activeTab);
                  if (idx > 0) setActiveTab(TABS[idx - 1]);
                }}
                disabled={TABS.indexOf(activeTab) === 0}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                {TABS[TABS.indexOf(activeTab) - 1] ?? ""}
              </button>

              <span className="text-xs text-gray-400 font-medium">
                {TABS.indexOf(activeTab) + 1} of {TABS.length}
              </span>

              <button
                onClick={() => {
                  const idx = TABS.indexOf(activeTab);
                  if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1]);
                }}
                disabled={TABS.indexOf(activeTab) === TABS.length - 1}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {TABS[TABS.indexOf(activeTab) + 1] ?? ""}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Save bar ────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 flex items-center gap-4 flex-wrap">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-60 transition-all shadow-sm shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5"
        >
          {saving ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Saving…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Save All Data
            </>
          )}
        </button>

        <Link
          href={`/team/preview/${clientId}/${month}`}
          className="inline-flex items-center gap-2 text-indigo-600 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Preview Report
        </Link>

        <div className="ml-auto text-xs text-gray-400 hidden sm:block">
          {filledCount === TABS.length
            ? "✓ All platforms filled"
            : `${TABS.length - filledCount} platform${TABS.length - filledCount !== 1 ? "s" : ""} still empty`}
        </div>
      </div>
    </div>
  );
}
