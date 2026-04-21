"use client";

import { useEffect, useState } from "react";

interface Me {
  id: string;
  name: string;
  email: string;
  role: string;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrator",
  TEAM:  "Team Member",
  CLIENT:"Client",
};

// NDG brand palette — same colours as the sidebar/logo
const NDG_DARK  = "#0b1628";
const NDG_MID   = "#0d2240";
const NDG_CYAN  = "#00aeef";
const NDG_CYAN2 = "#00c2f0";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

function PasswordField({
  label, value, onChange, placeholder, required, minLength,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; minLength?: number;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          required={required}
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-11 text-sm bg-gray-50/70 hover:bg-white transition-colors outline-none"
          style={{ ["--tw-ring-color" as string]: NDG_CYAN }}
          onFocus={e => (e.currentTarget.style.boxShadow = `0 0 0 2px ${NDG_CYAN}40`, e.currentTarget.style.borderColor = NDG_CYAN)}
          onBlur={e  => (e.currentTarget.style.boxShadow = "",                         e.currentTarget.style.borderColor = "")}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
          style={{ color: "rgba(0,174,239,0.5)" }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = NDG_CYAN)}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "rgba(0,174,239,0.5)")}
          tabIndex={-1}
        >
          <EyeIcon open={show} />
        </button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving]   = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/me").then((r) => r.ok ? r.json() : null).then(setMe);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (newPassword !== confirmPassword) { setMessage({ text: "New passwords do not match.", ok: false }); return; }
    if (newPassword.length < 6)          { setMessage({ text: "Password must be at least 6 characters.", ok: false }); return; }

    setSaving(true);
    try {
      const res  = await fetch("/api/me", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword, newPassword }) });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Failed to change password");
      setMessage({ text: "Password updated successfully!", ok: true });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Something went wrong", ok: false });
    } finally {
      setSaving(false);
    }
  };

  const roleLabel = me?.role ? (ROLE_LABELS[me.role] ?? me.role) : "—";
  const initial   = me?.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="max-w-2xl mx-auto space-y-5 page-content">

      {/* ── Profile Hero ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Banner — NDG dark navy → cyan */}
        <div className="relative h-32 overflow-hidden" style={{ background: `linear-gradient(135deg, ${NDG_DARK} 0%, ${NDG_MID} 50%, #0a3a5c 100%)` }}>
          {/* Cyan glow streak */}
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 80% at 80% 50%, ${NDG_CYAN}22 0%, transparent 70%)` }} />
          {/* Dot pattern */}
          <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.07 }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="ndg-dots" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill={NDG_CYAN}/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ndg-dots)" />
          </svg>
          {/* Cyan accent line at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${NDG_CYAN}80, transparent)` }} />
        </div>

        {/* Avatar + role badge */}
        <div className="px-6 flex items-end justify-between mb-5" style={{ marginTop: "-38px" }}>
          {/* Avatar */}
          <div className="relative">
            {/* White ring */}
            <div className="w-[78px] h-[78px] rounded-full bg-white flex items-center justify-center shadow-2xl">
              {/* NDG gradient inner circle */}
              <div className="w-[66px] h-[66px] rounded-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${NDG_MID}, #0a3a5c, ${NDG_CYAN}cc)` }}>
                <span className="font-black text-2xl tracking-tight select-none"
                  style={{ color: "#fff", textShadow: `0 0 16px ${NDG_CYAN}, 0 2px 8px rgba(0,0,0,0.4)` }}>
                  {initial}
                </span>
              </div>
            </div>
            {/* Online dot */}
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 border-2 border-white rounded-full shadow-sm"
              style={{ background: "#34d399" }} />
          </div>

          {/* Role badge — NDG cyan style */}
          <div className="mb-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border"
            style={{ color: NDG_CYAN, borderColor: `${NDG_CYAN}40`, background: `${NDG_CYAN}10` }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: NDG_CYAN }} />
            {roleLabel}
          </div>
        </div>

        {/* Name + email */}
        <div className="px-6 pb-1">
          <h1 className="text-xl font-bold text-gray-900 leading-tight">{me?.name ?? "—"}</h1>
          <p className="text-sm mt-0.5" style={{ color: NDG_CYAN + "99" }}>{me?.email ?? "—"}</p>
        </div>

        {/* Info rows */}
        <div className="mx-6 mt-5 mb-6 rounded-xl border overflow-hidden divide-y"
          style={{ borderColor: `${NDG_CYAN}18`, divideColor: `${NDG_CYAN}10`, background: `${NDG_DARK}05` }}>

          {/* Full Name */}
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border"
              style={{ background: `${NDG_CYAN}10`, borderColor: `${NDG_CYAN}25`, color: NDG_CYAN }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: NDG_CYAN + "80" }}>Full Name</p>
              <p className="text-sm text-gray-800 font-semibold mt-0.5 truncate">{me?.name ?? "—"}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border"
              style={{ background: `${NDG_CYAN}10`, borderColor: `${NDG_CYAN}25`, color: NDG_CYAN }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: NDG_CYAN + "80" }}>Email Address</p>
              <p className="text-sm text-gray-800 font-semibold mt-0.5 truncate">{me?.email ?? "—"}</p>
            </div>
            <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              Verified
            </span>
          </div>

          {/* Role */}
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border"
              style={{ background: `${NDG_CYAN}10`, borderColor: `${NDG_CYAN}25`, color: NDG_CYAN }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: NDG_CYAN + "80" }}>Account Role</p>
              <p className="text-sm text-gray-800 font-semibold mt-0.5">{roleLabel}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Security / Change Password ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Section header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${NDG_MID}, ${NDG_CYAN})` }}>
            <svg className="w-[18px] h-[18px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Security Settings</h2>
            <p className="text-xs text-gray-400 mt-0.5">Update your account password</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-[10.5px] font-semibold px-2.5 py-1 rounded-lg border"
            style={{ color: NDG_CYAN, background: `${NDG_CYAN}0d`, borderColor: `${NDG_CYAN}30` }}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Password Protected
          </div>
        </div>

        {/* Tip banner */}
        <div className="mx-6 mt-5 flex items-start gap-2.5 rounded-xl px-4 py-3 border"
          style={{ background: `${NDG_CYAN}08`, borderColor: `${NDG_CYAN}28` }}>
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: NDG_CYAN }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs leading-relaxed" style={{ color: NDG_CYAN + "cc" }}>
            Choose a strong password with at least 6 characters. Never share your password with anyone.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <PasswordField
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
            placeholder="Enter your current password"
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PasswordField
              label="New Password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
            <PasswordField
              label="Confirm New Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Repeat new password"
              required
              minLength={6}
            />
          </div>

          {/* Password match indicator */}
          {newPassword && confirmPassword && (
            <div className={`flex items-center gap-2 text-xs font-medium ${newPassword === confirmPassword ? "text-emerald-600" : "text-red-500"}`}>
              {newPassword === confirmPassword ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Passwords match
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Passwords do not match
                </>
              )}
            </div>
          )}

          {message && (
            <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium ${
              message.ok
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}>
              {message.ok ? (
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {message.text}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400">Must be at least 6 characters long.</p>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 transition-all"
              style={{
                background: `linear-gradient(135deg, ${NDG_MID}, ${NDG_CYAN})`,
                boxShadow: `0 4px 14px ${NDG_CYAN}40`,
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = "0.9")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}
            >
              {saving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
