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
  TEAM: "Team Member",
  CLIENT: "Client",
};

const ROLE_STYLES: Record<string, string> = {
  ADMIN: "bg-violet-100 text-violet-700 border border-violet-200",
  TEAM: "bg-sky-100 text-sky-700 border border-sky-200",
  CLIENT: "bg-emerald-100 text-emerald-700 border border-emerald-200",
};

const AVATAR_STYLES: Record<string, string> = {
  ADMIN: "from-violet-500 to-purple-600",
  TEAM: "from-sky-500 to-blue-600",
  CLIENT: "from-emerald-500 to-teal-600",
};

export default function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/me").then((r) => r.ok ? r.json() : null).then(setMe);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ text: "New passwords do not match.", ok: false });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ text: "Password must be at least 6 characters.", ok: false });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Failed to change password");
      }
      setMessage({ text: "Password changed successfully!", ok: true });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Something went wrong", ok: false });
    } finally {
      setSaving(false);
    }
  };

  const avatarGradient = me?.role ? (AVATAR_STYLES[me.role] ?? "from-indigo-500 to-blue-600") : "from-gray-400 to-gray-500";
  const roleStyle = me?.role ? (ROLE_STYLES[me.role] ?? "") : "";

  return (
    <div className="max-w-2xl space-y-6 page-content">
      {/* Profile Hero Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className={`h-24 bg-gradient-to-r ${avatarGradient} opacity-90`} />
        <div className="px-6 pb-6">
          {/* Avatar overlapping banner */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className={`w-20 h-20 bg-gradient-to-br ${avatarGradient} rounded-2xl flex items-center justify-center shadow-lg border-4 border-white`}>
              <span className="text-white font-black text-3xl">
                {me?.name?.charAt(0).toUpperCase() ?? "?"}
              </span>
            </div>
            <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${roleStyle}`}>
              {me?.role ? (ROLE_LABELS[me.role] ?? me.role) : "—"}
            </span>
          </div>
          {/* User info */}
          <div>
            <h1 className="text-xl font-bold text-gray-900">{me?.name ?? "—"}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{me?.email ?? "—"}</p>
          </div>
          {/* Info grid */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Full Name</p>
              <p className="text-sm text-gray-800 font-medium">{me?.name ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Email Address</p>
              <p className="text-sm text-gray-800 font-medium">{me?.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Account Role</p>
              <p className="text-sm text-gray-800 font-medium">{me?.role ? (ROLE_LABELS[me.role] ?? me.role) : "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800">Change Password</h2>
            <p className="text-xs text-gray-400 mt-0.5">Update your account password below</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
              placeholder="Enter your current password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
              placeholder="At least 6 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
              placeholder="Repeat new password"
            />
          </div>

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

          <div className="pt-1">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors shadow-sm"
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
