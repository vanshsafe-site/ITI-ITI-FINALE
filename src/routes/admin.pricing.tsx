import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/pricing")({ component: Pricing });

type Plan = {
  id: string; name: string; price: number; currency: string; period: string;
  features: string[]; badge: string | null; sort_order: number;
};

function empty(): Plan {
  return { id: "", name: "", price: 0, currency: "₹", period: "month", features: [], badge: null, sort_order: 0 };
}

function Pricing() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("pricing_plans").select("*").order("sort_order");
    setPlans((data as any) || []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    setBusy(true);
    const payload: any = { ...editing, features: editing.features };
    if (!payload.id) delete payload.id;
    const { error } = await supabase.from("pricing_plans").upsert(payload);
    setBusy(false);
    if (error) { alert(error.message); return; }
    setEditing(null); load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this plan?")) return;
    await supabase.from("pricing_plans").delete().eq("id", id);
    load();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", color: "var(--forest)" }}>Pricing plans</h2>
        <button className="btn-primary" onClick={() => setEditing(empty())}>+ New plan</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {plans.map((p) => (
          <div key={p.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", color: "var(--forest)" }}>{p.name}</div>
                <div style={{ fontSize: "1.4rem", fontWeight: 700, marginTop: 4 }}>{p.currency}{p.price} <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 400 }}>/ {p.period}</span></div>
              </div>
              {p.badge && <span style={{ background: "var(--gold)", color: "var(--forest)", padding: "4px 10px", borderRadius: 40, fontSize: "0.7rem", fontWeight: 700 }}>{p.badge}</span>}
            </div>
            <ul style={{ marginTop: 12, paddingLeft: 20, color: "var(--muted)", fontSize: "0.85rem" }}>
              {(p.features || []).map((f, i) => <li key={i}>{f}</li>)}
            </ul>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button className="btn-outline" onClick={() => setEditing(p)}>Edit</button>
              <button className="btn-outline" onClick={() => del(p.id)} style={{ color: "#c33", borderColor: "#eaa" }}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setEditing(null)}>
          <div className="card" style={{ maxWidth: 500, width: "100%", maxHeight: "90vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", color: "var(--forest)", marginBottom: 16 }}>
              {editing.id ? "Edit plan" : "New plan"}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input className="field" placeholder="Name (e.g. Monthly Plan)" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 100px", gap: 8 }}>
                <input className="field" placeholder="₹" value={editing.currency} onChange={(e) => setEditing({ ...editing, currency: e.target.value })} />
                <input className="field" type="number" placeholder="Price" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
                <input className="field" placeholder="month" value={editing.period} onChange={(e) => setEditing({ ...editing, period: e.target.value })} />
              </div>
              <input className="field" placeholder="Badge (e.g. Most Popular) — optional" value={editing.badge || ""} onChange={(e) => setEditing({ ...editing, badge: e.target.value || null })} />
              <textarea className="field" placeholder="Features (one per line)" value={(editing.features || []).join("\n")} onChange={(e) => setEditing({ ...editing, features: e.target.value.split("\n").filter(Boolean) })} style={{ minHeight: 140 }} />
              <input className="field" type="number" placeholder="Sort order" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="btn-outline" onClick={() => setEditing(null)}>Cancel</button>
                <button className="btn-primary" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
