"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { currentPeriod } from "@/lib/report-utils";

interface Client {
  id: string;
  name: string;
  industry: string | null;
  isActive: boolean;
}

export default function TeamDashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(currentPeriod());

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.ok ? r.json() : [])
      .then(setClients);
  }, []);

  const activeClients = clients.filter((c) => c.isActive);

  // Format selected month for display
  const displayMonth = (() => {
    if (!selectedMonth) return "";
    const [year, month] = selectedMonth.split("-");
    return new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  })();

  return (
    <div className="space-y-6 page-content">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Select a reporting period, then enter data for each client.</p>
        </div>
        <Link
          href="/team/upload"
          className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload Excel / Drive
        </Link>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Reporting Period</p>
              <p className="text-xs text-gray-400 mt-0.5">Entering data for: <span className="font-semibold text-indigo-600">{displayMonth}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Client Cards */}
      {activeClients.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <svg className="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-gray-400 font-medium">No active clients found.</p>
          <p className="text-xs text-gray-300 mt-1">Ask an admin to add and activate clients.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {activeClients.length} active client{activeClients.length !== 1 ? "s" : ""} — click &ldquo;Enter Data&rdquo; to add {displayMonth} data
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
            {activeClients.map((client) => (
              <div
                key={client.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4 hover:shadow-lg hover:border-gray-200 hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
                    <span className="text-white font-black text-sm">{client.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-bold text-gray-900 truncate">{client.name}</h2>
                    {client.industry && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{client.industry}</p>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-400 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Period: <span className="font-medium text-gray-600">{displayMonth}</span>
                </div>

                <div className="flex gap-2 pt-1 border-t border-gray-50">
                  <Link
                    href={`/team/entry/${client.id}/${selectedMonth}`}
                    className="flex-1 text-center bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Enter Data
                  </Link>
                  <Link
                    href={`/team/preview/${client.id}/${selectedMonth}`}
                    className="px-3 text-center bg-gray-100 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center justify-center"
                    title="Preview report"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
