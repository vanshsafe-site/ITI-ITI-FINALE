import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";

export const Route = createFileRoute("/contact")({ component: Contact });

function Contact() {
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
      <style>{`@media (max-width: 900px) { .contact-grid { grid-template-columns: 1fr !important; gap: 40px !important; } }`}</style>
    </PageLayout>
  );
}