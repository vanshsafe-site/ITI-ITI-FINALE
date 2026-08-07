import type { CSSProperties } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({
    meta: [
      { title: "Contact Us | Iti Iti Yogashram" },
      { name: "description", content: "Get in touch with Iti Iti Yogashram for yoga class enrollment, questions, or collaborations in Prayagraj and online." },
      { property: "og:title", content: "Contact Us | Iti Iti Yogashram" },
      { property: "og:description", content: "Get in touch with Iti Iti Yogashram for yoga class enrollment, questions, or collaborations in Prayagraj and online." },
      { property: "og:type", content: "website" },
    ],
  }),
});

function Contact() {
  const socialLinks = [
    {
      name: "WhatsApp",
      url: "https://wa.me/918081506872",
      color: "#25D366",
      glow: "rgba(37,211,102,0.45)",
      path: (
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.74.46 3.44 1.32 4.94L2.05 22l5.29-1.39a9.9 9.9 0 0 0 4.7 1.2h.01c5.46 0 9.9-4.45 9.9-9.9 0-2.64-1.03-5.13-2.9-7C17.18 3.03 14.68 2 12.04 2Zm0 18.12h-.01a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.14.82.84-3.06-.2-.31a8.2 8.2 0 0 1-1.26-4.37c0-4.54 3.7-8.24 8.27-8.24 2.21 0 4.28.86 5.84 2.42a8.19 8.19 0 0 1 2.42 5.83c0 4.55-3.7 8.24-8.26 8.24Zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.42h-.48c-.16 0-.42.06-.64.31-.22.25-.85.83-.85 2.02 0 1.2.87 2.35.99 2.51.12.17 1.71 2.61 4.14 3.66.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.47-.6 1.68-1.18.2-.58.2-1.08.14-1.18-.06-.1-.22-.16-.47-.28Z" />
      ),
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/iti_iti_yogashram",
      color: "#E4405F",
      glow: "rgba(228,64,95,0.45)",
      path: (
        <path d="M12 2c-2.72 0-3.06.01-4.12.06-1.06.05-1.79.22-2.43.47-.66.26-1.22.6-1.77 1.16-.56.55-.9 1.11-1.16 1.77-.25.64-.42 1.37-.47 2.43C2 8.94 2 9.28 2 12s.01 3.06.06 4.12c.05 1.06.22 1.79.47 2.43.26.66.6 1.22 1.16 1.77.55.56 1.11.9 1.77 1.16.64.25 1.37.42 2.43.47C8.94 22 9.28 22 12 22s3.06-.01 4.12-.06c1.06-.05 1.79-.22 2.43-.47.66-.26 1.22-.6 1.77-1.16.56-.55.9-1.11 1.16-1.77.25-.64.42-1.37.47-2.43.05-1.06.06-1.4.06-4.12s-.01-3.06-.06-4.12c-.05-1.06-.22-1.79-.47-2.43a4.9 4.9 0 0 0-1.16-1.77 4.9 4.9 0 0 0-1.77-1.16c-.64-.25-1.37-.42-2.43-.47C15.06 2.01 14.72 2 12 2Zm0 1.8c2.67 0 2.99.01 4.04.06.98.04 1.5.2 1.86.34.47.18.8.4 1.15.75.35.35.57.68.75 1.15.14.36.3.88.34 1.86.05 1.05.06 1.37.06 4.04s-.01 2.99-.06 4.04c-.04.98-.2 1.5-.34 1.86-.18.47-.4.8-.75 1.15-.35.35-.68.57-1.15.75-.36.14-.88.3-1.86.34-1.05.05-1.37.06-4.04.06s-2.99-.01-4.04-.06c-.98-.04-1.5-.2-1.86-.34a3.1 3.1 0 0 1-1.15-.75 3.1 3.1 0 0 1-.75-1.15c-.14-.36-.3-.88-.34-1.86-.05-1.05-.06-1.37-.06-4.04s.01-2.99.06-4.04c.04-.98.2-1.5.34-1.86.18-.47.4-.8.75-1.15.35-.35.68-.57 1.15-.75.36-.14.88-.3 1.86-.34C9.01 3.81 9.33 3.8 12 3.8Zm0 3.06a5.14 5.14 0 1 0 0 10.28 5.14 5.14 0 0 0 0-10.28Zm0 8.48a3.34 3.34 0 1 1 0-6.68 3.34 3.34 0 0 1 0 6.68Zm6.54-8.68a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0Z" />
      ),
    },
    {
      name: "Facebook",
      url: "https://www.facebook.com/profile.php?id=100094601637698",
      color: "#1877F2",
      glow: "rgba(24,119,242,0.45)",
      path: (
        <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.77l-.44 2.91h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
      ),
    },
    {
      name: "YouTube",
      url: "https://www.youtube.com/@ItiItiYogashram",
      color: "#FF0000",
      glow: "rgba(255,0,0,0.4)",
      path: (
        <path d="M23.5 7.05a3.02 3.02 0 0 0-2.12-2.14C19.5 4.4 12 4.4 12 4.4s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 7.05 31.6 31.6 0 0 0 0 12.6a31.6 31.6 0 0 0 .5 5.55 3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14 31.6 31.6 0 0 0 .5-5.55 31.6 31.6 0 0 0-.5-5.55ZM9.6 16.13V9.07l6.27 3.53-6.27 3.53Z" />
      ),
    },
  ];

  return (
    <PageLayout>
      <section style={{ padding: "120px 5% 96px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64 }} className="contact-grid">
          <div>
            <div className="section-label">Find Us</div>
            <h1 className="section-title">Get in <em>Touch</em></h1>
            <div style={{ marginTop: 32 }}>
              {[
                ["📞", "Phone", "(+91) 808-150-6872"],
                ["✉️", "Email", "contact@itiitiyoga.com"],
                ["📍", "Address", "First Floor, Sabzi Mandi, 1234A/517A, Chauraha, Meerapur, Prayagraj, Uttar Pradesh 211016"],
                ["🗓️", "Schedule", "Monday – Saturday · 1 hr 15 min · 5 batches daily"],
              ].map(([i, l, v]) => (
                <div key={l} style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                  <div style={{ fontSize: "1.5rem" }}>{i}</div>
                  <div>
                    <div style={{ fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", fontWeight: 600 }}>{l}</div>
                    <div style={{ color: "var(--text)", marginTop: 4 }}>{v}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginTop: 26 }}>
              {[
                ["🌍", "Country support", "India + international students"],
                ["🕊️", "Response time", "Same day"],
                ["🧘", "Best fit", "Beginners to experienced"],
              ].map(([icon, title, detail]) => (
                <div key={title} className="card" style={{ padding: 18 }}>
                  <div style={{ fontSize: "1.25rem", marginBottom: 8 }}>{icon}</div>
                  <div style={{ fontWeight: 600, color: "var(--forest)", fontSize: "0.92rem", marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--muted)", lineHeight: 1.6 }}>{detail}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div
              className="card"
              style={{
                padding: 0,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                minHeight: 420,
              }}
            >
              <iframe
                title="Iti Iti Yogashram location"
                src="https://maps.google.com/maps?q=First%20Floor%2C%20Sabzi%20Mandi%2C%201234A%2F517A%2C%20Chauraha%2C%20Meerapur%2C%20Prayagraj%2C%20Uttar%20Pradesh%20211016&z=15&output=embed"
                style={{ border: 0, width: "100%", height: 260, display: "block" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", color: "var(--forest)" }}>
                  Come practice with us
                </h3>
                <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                  Whether you're joining a live batch or dropping by, we'd love to welcome you.
                  Reach out directly — a real person will get back to you the same day.
                </p>
                <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                  <a
                    href="https://wa.me/918081506872"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary"
                    style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}
                  >
                    💬 Message on WhatsApp
                  </a>
                  <a
                    href="mailto:contact@itiitiyoga.com"
                    className="btn-outline"
                    style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}
                  >
                    ✉️ Email us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section
        className="social-section"
        style={{
          position: "relative",
          padding: "72px 5% 96px",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(216,184,118,0.09) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="section-label" style={{ justifyContent: "center", display: "flex" }}>Connect With Us</div>
            <h2 className="section-title">Follow Our <em>Journey</em></h2>
            <p style={{ fontSize: "1rem", color: "var(--muted)", marginTop: 16, maxWidth: 600, margin: "16px auto 0" }}>
              Stay updated with daily yoga tips, class schedules, and wellness inspiration across all platforms
            </p>
          </div>

          <div className="social-grid">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                aria-label={social.name}
                className="social-btn"
                style={{ "--social-color": social.color, "--social-glow": social.glow } as CSSProperties}
              >
                <span className="social-icon">
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                    {social.path}
                  </svg>
                </span>
                <span className="social-label">{social.name}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "0 5% 96px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }} className="card" style={{ padding: "28px 32px" }}>
          <div className="section-label">Quick FAQ</div>
          <h2 className="section-title">Before you <em>reach out</em></h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginTop: 24 }}>
            {[
              ["Who can join?", "Beginners, working professionals, seniors, and international students are all welcome."],
              ["Do I need equipment?", "A mat, water, and a quiet space are enough to begin."],
              ["What if I miss a class?", "Recorded access and flexible guidance are included with membership."],
            ].map(([q, a]) => (
              <div key={q} style={{ border: "1px solid var(--border)", borderRadius: 16, padding: 18, background: "var(--cream)" }}>
                <div style={{ fontWeight: 700, color: "var(--forest)", marginBottom: 6 }}>{q}</div>
                <div style={{ fontSize: "0.84rem", color: "var(--muted)", lineHeight: 1.65 }}>{a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <style>{`
        @media (max-width: 900px) { .contact-grid { grid-template-columns: 1fr !important; gap: 40px !important; } }

        .social-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          max-width: 760px;
          margin: 0 auto;
        }
        @media (max-width: 600px) {
          .social-grid { grid-template-columns: repeat(2, 1fr); }
        }

        .social-btn {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 28px 14px;
          border-radius: 18px;
          text-decoration: none;
          background: var(--dusk);
          border: 1.5px solid var(--border);
          box-shadow: 0 20px 60px -30px rgba(0,0,0,0.6);
          transition: border-color .25s ease, transform .25s ease, box-shadow .25s ease, background .25s ease;
        }
        .social-btn:hover,
        .social-btn:focus-visible {
          transform: translateY(-6px);
          border-color: var(--social-color);
          background: var(--leaf-mid);
          box-shadow: 0 16px 34px -14px var(--social-glow), 0 20px 60px -30px rgba(0,0,0,0.6);
        }
        .social-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          color: var(--social-color);
          background: color-mix(in srgb, var(--social-color) 14%, transparent);
          transition: transform .25s ease, background .25s ease;
        }
        .social-btn:hover .social-icon,
        .social-btn:focus-visible .social-icon {
          transform: scale(1.1);
          background: color-mix(in srgb, var(--social-color) 26%, transparent);
        }
        .social-label {
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: var(--muted);
          transition: color .25s ease;
        }
        .social-btn:hover .social-label,
        .social-btn:focus-visible .social-label {
          color: var(--forest);
        }
      `}</style>
    </PageLayout>
  );
}
