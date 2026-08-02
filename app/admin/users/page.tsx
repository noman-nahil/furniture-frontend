"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/authClient";
import { useAuth } from "@/contexts/AuthContext";

type UserRole = "admin" | "manager" | "customer";

type CustomerUser = {
  _id: string;
  name?: string;
  email: string;
  role: UserRole;
  isActive?: boolean;
  createdAt?: string;
};

type UserListResponse = {
  data: CustomerUser[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  counts: Record<TabId, number>;
};

const ROLES: UserRole[] = ["customer", "manager", "admin"];
const PAGE_SIZE = 50;

type TabId = "customer" | "manager" | "admin";

const TABS: { id: TabId; label: string }[] = [
  { id: "customer", label: "Customers" },
  { id: "manager", label: "Managers" },
  { id: "admin", label: "Admins" },
];

type PatchBody = {
  name?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
};

export default function AdminCustomersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<CustomerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tab, setTab] = useState<TabId>("customer");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [counts, setCounts] = useState<Record<TabId, number>>({
    customer: 0,
    manager: 0,
    admin: 0,
  });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: "", email: "" });
  const editingIdRef = useRef<string | null>(null);
  editingIdRef.current = editingId;

  const [managerForm, setManagerForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [creatingManager, setCreatingManager] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        role: tab,
      });
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      }
      const res = await apiFetch<UserListResponse>(`/users?${params.toString()}`);
      setUsers(Array.isArray(res.data) ? res.data : []);
      setTotalPages(res.totalPages ?? 0);
      if (res.counts) {
        setCounts({
          customer: res.counts.customer ?? 0,
          manager: res.counts.manager ?? 0,
          admin: res.counts.admin ?? 0,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [page, tab, debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  const q = debouncedSearch.toLowerCase();

  function startEdit(u: CustomerUser) {
    setEditingId(u._id);
    setDraft({
      name: u.name ?? "",
      email: u.email ?? "",
    });
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft({ name: "", email: "" });
  }

  async function patchUser(id: string, body: PatchBody) {
    try {
      setBusyId(id);
      setError(null);
      const updated = await apiFetch<CustomerUser>(`/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, ...updated } : u)));
      if (editingIdRef.current === id) {
        const closesEditor =
          body.name !== undefined ||
          body.email !== undefined ||
          body.role !== undefined;
        if (closesEditor) cancelEdit();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function saveProfile(id: string) {
    await patchUser(id, {
      name: draft.name.trim(),
      email: draft.email.trim(),
    });
  }

  async function handleCreateManager(e: React.FormEvent) {
    e.preventDefault();
    const email = managerForm.email.trim();
    const password = managerForm.password;
    const name = managerForm.name.trim();
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    try {
      setCreatingManager(true);
      setError(null);
      const created = await apiFetch<CustomerUser>("/users", {
        method: "POST",
        body: JSON.stringify({
          name: name || undefined,
          email,
          password,
          role: "manager",
        }),
      });
      setUsers((prev) => [created, ...prev]);
      setManagerForm({ name: "", email: "", password: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create manager.");
    } finally {
      setCreatingManager(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Permanently delete this user? This cannot be undone.")) return;
    try {
      setBusyId(id);
      setError(null);
      await apiFetch(`/users/${id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u._id !== id));
      if (editingId === id) cancelEdit();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-50">User management</h2>
            <p className="text-xs text-slate-400">
              Separate lists for customers, managers, and admins. On{" "}
              <strong className="text-slate-300">Managers</strong>, use the form to invite a
              new manager (they sign in with the email and password you set). Edit info, pause,
              change role, or delete where allowed.
            </p>
          </div>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in this list…"
            className="w-full sm:w-64 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-slate-600"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => {
            const count = counts[t.id];
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTab(t.id);
                  setPage(1);
                  cancelEdit();
                }}
                className={[
                  "px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
                  active
                    ? "bg-slate-100 text-slate-950"
                    : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-slate-600 hover:text-slate-200",
                ].join(" ")}
              >
                {t.label}
                <span className="ml-1.5 tabular-nums opacity-80">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-950/40 border border-red-900/70 rounded-md px-3 py-2 space-y-2">
          <p>{error}</p>
          {(error.includes("Cannot GET") ||
            error.includes("/users") ||
            error.includes("404")) && (
            <p className="text-slate-400 font-normal">
              If you recently added the users API: restart the backend from{" "}
              <code className="text-slate-300">backend</code> (
              <code className="text-slate-300">npm run dev</code>) so{" "}
              <code className="text-slate-300">GET /api/users</code> works.
            </p>
          )}
        </div>
      )}

      {tab === "manager" && (
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-4">
          <h3 className="text-sm font-semibold text-slate-100 mb-1">
            Add new manager
          </h3>
          <p className="text-[11px] text-slate-500 mb-4">
            Creates a <span className="text-slate-400">manager</span> account. Share the
            password securely; they can log in at{" "}
            <code className="text-slate-400">/login</code> and use the manager dashboard.
          </p>
          <form
            onSubmit={handleCreateManager}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
          >
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Display name
              </label>
              <input
                type="text"
                value={managerForm.name}
                onChange={(e) =>
                  setManagerForm((f) => ({ ...f, name: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-50 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-400"
                placeholder="Optional"
                autoComplete="name"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                required
                value={managerForm.email}
                onChange={(e) =>
                  setManagerForm((f) => ({ ...f, email: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-50 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-400"
                placeholder="manager@store.com"
                autoComplete="email"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Temporary password <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={managerForm.password}
                onChange={(e) =>
                  setManagerForm((f) => ({ ...f, password: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-50 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-400"
                placeholder="Min. 6 characters"
                autoComplete="new-password"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-1 flex sm:justify-end">
              <button
                type="submit"
                disabled={creatingManager}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-100 text-slate-900 text-xs font-semibold hover:bg-white disabled:opacity-60"
              >
                {creatingManager ? "Creating…" : "Create manager"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
        <div className="border-b border-slate-800 px-4 py-3 flex justify-between items-center flex-wrap gap-2">
          <p className="text-xs font-medium text-slate-300 uppercase tracking-wide">
            {TABS.find((x) => x.id === tab)?.label}
          </p>
          {loading && <p className="text-xs text-slate-500">Loading…</p>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 min-w-[720px]">
            <thead className="bg-slate-900/80 text-slate-400">
              <tr>
                <th className="px-4 py-2 font-medium">Name & email</th>
                <th className="px-4 py-2 font-medium">Role</th>
                <th className="px-4 py-2 font-medium">Account</th>
                <th className="px-4 py-2 font-medium">Joined</th>
                <th className="px-4 py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && !loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                    No users in this list{q ? " match your search" : ""}.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSelf = currentUser?.id === u._id;
                  const active = u.isActive !== false;
                  const isEditing = editingId === u._id;
                  const rowBusy = busyId === u._id;

                  return (
                    <tr
                      key={u._id}
                      className="border-t border-slate-800/80 hover:bg-slate-900/60 align-top"
                    >
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="space-y-2 max-w-xs">
                            <input
                              value={draft.name}
                              onChange={(e) =>
                                setDraft((d) => ({ ...d, name: e.target.value }))
                              }
                              placeholder="Display name"
                              className="w-full px-2 py-1.5 rounded border border-slate-700 bg-slate-900 text-slate-50 text-xs"
                            />
                            <input
                              type="email"
                              value={draft.email}
                              onChange={(e) =>
                                setDraft((d) => ({ ...d, email: e.target.value }))
                              }
                              placeholder="Email"
                              className="w-full px-2 py-1.5 rounded border border-slate-700 bg-slate-900 text-slate-50 text-xs"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={rowBusy}
                                onClick={() => saveProfile(u._id)}
                                className="px-2 py-1 rounded bg-slate-100 text-slate-900 text-[11px] font-medium disabled:opacity-50"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                disabled={rowBusy}
                                onClick={cancelEdit}
                                className="px-2 py-1 rounded border border-slate-600 text-[11px] text-slate-300 disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-slate-50">
                              {u.name || "—"}{" "}
                              {isSelf && (
                                <span className="text-[10px] text-slate-500">(you)</span>
                              )}
                            </span>
                            <span className="text-[11px] text-slate-500">{u.email}</span>
                            <span className="text-[10px] font-mono text-slate-600">
                              {u._id}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <select
                          value={u.role}
                          disabled={rowBusy || isSelf}
                          onChange={(e) =>
                            patchUser(u._id, { role: e.target.value as UserRole })
                          }
                          title={isSelf ? "Cannot change your own role here" : undefined}
                          className="px-2 py-1 rounded border border-slate-700 bg-slate-900 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:opacity-50 max-w-[130px]"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] text-slate-600 mt-1 max-w-[140px]">
                          Changing role moves the user to another tab.
                        </p>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <span
                          className={
                            active ? "text-emerald-400" : "text-amber-400"
                          }
                        >
                          {active ? "Active" : "Paused"}
                        </span>
                        <div className="mt-1">
                          <button
                            type="button"
                            disabled={rowBusy || (isSelf && active)}
                            onClick={() => patchUser(u._id, { isActive: !active })}
                            className="text-[11px] text-slate-400 hover:text-slate-200 underline-offset-2 hover:underline disabled:opacity-40 disabled:no-underline"
                          >
                            {active ? "Pause" : "Activate"}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle whitespace-nowrap text-slate-500">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3 align-middle text-right">
                        <div className="flex flex-col items-end gap-2">
                          {!isEditing && (
                            <button
                              type="button"
                              disabled={rowBusy}
                              onClick={() => startEdit(u)}
                              className="px-2 py-1 rounded-md border border-slate-700 text-[11px] text-slate-200 hover:bg-slate-800 disabled:opacity-50"
                            >
                              Edit info
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={rowBusy || isSelf}
                            onClick={() => handleDelete(u._id)}
                            className="px-2 py-1 rounded-md border border-red-600/70 text-[11px] text-red-300 hover:bg-red-950 disabled:opacity-40"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="border-t border-slate-800 px-4 py-3 flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={loading || page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-md border border-slate-700 text-[11px] text-slate-200 hover:bg-slate-800 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={loading || page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-md border border-slate-700 text-[11px] text-slate-200 hover:bg-slate-800 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
