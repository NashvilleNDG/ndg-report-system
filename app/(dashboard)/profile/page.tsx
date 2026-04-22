"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/Toast";

interface Me { id: string; name: string; email: string; role: string }

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrator", TEAM: "Team Member", CLIENT: "Client",
};

// Modern vibrant palette
const P = {
  bg0:   "#0f0e17",   // near-black base
  bg1:   "#1a1040",   // deep indigo
  bg2:   "#2d1b69",   // rich violet
  v1:    "#6366f1",   // indigo
  v2:    "#8b5cf6",   // violet
  v3:    "#a855f7",   // purple
  pink:  "#ec4899",   // fuchsia accent
  light: "#ede9fe",   // very light violet
};

/* ── Eye icon ───────────────────────────────────────────────────────── */
function Eye({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-[17px] h-[17px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
    </svg>
  ) : (
    <svg className="w-[17px] h-[17px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
    </svg>
  );
}

/* ── Password field ─────────────────────────────────────────────────── */
function PwField({ label, value, onChange, placeholder, required, minLength }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; minLength?: number;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: P.v2 }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          required={required} minLength={minLength} value={value}
          onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full rounded-xl border bg-gray-50 px-4 py-3 pr-11 text-sm text-gray-800 placeholder-gray-400 transition-all outline-none"
          style={{ borderColor: "#e5e7eb" }}
          onFocus={e  => { e.currentTarget.style.borderColor = P.v2; e.currentTarget.style.boxShadow = `0 0 0 3px ${P.v2}25`; e.currentTarget.style.background = "#fff"; }}
          onBlur={e   => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.background = "#f9fafb"; }}
        />
        <button type="button" onClick={() => setShow(s => !s)} tabIndex={-1}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
          style={{ color: "#c4b5fd" }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = P.v2)}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "#c4b5fd")}>
          <Eye open={show} />
        </button>
      </div>
    </div>
  );
}

/* ── Info row ───────────────────────────────────────────────────────── */
function InfoRow({ icon, label, value, right }: {
  icon: React.ReactNode; label: string; value: string; right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${P.v1}20, ${P.v3}15)`, color: P.v2, border: `1px solid ${P.v1}25` }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: P.v2 + "90" }}>{label}</p>
        <p className="text-sm font-semibold text-gray-800 truncate">{value || "—"}</p>
      </div>
      {right}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
export default function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [cur,  setCur]  = useState("");
  const [nw,   setNw]   = useState("");
  const [conf, setConf] = useState("");
  const [saving, setSaving] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => { fetch("/api/me").then(r => r.ok ? r.json() : null).then(setMe); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nw !== conf)   { toastError("Passwords don't match", "Please make sure both fields are identical."); return; }
    if (nw.length < 6) { toastError("Password too short", "Your password must be at least 6 characters."); return; }
    setSaving(true);
    try {
      const res  = await fetch("/api/me", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: cur, newPassword: nw }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      toastSuccess("Password updated!", "Your password has been changed successfully.");
      setCur(""); setNw(""); setConf("");
    } catch (err) {
      toastError("Update failed", err instanceof Error ? err.message : "Something went wrong.");
    } finally { setSaving(false); }
  };

  const roleLabel = me?.role ? (ROLE_LABELS[me.role] ?? me.role) : "—";
  const initial   = me?.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="max-w-xl mx-auto space-y-5 page-content">

      {/* ══ PROFILE CARD ═════════════════════════════════════════════════ */}
      <div className="rounded-2xl overflow-hidden shadow-xl" style={{ border: `1px solid ${P.v1}30` }}>

        {/* ── Banner ─────────────────────────────────────────────────── */}
        <div className="relative h-44 flex items-center justify-center overflow-hidden"
          style={{ background: `linear-gradient(145deg, ${P.bg0} 0%, ${P.bg1} 45%, ${P.bg2} 100%)` }}>

          {/* Glow orbs */}
          <div className="absolute -top-12 -left-12 w-56 h-56 rounded-full"
            style={{ background: P.v1, opacity: 0.18, filter: "blur(40px)" }} />
          <div className="absolute -bottom-16 right-0 w-64 h-64 rounded-full"
            style={{ background: P.pink, opacity: 0.12, filter: "blur(50px)" }} />
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full"
            style={{ background: P.v3, opacity: 0.15, filter: "blur(30px)" }} />

          {/* Dot grid */}
          <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.06 }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dp" width="22" height="22" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" fill="#a78bfa"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dp)" />
          </svg>

          {/* Bottom shimmer line */}
          <div className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${P.v2}80, ${P.pink}60, transparent)` }} />

          {/* ── Avatar ─────────────────────────────────────────────── */}
          <div className="relative z-10">
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-full"
              style={{ background: `conic-gradient(from 0deg, ${P.v1}, ${P.v3}, ${P.pink}, ${P.v1})`, padding: "3px", borderRadius: "9999px", filter: "blur(0px)" }}>
            </div>
            {/* Animated gradient ring wrapper */}
            <div className="relative w-[84px] h-[84px] rounded-full p-[3px]"
              style={{ background: `linear-gradient(135deg, ${P.v1}, ${P.v3}, ${P.pink}, ${P.v2})` }}>
              {/* Inner dark circle */}
              <div className="w-full h-full rounded-full flex items-center justify-center"
                style={{ background: `linear-gradient(145deg, ${P.bg1}, ${P.bg2})` }}>
                <span className="font-black text-[30px] tracking-tight select-none text-white"
                  style={{ textShadow: `0 0 24px ${P.v3}, 0 0 8px ${P.pink}80, 0 2px 4px rgba(0,0,0,0.6)` }}>
                  {initial}
                </span>
              </div>
            </div>
            {/* Online dot */}
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-[2.5px] border-white z-20"
              style={{ background: "linear-gradient(135deg, #10b981, #34d399)", boxShadow: "0 0 8px #10b98180" }} />
          </div>
        </div>

        {/* ── Identity ───────────────────────────────────────────────── */}
        <div className="bg-white px-6 pt-5 pb-3 flex flex-col items-center text-center">
          <h1 className="text-[22px] font-extrabold tracking-tight text-gray-900">{me?.name ?? "—"}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{me?.email ?? "—"}</p>

          {/* Animated role pill */}
          <div className="mt-3.5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold"
            style={{
              background: `linear-gradient(135deg, ${P.v1}18, ${P.v3}18)`,
              border: `1px solid ${P.v2}40`,
              color: P.v2,
            }}>
            <span className="relative flex w-2 h-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                style={{ background: P.v2 }} />
              <span className="relative inline-flex rounded-full w-2 h-2" style={{ background: P.v2 }} />
            </span>
            {roleLabel}
          </div>
        </div>

        {/* Gradient divider */}
        <div className="mx-6 my-3 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${P.v1}40, ${P.pink}30, transparent)` }} />

        {/* ── Info rows ──────────────────────────────────────────────── */}
        <div className="bg-white pb-5 divide-y divide-gray-50">
          <InfoRow
            label="Full Name" value={me?.name ?? ""}
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>}
          />
          <InfoRow
            label="Email Address" value={me?.email ?? ""}
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
            right={
              <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                Verified
              </span>
            }
          />
          <InfoRow
            label="Account Role" value={roleLabel}
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>}
          />
        </div>
      </div>

      {/* ══ SECURITY CARD ════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl" style={{ border: `1px solid ${P.v1}25` }}>

        {/* Gradient top bar */}
        <div className="h-1 w-full"
          style={{ background: `linear-gradient(90deg, ${P.v1}, ${P.v3}, ${P.pink})` }} />

        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-center gap-3 border-b border-gray-50">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${P.v1}, ${P.v3})`, boxShadow: `0 4px 14px ${P.v1}50` }}>
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-gray-900">Security Settings</h2>
            <p className="text-xs text-gray-400 mt-0.5">Update your account password</p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border"
            style={{ color: P.v2, background: `${P.v2}0e`, borderColor: `${P.v2}35` }}>
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            Protected
          </div>
        </div>

        <form onSubmit={submit} className="px-6 pt-5 pb-6 space-y-4">
          <PwField label="Current Password" value={cur}  onChange={setCur}  placeholder="Enter current password" required />
          <div className="grid grid-cols-2 gap-3">
            <PwField label="New Password"     value={nw}   onChange={setNw}   placeholder="Min 6 characters"  required minLength={6} />
            <PwField label="Confirm Password" value={conf} onChange={setConf} placeholder="Repeat password"   required minLength={6} />
          </div>

          {/* Match indicator */}
          {nw && conf && (
            <p className={`flex items-center gap-1.5 text-xs font-semibold ${nw === conf ? "text-emerald-500" : "text-red-400"}`}>
              {nw === conf
                ? <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> Passwords match</>
                : <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg> Passwords do not match</>}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Minimum 6 characters
            </p>
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${P.v1}, ${P.v3}, ${P.pink})`, boxShadow: `0 4px 18px ${P.v2}55` }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${P.v2}70`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 18px ${P.v2}55`; }}>
              {saving ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Saving…</>
              ) : (
                <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> Update Password</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
