export function Footer() {
  return (
    <footer
      style={{
        background: "var(--forest)",
        padding: "48px 5% 32px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 600, color: "var(--cream)", marginBottom: 8 }}>
        Iti Iti Yogashram
      </div>
      <div style={{ fontSize: "0.82rem", color: "rgba(253,250,244,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 24 }}>
        Building Daily Yoga Habits for Lifelong Wellness
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
        <a href="https://instagram.com/iti_iti_yogashram" target="_blank" rel="noopener" style={{ color: "rgba(253,250,244,0.5)", fontSize: "0.8rem", textDecoration: "none" }}>Instagram</a>
        <a href="https://www.youtube.com/@ItiItiYogashram" target="_blank" rel="noopener" style={{ color: "rgba(253,250,244,0.5)", fontSize: "0.8rem", textDecoration: "none" }}>YouTube</a>
        <a href="mailto:contact@itiitiyoga.com" style={{ color: "rgba(253,250,244,0.5)", fontSize: "0.8rem", textDecoration: "none" }}>Email</a>
      </div>
      <div style={{ width: 60, height: 1, background: "rgba(255,255,255,0.15)", margin: "32px auto" }} />
      <div style={{ fontSize: "0.78rem", color: "rgba(253,250,244,0.35)" }}>
        © {new Date().getFullYear()} Iti Iti Yogashram · All rights reserved
      </div>
    </footer>
  );
}
