import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({ component: Auth });

function Auth() {
  const nav = useNavigate();
  const { refresh } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setErr(error.message); setBusy(false); return; }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: {
          emailRedirectTo: typeof window !== "undefined" ? window.location.origin + "/dashboard" : undefined,
          data: name ? { full_name: name } : undefined,
        },
      });
      if (error) { setErr(error.message); setBusy(false); return; }
      if (data.user) {
        await supabase.from("profiles").upsert({ id: data.user.id, status: "pending", ...(name ? { full_name: name } : {}) });
      }
    }
    await refresh();
    nav({ to: "/dashboard" });
  };

  return (
    <PageLayout>
      <section style={{ padding: "120px 5% 96px", minHeight: "80vh" }}>
        <div style={{ maxWidth: 440, margin: "0 auto" }}>
          <div className="section-label">{mode === "signin" ? "Welcome back" : "Create account"}</div>
          <h1 className="section-title">
            {mode === "signin" ? <>Sign <em>In</em></> : <>Sign <em>Up</em></>}
          </h1>

          <form onSubmit={submit} className="card" style={{ marginTop: 32, padding: 32, display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "signup" && (
              <input type="text" className="field" placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
            )}
            <input required type="email" className="field" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input required type="password" minLength={6} className="field" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {err && <div style={{ color: "#c33", fontSize: "0.85rem" }}>{err}</div>}
            <button className="btn-primary" disabled={busy} type="submit">
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
            </button>
            <button
              type="button"
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setErr(null); }}
              style={{ background: "none", border: "none", color: "var(--terra)", cursor: "pointer", fontSize: "0.85rem" }}
            >
              {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </form>
        </div>
      </section>
    </PageLayout>
  );
}