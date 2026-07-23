import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";

export const Route = createFileRoute("/about")({ component: About });

function About() {
  return (
    <PageLayout>
      <section style={{ background: "var(--forest)", padding: "120px 5% 96px", color: "var(--cream)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }} className="about-grid">
          <div>
            <div className="section-label" style={{ color: "var(--leaf-mid)" }}>Our Teacher</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 600, color: "var(--cream)", lineHeight: 1.1 }}>
              Meet <em style={{ fontStyle: "italic", fontWeight: 300, color: "var(--gold)" }}>Nishant Jha</em>
            </h1>
            <p style={{ marginTop: 24, fontSize: "1rem", lineHeight: 1.85, color: "rgba(253,250,244,0.72)", fontWeight: 300 }}>
              A <strong style={{ color: "var(--leaf-mid)" }}>certified government yoga teacher</strong> with over a decade of experience, Nishant has a uniquely analytical approach to wellness. His rare background as a <strong style={{ color: "var(--leaf-mid)" }}>mathematician and formula maker</strong> allows him to break down complex asanas into simple, systematic steps — making yoga accessible and effective for everyone.
            </p>
            <p style={{ marginTop: 14, fontSize: "1rem", lineHeight: 1.85, color: "rgba(253,250,244,0.72)", fontWeight: 300 }}>
              Students have joined from <strong style={{ color: "var(--leaf-mid)" }}>India, the United States, Mexico, Canada</strong>, and beyond — transforming their health, balance, and inner peace.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 28 }}>
              {["🎓 Govt. Certified", "🧮 Mathematician", "🌍 International Students", "♾️ 10+ Years"].map((t) => (
                <span key={t} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)", padding: "7px 16px", borderRadius: 40, fontSize: "0.8rem" }}>{t}</span>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gap: 16 }}>
            {[
              ["🌿", "Our Philosophy", "Yoga isn't just a practice — it's a way of life. Build daily yoga habits for lifelong wellness."],
              ["📱", "Online Classes", "Join live from anywhere in the world. Same energy as our in-studio sessions."],
              ["🏛️", "Offline Studio", "Visit us in Prayagraj for an immersive, in-person experience with 5 batches daily."],
            ].map(([e, t, d]) => (
              <div key={t} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "24px" }}>
                <div style={{ fontSize: "1.6rem", marginBottom: 8 }}>{e}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 600, color: "var(--gold)", marginBottom: 4 }}>{t}</div>
                <div style={{ fontSize: "0.85rem", color: "rgba(253,250,244,0.65)", lineHeight: 1.6, fontWeight: 300 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <style>{`@media (max-width: 900px) { .about-grid { grid-template-columns: 1fr !important; gap: 40px !important; } }`}</style>
    </PageLayout>
  );
}
