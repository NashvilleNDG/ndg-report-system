"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Something went wrong");
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">NDG Reports</span>
            </div>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="text-5xl">📬</div>
              <h2 className="text-xl font-semibold text-gray-800">Check your email</h2>
              <p className="text-sm text-gray-500">
                If an account exists for <strong>{email}</strong>, you'll receive a password reset link shortly. The link expires in 1 hour.
              </p>
              <Link
                href="/login"
                className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-gray-800 text-center mb-1">Forgot password?</h1>
              <p className="text-sm text-gray-500 text-center mb-8">
                Enter your email and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="you@example.com"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
                >
                  {loading ? "Sending…" : "Send reset link"}
                </button>

                <div className="text-center">
                  <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700">
                    ← Back to sign in
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">NDG Report System — Confidential</p>
      </div>
    </div>
  );
}
