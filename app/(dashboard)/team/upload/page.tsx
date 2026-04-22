"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/Toast";

interface Client {
  id: string;
  name: string;
}

interface SyncStatus {
  lastSyncedAt: string | null;
  syncStatus:   string | null;
  syncError:    string | null;
}

// ── Drag-and-drop file zone ───────────────────────────────────────────────────
function DropZone({
  file,
  onFile,
  disabled,
}: {
  file: File | null;
  onFile: (f: File | null) => void;
  disabled?: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (disabled) return;
      const dropped = e.dataTransfer.files[0];
      if (dropped?.name.endsWith(".xlsx")) onFile(dropped);
    },
    [disabled, onFile]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
        disabled
          ? "opacity-50 cursor-not-allowed border-gray-200 bg-gray-50"
          : dragging
          ? "border-indigo-400 bg-indigo-50 scale-[1.01]"
          : file
          ? "border-emerald-300 bg-emerald-50"
          : "border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/50"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />

      {file ? (
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-emerald-700 truncate max-w-[200px]">{file.name}</p>
            <p className="text-xs text-emerald-500">{(file.size / 1024).toFixed(1)} KB · Ready to upload</p>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onFile(null); }}
            className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg hover:bg-emerald-100 text-emerald-400 hover:text-emerald-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto transition-colors ${dragging ? "bg-indigo-100" : "bg-gray-100"}`}>
            <svg className={`w-6 h-6 transition-colors ${dragging ? "text-indigo-600" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <div>
            <p className={`text-sm font-semibold ${dragging ? "text-indigo-700" : "text-gray-600"}`}>
              {dragging ? "Drop your file here" : "Drag & drop your .xlsx file"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">or click to browse · .xlsx files only</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function TeamUploadPage() {
  const toast = useToast();
  const [clients, setClients]   = useState<Client[]>([]);
  const [loading, setLoading]   = useState(true);

  // Excel upload
  const [uploadClientId, setUploadClientId] = useState("");
  const [file, setFile]                     = useState<File | null>(null);
  const [uploading, setUploading]           = useState(false);

  // Drive sync
  const [syncClientId, setSyncClientId] = useState("");
  const [syncStatus, setSyncStatus]     = useState<SyncStatus | null>(null);
  const [syncing, setSyncing]           = useState(false);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => { setClients(data); setLoading(false); });
  }, []);

  const fetchSyncStatus = async (clientId: string) => {
    if (!clientId) return;
    const res = await fetch(`/api/sync/drive?clientId=${clientId}`);
    if (res.ok) setSyncStatus(await res.json());
    else setSyncStatus(null);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !uploadClientId) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("clientId", uploadClientId);
    const res  = await fetch("/api/upload/excel", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) {
      toast.success(
        `Imported ${data.imported ?? 0} period${(data.imported ?? 0) !== 1 ? "s" : ""}`,
        (data.periods ?? []).length > 0 ? `Periods: ${(data.periods as string[]).join(", ")}` : undefined
      );
      setFile(null);
      setUploadClientId("");
    } else {
      toast.error("Upload failed", data.error ?? "An unexpected error occurred.");
    }
    setUploading(false);
  };

  const handleSync = async () => {
    if (!syncClientId) return;
    setSyncing(true);
    const res  = await fetch("/api/sync/drive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: syncClientId }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(`Synced ${data.imported ?? 0} period${(data.imported ?? 0) !== 1 ? "s" : ""} from Google Drive`);
      fetchSyncStatus(syncClientId);
    } else {
      toast.error("Sync failed", data.error ?? "An unexpected error occurred.");
    }
    setSyncing(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Data</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Import report data via Excel or sync directly from Google Drive.
        </p>
      </div>

      {/* ── Excel Upload ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center border border-white/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Upload Excel</h2>
            <p className="text-xs text-emerald-100">Import a .xlsx file to populate report data</p>
          </div>
        </div>

        <form onSubmit={handleUpload} className="p-6 space-y-5">
          {/* Client selector */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              Client
            </label>
            <select
              required
              value={uploadClientId}
              onChange={(e) => setUploadClientId(e.target.value)}
              disabled={loading}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors disabled:opacity-60"
            >
              <option value="">— Select Client —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Drag & Drop zone */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              File (.xlsx)
            </label>
            <DropZone file={file} onFile={setFile} disabled={!uploadClientId} />
            {!uploadClientId && (
              <p className="text-xs text-gray-400 mt-1.5">Select a client first to enable file upload.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={uploading || !file || !uploadClientId}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {uploading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Uploading…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload File
              </>
            )}
          </button>
        </form>
      </div>

      {/* ── Google Drive Sync ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center border border-white/20">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.28 3l5.72 9.9L4.35 21H2.5L9.86 9l-4-6.93L6.28 3zm5.44 0h2.56l7.22 12.5-1.28 2.22L14.86 9l-3.14-5.44V3zM4.35 21l1.28-2.22h13.44L20.35 21H4.35z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Sync from Google Drive</h2>
            <p className="text-xs text-blue-100">Pull data from the configured Drive sheet</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Client selector */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              Client
            </label>
            <select
              value={syncClientId}
              onChange={(e) => {
                setSyncClientId(e.target.value);
                fetchSyncStatus(e.target.value);
              }}
              disabled={loading}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors disabled:opacity-60"
            >
              <option value="">— Select Client —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Sync status */}
          {syncClientId && syncStatus && (
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-400 text-xs">Last synced:</span>
                <span className="text-xs font-medium text-gray-700">
                  {syncStatus.lastSyncedAt
                    ? new Date(syncStatus.lastSyncedAt).toLocaleString()
                    : "Never"}
                </span>
              </div>
              {syncStatus.syncStatus && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs">Status:</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                    syncStatus.syncStatus === "OK"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}>
                    {syncStatus.syncStatus}
                  </span>
                </div>
              )}
              {syncStatus.syncError && (
                <p className="text-xs text-red-500 mt-1">{syncStatus.syncError}</p>
              )}
            </div>
          )}

          <button
            onClick={handleSync}
            disabled={syncing || !syncClientId}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {syncing ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Syncing…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sync Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
