import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

function Dashboard() {
  const { user, profile, isAdmin, loading, refresh } = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [nameErr, setNameErr] = useState<string | null>(null);

  useEffect(() => {
    setName(profile?.full_name || "");
  }, [profile?.full_name]);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [loading, user, nav]);

  const saveName = async () => {
    if (!user) return;
    const trimmed = name.trim();
    if (!trimmed) { setNameErr("Name can't be empty."); return; }
    setSaving(true);
    setNameErr(null);
    setSaved(false);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: trimmed })
      .eq("id", user.id);
    setSaving(false);
    if (error) { setNameErr(error.message); return; }
    setSaved(true);
    await refresh();
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading || !user) {
    return <PageLayout><div style={{ padding: 120, textAlign: "center", color: "var(--muted)" }}>Loading…</div></PageLayout>;
  }

  return (
    <PageLayout>
      <section style={{ padding: "120px 5% 96px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="section-label">Your Account</div>
          <h1 className="section-title">Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}</h1>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginTop: 32 }}>
            <div className="card">
              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)" }}>Email</div>
              <div style={{ marginTop: 8, color: "var(--text)" }}>{user.email}</div>
              {profile?.phone && (
                <>
                  <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", marginTop: 16 }}>Phone</div>
                  <div style={{ marginTop: 8 }}>{profile.phone}</div>
                </>
              )}

              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", marginTop: 16 }}>Name</div>
              <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setNameErr(null); }}
                  placeholder="Enter your name"
                  style={{
                    flex: 1, minWidth: 160, padding: "8px 12px", borderRadius: 8,
                    border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: "0.9rem",
                  }}
                />
                <button
                  className="btn-outline"
                  disabled={saving || name.trim() === (profile?.full_name || "")}
                  onClick={saveName}
                  style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
              {nameErr && <div style={{ marginTop: 6, color: "#c33", fontSize: "0.8rem" }}>{nameErr}</div>}
              {saved && <div style={{ marginTop: 6, color: "#237", fontSize: "0.8rem" }}>Saved!</div>}
            </div>

            <div className="card">
              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)" }}>Quick Links</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                <Link to="/videos" style={{ color: "var(--terra)" }}>→ Video Library</Link>
                <Link to="/blog" style={{ color: "var(--terra)" }}>→ Blog</Link>
                <Link to="/contact" style={{ color: "var(--terra)" }}>→ Contact Us</Link>
                {isAdmin && <Link to="/admin" style={{ color: "var(--terra)", fontWeight: 600 }}>→ Admin Panel</Link>}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}