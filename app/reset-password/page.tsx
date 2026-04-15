"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) setError("Invalid reset link. Please request a new one.");
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to reset password");
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">NDG Reports</span>
        </div>
      </div>

      {success ? (
        <div className="text-center space-y-4">
          <div className="text-5xl">✅</div>
          <h2 className="text-xl font-semibold text-gray-800">Password updated!</h2>
          <p className="text-sm text-gray-500">Redirecting you to sign in…</p>
          <Link href="/login" className="inline-block text-sm text-blue-600 hover:text-blue-800 font-medium">
            Sign in now →
          </Link>
        </div>
      ) : (
        <>
          <h1 className="text-xl font-semibold text-gray-800 text-center mb-1">Set new password</h1>
          <p className="text-sm text-gray-500 text-center mb-8">Choose a strong password for your account.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
            >
              {loading ? "Saving…" : "Reset Password"}
            </button>

            <div className="text-center">
              <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700">← Back to sign in</Link>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="bg-white rounded-2xl p-8 text-center text-gray-400">Loading…</div>}>
          <ResetPasswordForm />
        </Suspense>
        <p className="text-center text-xs text-slate-400 mt-6">NDG Report System — Confidential</p>
      </div>
    </div>
  );
}
