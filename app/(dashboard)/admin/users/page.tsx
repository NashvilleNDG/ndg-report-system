"use client";

import { useEffect, useState } from "react";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { OWNER_EMAIL } from "@/lib/constants";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "TEAM" | "CLIENT";
  clientId: string | null;
  createdAt: string;
}

interface Client {
  id: string;
  name: string;
}

const ROLE_STYLES = {
  ADMIN: "bg-violet-100 text-violet-700 border border-violet-200",
  TEAM: "bg-sky-100 text-sky-700 border border-sky-200",
  CLIENT: "bg-emerald-100 text-emerald-700 border border-emerald-200",
};

const ROLE_AVATAR = {
  ADMIN: "from-violet-400 to-purple-600",
  TEAM: "from-sky-400 to-blue-500",
  CLIENT: "from-emerald-400 to-teal-500",
};

function UserModal({
  mode,
  user,
  clients,
  onClose,
  onDone,
}: {
  mode: "create" | "edit";
  user?: User;
  clients: Client[];
  onClose: () => void;
  onDone: () => void;
}) {
  const isOwner = mode === "edit" && user?.email === OWNER_EMAIL;

  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    password: "",
    role: user?.role ?? "CLIENT",
    clientId: user?.clientId ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const body: Record<string, string> = { name: form.name, email: form.email, role: form.role };
      if (mode === "create") {
        body.password = form.password;
      } else if (form.password) {
        body.password = form.password;
      }
      if (form.role === "CLIENT" && form.clientId) body.clientId = form.clientId;
      else if (form.role !== "CLIENT") body.clientId = "";

      const url = mode === "create" ? "/api/users" : `/api/users/${user!.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(typeof data.error === "string" ? data.error : "Failed to save");
      }
      onDone();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{mode === "create" ? "New User" : "Edit User"}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{mode === "create" ? "Create a new user account" : "Update user details"}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">
          {/* Owner notice */}
          {isOwner && (
            <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>System owner — email and role are locked and cannot be changed.</span>
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name <span className="text-red-400">*</span></label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                placeholder="John Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address <span className="text-red-400">*</span></label>
              <input
                type="email"
                required
                value={form.email}
                readOnly={isOwner}
                onChange={(e) => !isOwner && setForm((f) => ({ ...f, email: e.target.value }))}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none bg-gray-50 transition-colors ${
                  isOwner
                    ? "border-gray-200 text-gray-400 cursor-not-allowed select-none"
                    : "border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:bg-white"
                }`}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password{" "}
                {mode === "edit" && (
                  <span className="text-gray-400 font-normal text-xs">(leave blank to keep current)</span>
                )}
                {mode === "create" && <span className="text-red-400">*</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required={mode === "create"}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder={mode === "edit" ? "Leave blank to keep unchanged" : "Min. 6 characters"}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    /* Eye-off */
                    <svg className="w-4.5 h-4.5 w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    /* Eye */
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
              <select
                value={form.role}
                disabled={isOwner}
                onChange={(e) => !isOwner && setForm((f) => ({ ...f, role: e.target.value as "ADMIN" | "TEAM" | "CLIENT", clientId: "" }))}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none bg-gray-50 transition-colors ${
                  isOwner
                    ? "border-gray-200 text-gray-400 cursor-not-allowed opacity-70"
                    : "border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:bg-white"
                }`}
              >
                <option value="ADMIN">Administrator</option>
                <option value="TEAM">Team Member</option>
                <option value="CLIENT">Client</option>
              </select>
            </div>
            {form.role === "CLIENT" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign to Client</label>
                <select
                  value={form.clientId}
                  onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                >
                  <option value="">— Select Client —</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors shadow-sm">
                {loading ? "Saving…" : mode === "create" ? "Create User" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

type RoleFilter = "ALL" | "ADMIN" | "TEAM" | "CLIENT";

const FILTER_TABS: { label: string; value: RoleFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Client", value: "CLIENT" },
  { label: "Team", value: "TEAM" },
  { label: "Admin", value: "ADMIN" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: "create" | "edit"; user?: User } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");

  const fetchAll = async () => {
    setLoading(true);
    const [usersRes, clientsRes] = await Promise.all([fetch("/api/users"), fetch("/api/clients")]);
    if (usersRes.ok) setUsers(await usersRes.json());
    if (clientsRes.ok) setClients(await clientsRes.json());
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    setDeletingId(userId);
    await fetch(`/api/users/${userId}`, { method: "DELETE" });
    setDeletingId(null);
    fetchAll();
  };

  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c.name]));
  const filtered = roleFilter === "ALL" ? users : users.filter((u) => u.role === roleFilter);

  return (
    <div className="space-y-6 page-content">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.length} of {users.length} user{users.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setModal({ mode: "create" })}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New User
        </button>
      </div>

      {/* Role filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_TABS.map((tab) => {
          const count = tab.value === "ALL" ? users.length : users.filter((u) => u.role === tab.value).length;
          return (
            <button
              key={tab.value}
              onClick={() => setRoleFilter(tab.value)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                roleFilter === tab.value
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                roleFilter === tab.value ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                {["User", "Email", "Role", "Client", "Joined", ""].map((h) => (
                  <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <SkeletonTable rows={4} cols={6} />
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No {roleFilter !== "ALL" ? roleFilter.toLowerCase() : ""} users found.</td></tr>
              ) : filtered.map((u) => {
                const isOwnerRow = u.email === OWNER_EMAIL;
                return (
                <tr key={u.id} className={`hover:bg-gray-50/70 transition-colors ${isOwnerRow ? "bg-amber-50/30" : ""}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-9 h-9 bg-gradient-to-br ${ROLE_AVATAR[u.role] ?? "from-gray-400 to-gray-600"} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                          <span className="text-white font-bold text-sm">{u.name.charAt(0).toUpperCase()}</span>
                        </div>
                        {/* Crown badge for owner */}
                        {isOwnerRow && (
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center shadow-sm" title="System Owner">
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">{u.name}</span>
                        {isOwnerRow && (
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                            Owner
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_STYLES[u.role]}`}>{u.role}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {u.clientId ? (clientMap[u.clientId] ?? u.clientId) : "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {/* Edit — always allowed (password change etc), but modal locks sensitive fields */}
                      <button
                        onClick={() => setModal({ mode: "edit", user: u })}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      {/* Delete — hidden for owner */}
                      {!isOwnerRow ? (
                        <button
                          onClick={() => handleDelete(u.id)}
                          disabled={deletingId === u.id}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {deletingId === u.id ? "…" : "Delete"}
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg cursor-default" title="System owner cannot be deleted">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                          Protected
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <UserModal
          mode={modal.mode}
          user={modal.user}
          clients={clients}
          onClose={() => setModal(null)}
          onDone={fetchAll}
        />
      )}
    </div>
  );
}
