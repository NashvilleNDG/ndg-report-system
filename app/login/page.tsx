"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

// NDG cube mark (matches sidebar)
function NDGCubeMark() {
  return (
    <svg width="40" height="43" viewBox="0 0 52 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lp-top" x1="0" y1="0" x2="1" y2="0.6" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#29d4ff"/>
          <stop offset="100%" stopColor="#00a8e8"/>
        </linearGradient>
        <linearGradient id="lp-right" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#0090d0"/>
          <stop offset="100%" stopColor="#0060a8"/>
        </linearGradient>
        <linearGradient id="lp-left" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#6644c0"/>
          <stop offset="100%" stopColor="#3a1878"/>
        </linearGradient>
      </defs>
      <polygon points="26,2 50,15 26,28 2,15" fill="url(#lp-top)"/>
      <polygon points="50,15 50,40 26,53 26,28" fill="url(#lp-right)"/>
      <polygon points="2,15 26,28 26,53 2,40" fill="url(#lp-left)"/>
      <polygon points="26,6 46,17 26,24 6,17" fill="white" opacity="0.88"/>
      <polygon points="6,17 13,13 13,18 6,22" fill="#18c8ec"/>
      <polygon points="39,13 46,17 46,22 39,18" fill="#18c8ec"/>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #e8eeff 0%, #f0e8ff 50%, #e8f4ff 100%)",
      }}
    >
      {/* Soft background blobs */}
      <div className="absolute top-[-8%] left-[-4%] w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(0,174,239,0.12)" }} />
      <div className="absolute bottom-[-8%] right-[-4%] w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(92,61,159,0.12)" }} />
      <div className="absolute top-[45%] right-[8%] w-64 h-64 rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(0,174,239,0.08)" }} />

      {/* Card */}
      <div className="w-full max-w-[420px] relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.06)" }}>

          {/* Card top accent bar — NDG gradient */}
          <div className="h-1.5 w-full"
            style={{ background: "linear-gradient(90deg, #00aeef 0%, #6644c0 100%)" }} />

          <div className="px-8 pt-8 pb-9">

            {/* Logo */}
            <div className="flex flex-col items-center mb-7">
              <div className="mb-4 drop-shadow-md">
                <NDGCubeMark />
              </div>
              <h1 className="text-[18px] font-black tracking-tight text-gray-900 uppercase">
                Nashville Digital Group
              </h1>
              <p className="text-[12px] font-semibold tracking-[0.18em] uppercase mt-0.5"
                style={{ color: "#00aeef" }}>
                Reports Platform
              </p>
            </div>

            {/* Heading */}
            <div className="mb-6 text-center">
              <h2 className="text-[22px] font-bold text-gray-900 tracking-tight">Welcome back</h2>
              <p className="text-gray-500 text-sm mt-1">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 transition-all"
                    style={{ ["--tw-ring-color" as string]: "#00aeef40" }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#00aeef";
                      e.target.style.boxShadow = "0 0 0 3px rgba(0,174,239,0.12)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "";
                      e.target.style.boxShadow = "";
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-700">Password</label>
                  <a
                    href="/forgot-password"
                    className="text-xs font-semibold transition-colors"
                    style={{ color: "#00aeef" }}
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-gray-50 border border-gray-200 focus:outline-none transition-all"
                    onFocus={(e) => {
                      e.target.style.borderColor = "#00aeef";
                      e.target.style.boxShadow = "0 0 0 3px rgba(0,174,239,0.12)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "";
                      e.target.style.boxShadow = "";
                    }}
                  />
                  {/* Show / hide password toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-400 hover:text-gray-600 transition-colors rounded-r-xl"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      /* Eye-off */
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      /* Eye */
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium bg-red-50 border border-red-200">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-700">{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl text-[15px] font-bold text-white mt-2 transition-all duration-200 disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg, #00aeef 0%, #0070c0 50%, #6644c0 100%)",
                  boxShadow: "0 4px 18px rgba(0,174,239,0.4)",
                }}
                onMouseEnter={(e) => {
                  if (!loading) (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "";
                }}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2 justify-center">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing in…
                  </span>
                ) : "Sign in"}
              </button>

            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-5">
          Nashville Digital Group — Confidential &amp; Proprietary
        </p>
      </div>
    </div>
  );
}
