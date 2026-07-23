import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/apply")({ component: Apply });

function Apply() {
  const [form, setForm] = useState({
    full_name: "", email: "", password: "", phone: "",
    experience: "", goals: "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    const { data: signUp, error: signErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin + "/dashboard" : undefined,
        data: { full_name: form.full_name, phone: form.phone },
      },
    });
    if (signErr) { setErr(signErr.message); setBusy(false); return; }

    const uid = signUp.user?.id;
    if (uid) {
      await supabase.from("profiles").upsert({
        id: uid, full_name: form.full_name, phone: form.phone, status: "pending",
      });
      await supabase.from("applications").insert({
        user_id: uid, experience: form.experience, goals: form.goals, status: "pending",
      });
    }
    setDone(true); setBusy(false);
  };

  return (
    <PageLayout>
      <section style={{ padding: "120px 5% 96px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div className="section-label">Join Us</div>
          <h1 className="section-title">Apply to <em>Practice</em></h1>
          <p style={{ color: "var(--muted)", marginTop: 16, marginBottom: 32, lineHeight: 1.7 }}>
            Submit an application to get started. Nishant or our team will reach out to you personally, and once confirmed we'll activate your account so you can access our video library and members area.
          </p>

          {done ? (
            <div className="card" style={{ padding: 32 }}>
              <h3 style={{ color: "var(--forest)", fontSize: "1.4rem", marginBottom: 12 }}>✓ Application received</h3>
              <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
                Check your email to confirm your address (if required by your Supabase settings), then we'll be in touch shortly to schedule an intro conversation.
              </p>
              <div style={{ marginTop: 20 }}>
                <Link to="/dashboard" className="btn-primary">Go to dashboard</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="card" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 14 }}>
              <input required className="field" placeholder="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              <input required type="email" className="field" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input required type="password" className="field" placeholder="Password (min 6 chars)" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <input className="field" placeholder="Phone / WhatsApp (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <textarea className="field" placeholder="Your yoga experience (optional)" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
              <textarea className="field" placeholder="What are your goals?" value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} />
              {err && <div style={{ color: "#c33", fontSize: "0.85rem" }}>{err}</div>}
              <button className="btn-primary" disabled={busy} type="submit">{busy ? "Submitting…" : "Submit application"}</button>
              <p style={{ fontSize: "0.8rem", color: "var(--muted)", textAlign: "center" }}>
                Already applied? <Link to="/auth" style={{ color: "var(--terra)" }}>Sign in</Link>
              </p>
            </form>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
