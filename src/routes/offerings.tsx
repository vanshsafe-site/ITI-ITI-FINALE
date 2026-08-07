import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { FreePreviewVideo } from "@/components/FreePreviewVideo";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/offerings")({
  component: Offerings,
  head: () => ({
    meta: [
      { title: "Yoga Classes & Pricing | Iti Iti Yogashram" },
      { name: "description", content: "Explore online and offline yoga class plans with Iti Iti Yogashram in Prayagraj — pricing, features and what's included in each membership." },
      { property: "og:title", content: "Yoga Classes & Pricing | Iti Iti Yogashram" },
      { property: "og:description", content: "Explore online and offline yoga class plans with Iti Iti Yogashram in Prayagraj — pricing, features and what's included in each membership." },
      { property: "og:type", content: "website" },
    ],
  }),
});

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
          <div style={{ background: "var(--gold)", color: "#0B0E1D", textAlign: "center", padding: "14px 20px", borderRadius: 14, fontWeight: 700, letterSpacing: "0.04em", fontSize: "1.05rem" }}>
            Registration Fees ₹100 / $5 for international users
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
            <div key={p.id} style={{ background: "#000000", border: "1px solid #ffffff", borderRadius: 28, padding: "40px 32px", color: "#ffffff", position: "relative", overflow: "hidden", boxShadow: "0 18px 45px rgba(11,14,29,0.08)" }}>
              {p.badge && (
                <div style={{ display: "inline-block", background: "#ffffff", color: "#000000", padding: "5px 14px", borderRadius: 40, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>
                  {p.badge}
                </div>
              )}
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 600, marginBottom: 8, color: "#ffffff" }}>{p.name}</h3>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "3.6rem", fontWeight: 700, lineHeight: 1, color: "#ffffff" }}>
                <sup style={{ fontSize: "1.6rem", verticalAlign: "super" }}>{p.currency}</sup>{p.price}
              </div>
              <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.8)", letterSpacing: "0.05em", marginBottom: 24 }}>per {p.period}</div>
              <ul style={{ listStyle: "none", padding: 0, marginBottom: 28 }}>
                {(p.features || []).map((f) => (
                  <li key={f} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.16)", fontSize: "0.88rem", color: "rgba(255,255,255,0.9)", fontWeight: 300 }}>
                    <span style={{ color: "var(--gold)" }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link to="/contact" style={{ display: "block", background: "#ffffff", color: "#000000", textAlign: "center", padding: 14, borderRadius: 50, fontWeight: 600, textDecoration: "none" }}>
                Apply to Join
              </Link>
            </div>
          ))}
        </div>

        <div style={{ maxWidth: 1100, margin: "40px auto 0" }}>
          <div style={{ background: "linear-gradient(145deg, rgba(11,14,29,0.96), rgba(41,52,74,0.96))", color: "var(--cream)", borderRadius: 28, padding: "36px 32px", boxShadow: "0 16px 40px rgba(11,14,29,0.14)" }}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 600, marginBottom: 4, color: "var(--cream)" }}>
              Annual Membership Benefits
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "4px 24px" }}>
              {[
                "Registration fee waived",
                "Personal counseling by the yogacharya",
                "Priority in ashram events",
                "Membership pause facility",
              ].map((f) => (
                <li key={f} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.12)", fontSize: "0.9rem", color: "rgba(248,242,228,0.95)", fontWeight: 300 }}>
                  <span style={{ color: "var(--gold)" }}>✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}