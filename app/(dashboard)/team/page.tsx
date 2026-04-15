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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Select a client to enter or upload report data.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Month Picker */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
            <label className="text-sm font-medium text-gray-600">Month:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-sm text-gray-900 focus:outline-none"
            />
          </div>
          <Link
            href="/team/upload"
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <span>📤</span> Upload Excel / Drive
          </Link>
        </div>
      </div>

      {activeClients.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
          No active clients found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeClients.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <h2 className="text-base font-semibold text-gray-900">{client.name}</h2>
                {client.industry && (
                  <p className="text-sm text-gray-400 mt-0.5">{client.industry}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/team/entry/${client.id}/${selectedMonth}`}
                  className="flex-1 text-center bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Enter Data
                </Link>
                <Link
                  href="/team/upload"
                  className="flex-1 text-center bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Upload
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
