"use client";

import { signOut } from "next-auth/react";

interface TopbarProps {
  user: { name: string; email: string; role: string };
}

export default function Topbar({ user }: TopbarProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <div />
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-700 font-semibold text-sm">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors border border-gray-200 px-3 py-1.5 rounded-lg"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
