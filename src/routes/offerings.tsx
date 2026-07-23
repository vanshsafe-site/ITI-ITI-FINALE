import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { FreePreviewVideo } from "@/components/FreePreviewVideo";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/offerings")({ component: Offerings });

type Plan = { id: string; name: string; price: number; currency: string; period: string; features: string[]; badge?: string };

function Offerings() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("pricing_plans").select("*").order("sort_order")
      .then(({ data }) => { setPlans((data as any) || []); setLoading(false); });
  }, []);

  return (
    <PageLayout>
      <section style={{ padding: "120px 5% 60px", textAlign: "center" }}>
        <div className="section-label" style={{ justifyContent: "center" }}>How We Work</div>
        <h1 className="section-title">Simple, <em>Flexible</em> Classes</h1>
        <p style={{ color: "var(--muted)", maxWidth: 620, margin: "16px auto 0", fontWeight: 300, lineHeight: 1.8 }}>
          Live online & offline classes, pre-recorded library, 5 daily batches — pick what fits you.
        </p>
      </section>

      <section style={{ padding: "20px 5% 96px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", marginBottom: 40 }}>
          <FreePreviewVideo />
        </div>

        <div style={{ maxWidth: 1100, margin: "0 auto 32px" }}>
          <div style={{ background: "var(--gold)", color: "var(--forest)", textAlign: "center", padding: "14px 20px", borderRadius: 14, fontWeight: 700, letterSpacing: "0.04em", fontSize: "1.05rem" }}>
            Registration Fees ₹100
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {loading && <p style={{ textAlign: "center", color: "var(--muted)" }}>Loading pricing…</p>}
          {!loading && plans.length === 0 && (
            <div className="card" style={{ textAlign: "center", padding: 40, gridColumn: "1 / -1" }}>
              <p style={{ color: "var(--muted)" }}>No pricing plans yet. Admin can add them from the dashboard.</p>
            </div>
          )}
          {plans.map((p) => (
            <div key={p.id} style={{ background: "var(--forest)", borderRadius: 28, padding: "40px 32px", color: "var(--cream)", position: "relative", overflow: "hidden" }}>
              {p.badge && (
                <div style={{ display: "inline-block", background: "var(--gold)", color: "var(--forest)", padding: "5px 14px", borderRadius: 40, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>
                  {p.badge}
                </div>
              )}
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 600, marginBottom: 8 }}>{p.name}</h3>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "3.6rem", fontWeight: 700, lineHeight: 1 }}>
                <sup style={{ fontSize: "1.6rem", verticalAlign: "super" }}>{p.currency}</sup>{p.price}
              </div>
              <div style={{ fontSize: "0.85rem", color: "rgba(253,250,244,0.55)", letterSpacing: "0.05em", marginBottom: 24 }}>per {p.period}</div>
              <ul style={{ listStyle: "none", padding: 0, marginBottom: 28 }}>
                {(p.features || []).map((f) => (
                  <li key={f} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: "0.88rem", color: "rgba(253,250,244,0.8)", fontWeight: 300 }}>
                    <span style={{ color: "var(--gold)" }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link to="/contact" style={{ display: "block", background: "var(--gold)", color: "var(--forest)", textAlign: "center", padding: 14, borderRadius: 50, fontWeight: 600, textDecoration: "none" }}>
                Apply to Join
              </Link>
            </div>
          ))}
        </div>

        <div style={{ maxWidth: 1100, margin: "40px auto 0" }}>
          <div style={{ background: "var(--forest)", color: "var(--cream)", borderRadius: 28, padding: "36px 32px" }}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 600, marginBottom: 4 }}>
              Annual Membership Benefits
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "4px 24px" }}>
              {[
                "Registration fee waived",
                "Personal counseling by the yogacharya",
                "Priority in ashram events",
                "Membership pause facility",
              ].map((f, i) => (
                <li key={f} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: "0.9rem", color: "rgba(253,250,244,0.85)", fontWeight: 300 }}>
                  <span style={{ color: "var(--gold)" }}>✓{i + 1}.</span> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}