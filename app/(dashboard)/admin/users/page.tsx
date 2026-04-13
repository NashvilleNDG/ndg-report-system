"use client";

import { useEffect, useState } from "react";

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

const ROLE_COLORS = {
  ADMIN: "bg-purple-100 text-purple-700",
  TEAM: "bg-blue-100 text-blue-700",
  CLIENT: "bg-green-100 text-green-700",
};

function NewUserModal({
  clients,
  onClose,
  onCreated,
}: {
  clients: Client[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "CLIENT", clientId: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const body: Record<string, string> = { name: form.name, email: form.email, password: form.password, role: form.role };
      if (form.role === "CLIENT" && form.clientId) body.clientId = form.clientId;
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create user");
      }
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">New User</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Name", key: "name", type: "text" },
            { label: "Email", key: "email", type: "email" },
            { label: "Password", key: "password", type: "password" },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type={type}
                required
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value, clientId: "" }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ADMIN">ADMIN</option>
              <option value="TEAM">TEAM</option>
              <option value="CLIENT">CLIENT</option>
            </select>
          </div>
          {form.role === "CLIENT" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <select
                value={form.clientId}
                onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">— Select Client —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2 text-sm font-medium hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60">
              {loading ? "Creating…" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    const [usersRes, clientsRes] = await Promise.all([fetch("/api/users"), fetch("/api/clients")]);
    if (usersRes.ok) setUsers(await usersRes.json());
    if (clientsRes.ok) setClients(await clientsRes.json());
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setDeletingId(userId);
    await fetch(`/api/users/${userId}`, { method: "DELETE" });
    setDeletingId(null);
    fetchAll();
  };

  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c.name]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} user{users.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <span>+</span> New User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Name", "Email", "Role", "Client", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Loading…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">No users found.</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
                  <td className="px-6 py-4 text-gray-500">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_COLORS[u.role]}`}>{u.role}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {u.clientId ? (clientMap[u.clientId] ?? u.clientId) : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(u.id)}
                      disabled={deletingId === u.id}
                      className="text-red-500 hover:text-red-700 text-xs font-medium disabled:opacity-50"
                    >
                      {deletingId === u.id ? "Deleting…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <NewUserModal clients={clients} onClose={() => setShowModal(false)} onCreated={fetchAll} />
      )}
    </div>
  );
}
