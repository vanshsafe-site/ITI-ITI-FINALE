import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/users")({ component: Users });

type Row = {
  id: string;
  email: string | null;
  full_name: string | null;
  status: "pending" | "active" | string;
  created_at: string;
};

function Users() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase.rpc("admin_list_users");
    if (error) setErr(error.message);
    setRows((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleStatus = async (row: Row) => {
    const next = row.status === "active" ? "pending" : "active";
    setBusyId(row.id);
    const { error } = await supabase.from("profiles").update({ status: next }).eq("id", row.id);
    setBusyId(null);
    if (error) { alert(error.message); return; }
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: next } : r)));
  };

  if (loading) return <p style={{ color: "var(--muted)" }}>Loading…</p>;
  if (err) return <p style={{ color: "#c33" }}>{err}</p>;
  if (rows.length === 0) return <p style={{ color: "var(--muted)" }}>No users yet.</p>;

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left" }}>
              <th style={{ padding: "14px 20px", color: "var(--muted)", fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Name</th>
              <th style={{ padding: "14px 20px", color: "var(--muted)", fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Email</th>
              <th style={{ padding: "14px 20px", color: "var(--muted)", fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Signed up</th>
              <th style={{ padding: "14px 20px", color: "var(--muted)", fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Status</th>
              <th style={{ padding: "14px 20px", color: "var(--muted)", fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Video access</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "14px 20px" }}>
                  {r.full_name || <span style={{ color: "var(--muted)" }}>—</span>}
                </td>
                <td style={{ padding: "14px 20px" }}>
                  <a href={`mailto:${r.email}`} style={{ color: "var(--terra)" }}>{r.email}</a>
                </td>
                <td style={{ padding: "14px 20px", color: "var(--muted)", fontSize: "0.8rem" }}>
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: "14px 20px" }}>
                  <span style={{
                    fontSize: "0.75rem", padding: "4px 10px", borderRadius: 999,
                    background: r.status === "active" ? "rgba(35,120,60,0.12)" : "rgba(150,150,150,0.15)",
                    color: r.status === "active" ? "#237" : "var(--muted)",
                  }}>
                    {r.status}
                  </span>
                </td>
                <td style={{ padding: "14px 20px" }}>
                  <button
                    className="btn-outline"
                    disabled={busyId === r.id}
                    onClick={() => toggleStatus(r)}
                    style={{ fontSize: "0.8rem" }}
                  >
                    {busyId === r.id ? "…" : r.status === "active" ? "Revoke access" : "Grant access"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}