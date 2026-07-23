import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/")({ component: Home });

type Plan = { id: string; name: string; price: number; currency: string; period: string; features: string[]; badge?: string };

function Home() {
  const [plan, setPlan] = useState<Plan | null>(null);

  useEffect(() => {
    supabase.from("pricing_plans").select("*").order("sort_order").limit(1)
      .then(({ data }) => {
        if (data && data[0]) setPlan(data[0] as any);
      });
  }, []);

  return (
    <PageLayout>
      {/* HERO */}
      <section style={{ minHeight: "90vh", position: "relative", display: "flex", alignItems: "center", padding: "120px 5% 80px", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 70% 80% at 80% 50%, rgba(197,217,168,0.28) 0%, transparent 65%), radial-gradient(ellipse 50% 60% at 15% 80%, rgba(181,114,58,0.12) 0%, transparent 55%), var(--cream)",
        }} />
        {/* Abstract Art - Top Right */}
        <svg
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: "clamp(500px, 70vw, 1000px)",
            height: "clamp(500px, 70vh, 900px)",
            opacity: 0.65,
            zIndex: 1,
          }}
          viewBox="0 0 600 600"
          xmlns="http://www.w3.org/1200/svg"
        >
          {/* Flowing organic shapes with nature-inspired colors */}
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "rgba(197,217,168,0.5)", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "rgba(181,114,58,0.4)", stopOpacity: 1 }} />
            </linearGradient>
            <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: "rgba(167,142,107,0.4)", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "rgba(197,217,168,0.3)", stopOpacity: 1 }} />
            </linearGradient>
            <radialGradient id="grad3" cx="40%" cy="40%">
              <stop offset="0%" style={{ stopColor: "rgba(197,217,168,0.6)", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "rgba(181,114,58,0.2)", stopOpacity: 1 }} />
            </radialGradient>
            <filter id="blur">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
            </filter>
            <filter id="blur2">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
            </filter>
          </defs>
          
          {/* Large flowing background curves */}
          <path
            d="M 0,-100 Q 200,150 400,80 T 800,250 Q 500,400 300,550 Q 100,400 0,450 Z"
            fill="url(#grad1)"
            opacity="0.45"
          />
          
          {/* Secondary flowing shape */}
          <path
            d="M 300,0 Q 500,120 550,300 Q 500,450 300,550 Q 150,450 100,300 Q 150,120 300,0 Z"
            fill="url(#grad2)"
            opacity="0.35"
          />
          
          {/* Large organic blob shapes */}
          <circle cx="480" cy="120" r="95" fill="rgba(197,217,168,0.3)" filter="url(#blur)" />
          <circle cx="520" cy="280" r="85" fill="rgba(181,114,58,0.25)" filter="url(#blur)" />
          <circle cx="380" cy="200" r="110" fill="rgba(167,142,107,0.2)" filter="url(#blur)" opacity="0.6" />
          <ellipse cx="420" cy="400" rx="80" ry="120" fill="url(#grad3)" opacity="0.4" filter="url(#blur)" />
          
          {/* Additional decorative blobs */}
          <circle cx="250" cy="80" r="65" fill="rgba(197,217,168,0.25)" filter="url(#blur)" opacity="0.5" />
          <circle cx="550" cy="450" r="70" fill="rgba(181,114,58,0.2)" filter="url(#blur)" opacity="0.4" />
          
          {/* Curved flowing lines for movement */}
          <path
            d="M 250,50 Q 450,180 480,380"
            stroke="rgba(197,217,168,0.35)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            filter="url(#blur2)"
          />
          <path
            d="M 350,100 Q 520,250 450,500"
            stroke="rgba(181,114,58,0.25)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            filter="url(#blur2)"
          />
          <path
            d="M 200,150 Q 380,280 320,550"
            stroke="rgba(167,142,107,0.2)"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            filter="url(#blur2)"
          />
          
          {/* Decorative circular elements */}
          <circle cx="420" cy="300" r="35" fill="none" stroke="rgba(197,217,168,0.3)" strokeWidth="2.5" />
          <circle cx="500" cy="200" r="50" fill="none" stroke="rgba(181,114,58,0.25)" strokeWidth="2" opacity="0.7" />
          <circle cx="350" cy="450" r="40" fill="none" stroke="rgba(167,142,107,0.2)" strokeWidth="2" />
          
          {/* Small accent circles */}
          <circle cx="480" cy="320" r="18" fill="rgba(197,217,168,0.4)" />
          <circle cx="520" cy="380" r="22" fill="rgba(181,114,58,0.25)" />
          <circle cx="350" cy="150" r="15" fill="rgba(167,142,107,0.3)" />
          <circle cx="440" cy="500" r="20" fill="rgba(197,217,168,0.3)" />
          <circle cx="280" cy="380" r="16" fill="rgba(181,114,58,0.2)" />
        </svg>
        <div style={{ position: "relative", maxWidth: 680, zIndex: 2 }} className="fade-up">
          <div style={{ display: "inline-flex", background: "var(--leaf)", border: "1px solid var(--leaf-mid)", borderRadius: 40, padding: "6px 14px", fontSize: "0.78rem", color: "var(--sage)", marginBottom: 28 }}>
            🌿 Est. — Prayagraj, Uttar Pradesh
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(3rem, 7vw, 5.5rem)", fontWeight: 600, lineHeight: 1.05, color: "var(--forest)", marginBottom: 20 }}>
            Your Journey to <em style={{ fontStyle: "italic", fontWeight: 300, color: "var(--terra)" }}>Lifelong</em> Wellness
          </h1>
          <p style={{ fontSize: "1.05rem", lineHeight: 1.75, color: "var(--muted)", maxWidth: 520, marginBottom: 38, fontWeight: 300 }}>
            Guided by Nishant Jha, a certified government yoga teacher with 10+ years of experience, serving 10,000+ students from India and beyond.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link to="/contact" className="btn-primary">🌿 Apply to Join</Link>
            <Link to="/contact" className="btn-outline">📞 Get in Touch</Link>
          </div>
          <div style={{ display: "flex", gap: 40, marginTop: 56, paddingTop: 40, borderTop: "1px solid var(--border)", flexWrap: "wrap" }}>
            {[["10,000+", "Students Worldwide"], ["10+", "Years of Experience"],  [plan ? `${plan.currency}${plan.price}` : "₹1200", "Per Month"]].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.4rem", fontWeight: 600, color: "var(--forest)", lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 4, letterSpacing: "0.05em" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOCUS */}
      <section style={{ background: "var(--warm-white)", padding: "96px 5%" }}>
        <div style={{ maxWidth: 600, marginBottom: 56 }}>
          <div className="section-label">Our Practice</div>
          <h2 className="section-title">What We <em>Offer</em></h2>
          <p style={{ marginTop: 16, color: "var(--muted)", fontWeight: 300, lineHeight: 1.8 }}>
            A comprehensive curriculum designed to nurture body, mind, and spirit.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20, maxWidth: 1200, margin: "0 auto" }}>
          {[
            ["🌊", "Vinyasa Yoga", "Flowing, breath-linked movement sequences."],
            ["🧘", "Hatha Yoga", "Classical postures, breathing, and relaxation."],
            ["🧱", "Wall Yoga", "Wall-assisted poses for alignment and support."],
            ["☀️", "Sun Salutation", "Surya Namaskar to energize the body."],
            ["😌", "Yoga Nidra", "Guided deep-rest meditation for restoration."],
            ["🔥", "Ashtanga Yoga (Basic, Intermediate, Advance)", "Standing, mixed, and advanced sequences across the full Ashtanga path."],
            ["🌙", "Moon Salutation", "Chandra Namaskar for calm, grounding energy."],
            ["🌸", "Yin Yoga", "Deep passive stretches for stillness."],
          ].map(([e, t, d]) => (
            <div key={t} className="card" style={{ transition: "transform .3s, box-shadow .3s" }}>
              <div style={{ fontSize: "2rem", marginBottom: 14 }}>{e}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", fontWeight: 600, color: "var(--forest)", marginBottom: 8 }}>{t}</div>
              <div style={{ fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.65, fontWeight: 300 }}>{d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA to offerings */}
      <section style={{ padding: "80px 5%", textAlign: "center" }}>
        <div className="section-label" style={{ justifyContent: "center" }}>Join Us</div>
        <h2 className="section-title">Ready to <em>Begin</em>?</h2>
        <p style={{ color: "var(--muted)", margin: "16px 0 32px" }}>See our full offerings and pricing.</p>
        <Link to="/offerings" className="btn-primary">View Offerings →</Link>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ background: "var(--leaf)", padding: "96px 5%" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="section-label" style={{ justifyContent: "center" }}>Student Voices</div>
          <h2 className="section-title">What Our <em>Students Say</em></h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24, maxWidth: 1100, margin: "0 auto" }}>
          {[
            { name: "Vansh", role: "Yoga Student · India", img: "/testimonials/vansh.png", text: "Nishant Sir is an excellent yoga teacher! Calm, disciplined, and truly understands each student. Highly recommend him." },
            { name: "Karla", role: "Yoga Student · Mexico 🇲🇽", img: "/testimonials/karla.png", text: "My online classes from Mexico helped me so much and changed my life totally. Thank you for the patience and support." },
            { name: "Anonymous", role: "Yoga Student", img: "/testimonials/student.png", text: "This yoga class focuses on both physical and mental health. I've been feeling stress-free and happy since I started." },
          ].map((t) => (
            <div key={t.name} className="card" style={{ borderRadius: 24, padding: "36px 32px" }}>
              <div style={{ color: "var(--gold)", marginBottom: 18 }}>★★★★★</div>
              <p style={{ fontSize: "0.92rem", lineHeight: 1.8, color: "var(--muted)", fontWeight: 300, marginBottom: 24, fontStyle: "italic" }}>{t.text}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <img src={t.img} alt={t.name} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--forest)" }}>{t.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}