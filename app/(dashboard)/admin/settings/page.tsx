"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/Toast";

/* ─── Types ──────────────────────────────────────────────────────────────────── */
interface Client {
  id: string;
  name: string;
}

interface DriveConfig {
  driveFileId: string;
  driveFileName: string | null;
  sheetName: string | null;
  lastSyncedAt: string | null;
  syncStatus: string | null;
}

/* ─── SVG Icons ──────────────────────────────────────────────────────────────── */
function IconDrive({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12H2" />
      <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
      <line x1="6" y1="16" x2="6.01" y2="16" />
      <line x1="10" y1="16" x2="10.01" y2="16" />
    </svg>
  );
}

function IconSheet({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M3 15h18M9 3v18" />
    </svg>
  );
}

function IconDownload({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconCopy({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconUsers({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

/* ─── Existing File IDs hook ─────────────────────────────────────────────────── */
function useExistingFileIds() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    const stored = localStorage.getItem("ndg_drive_file_ids");
    if (stored) setIds(JSON.parse(stored));
  }, []);
  const addId = (id: string) => {
    setIds((prev) => {
      const next = Array.from(new Set([id, ...prev])).slice(0, 10);
      localStorage.setItem("ndg_drive_file_ids", JSON.stringify(next));
      return next;
    });
  };
  return { ids, addId };
}

/* ─── Status Badge ───────────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string | null }) {
  if (!status) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
        Not configured
      </span>
    );
  }
  if (status === "OK") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Synced
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
      {status}
    </span>
  );
}

/* ─── Skeleton Row ───────────────────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gray-200" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 w-32 bg-gray-200 rounded-full" />
          <div className="h-2.5 w-20 bg-gray-200 rounded-full" />
        </div>
        <div className="h-6 w-24 bg-gray-200 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-9 bg-gray-200 rounded-lg" />
        <div className="h-9 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}

/* ─── Empty State ────────────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <IconUsers className="w-8 h-8 text-gray-400" />
      </div>
      <p className="text-sm font-semibold text-gray-700 mb-1">No clients yet</p>
      <p className="text-xs text-gray-400 max-w-56 leading-relaxed">
        Create clients first and they will appear here for Drive configuration.
      </p>
    </div>
  );
}

/* ─── DriveConfigRow ─────────────────────────────────────────────────────────── */
function DriveConfigRow({
  client,
  existingFileIds,
  onFileSaved,
}: {
  client: Client;
  existingFileIds: string[];
  onFileSaved: (id: string) => void;
}) {
  const toast = useToast();
  const [config, setConfig] = useState<DriveConfig | null>(null);
  const [form, setForm] = useState({ driveFileId: "", sheetName: "" });
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/sync/drive?clientId=${client.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setConfig(data);
          setForm({ driveFileId: data.driveFileId ?? "", sheetName: data.sheetName ?? "" });
        }
      });
  }, [client.id]);

  /* Close dropdown on outside click */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showDropdown]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/sync/drive/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: client.id, ...form }),
    });
    const data = await res.json();
    if (res.ok) {
      setConfig(data);
      if (form.driveFileId) onFileSaved(form.driveFileId);
      toast.success("Drive config saved!", "Changes will take effect on next sync.");
    } else {
      toast.error("Save failed", data.error ?? "An unexpected error occurred.");
    }
    setSaving(false);
  };

  const handleCopy = () => {
    if (!form.driveFileId) return;
    navigator.clipboard.writeText(form.driveFileId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const avatarLetter = client.name.charAt(0).toUpperCase();
  const dropdownOptions = existingFileIds.filter((id) => id !== form.driveFileId);

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3">
          {/* Gradient avatar */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white text-sm font-bold">{avatarLetter}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">{client.name}</p>
            {config?.lastSyncedAt ? (
              <p className="text-xs text-gray-400 mt-0.5">
                Last synced {new Date(config.lastSyncedAt).toLocaleString()}
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-0.5">Never synced</p>
            )}
          </div>
        </div>
        <StatusBadge status={config?.syncStatus ?? null} />
      </div>

      {/* Form body */}
      <form onSubmit={handleSave} className="px-5 py-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Drive File ID */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Drive File ID
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                required
                value={form.driveFileId}
                onChange={(e) => setForm((f) => ({ ...f, driveFileId: e.target.value }))}
                placeholder="Paste Google Drive file ID"
                className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 placeholder:text-gray-300 placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              />
              {/* Copy button */}
              <button
                type="button"
                onClick={handleCopy}
                disabled={!form.driveFileId}
                title="Copy file ID"
                className="flex-shrink-0 w-9 flex items-center justify-center border border-gray-200 rounded-lg bg-white hover:bg-indigo-50 hover:border-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {copied ? (
                  <IconCheck className="w-4 h-4 text-emerald-600" />
                ) : (
                  <IconCopy className="w-4 h-4 text-gray-400 hover:text-indigo-600" />
                )}
              </button>
              {/* Recent IDs dropdown */}
              {dropdownOptions.length > 0 && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowDropdown((v) => !v)}
                    title="Use a recent file ID"
                    className="flex-shrink-0 w-9 flex items-center justify-center border border-gray-200 rounded-lg bg-white hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                  >
                    <IconChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
                  </button>
                  {showDropdown && (
                    <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-xl min-w-72 overflow-hidden">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-3 pt-3 pb-1">
                        Recently used
                      </p>
                      {dropdownOptions.map((id) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => {
                            setForm((f) => ({ ...f, driveFileId: id }));
                            setShowDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2.5 text-xs font-mono text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors border-t border-gray-100 first:border-0 truncate"
                        >
                          {id}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sheet Name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Sheet Name <span className="text-gray-400 font-normal">(tab)</span>
            </label>
            <input
              type="text"
              value={form.sheetName}
              onChange={(e) => setForm((f) => ({ ...f, sheetName: e.target.value }))}
              placeholder="e.g. college-place"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
            />
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end pt-1">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {saving ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                </svg>
                Saving
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─── Section Card wrapper ────────────────────────────────────────────────────── */
function SectionCard({
  accentClass,
  iconBgClass,
  icon,
  title,
  subtitle,
  children,
}: {
  accentClass: string;
  iconBgClass: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Top accent bar */}
      <div className={`h-1 w-full ${accentClass}`} />
      {/* Section header */}
      <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100">
        <div className={`w-10 h-10 rounded-xl ${iconBgClass} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          {icon}
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      {/* Body */}
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */
export default function AdminSettingsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { ids: existingFileIds, addId } = useExistingFileIds();

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setClients(data))
      .finally(() => setLoading(false));
  }, []);

  /* Pre-load existing file IDs from all client configs */
  useEffect(() => {
    if (clients.length === 0) return;
    clients.forEach((c) => {
      fetch(`/api/sync/drive?clientId=${c.id}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.driveFileId) addId(data.driveFileId);
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clients]);

  return (
    <div className="max-w-3xl space-y-2">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 mt-1.5">
          Manage Google Drive integrations and download report templates.
        </p>
      </div>

      <div className="space-y-6">
        {/* ── Google Drive Integration ── */}
        <SectionCard
          accentClass="bg-gradient-to-r from-indigo-500 to-violet-500"
          iconBgClass="bg-gradient-to-br from-indigo-500 to-violet-600"
          icon={<IconDrive className="w-5 h-5 text-white" />}
          title="Google Drive Integration"
          subtitle="Configure the Drive file and sheet tab for each client."
        >
          {loading ? (
            <div className="space-y-4">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : clients.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {clients.map((c) => (
                <DriveConfigRow
                  key={c.id}
                  client={c}
                  existingFileIds={existingFileIds}
                  onFileSaved={addId}
                />
              ))}
            </div>
          )}
        </SectionCard>

        {/* ── Excel Template ── */}
        <SectionCard
          accentClass="bg-gradient-to-r from-emerald-500 to-teal-500"
          iconBgClass="bg-gradient-to-br from-emerald-500 to-teal-600"
          icon={<IconSheet className="w-5 h-5 text-white" />}
          title="Excel Template"
          subtitle="Download the standard Excel template used for data entry and reporting."
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-800">NDG Report Template</p>
              <p className="text-xs text-gray-400">
                .xlsx format &mdash; compatible with Microsoft Excel and Google Sheets
              </p>
            </div>
            <a
              href="/api/template"
              download
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm shadow-emerald-200 transition-all flex-shrink-0"
            >
              <IconDownload className="w-4 h-4" />
              Download Template
            </a>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
