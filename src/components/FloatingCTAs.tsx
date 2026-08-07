import { Link } from "@tanstack/react-router";

export function FloatingCTAs() {
  return (
    <div
      aria-label="Quick actions"
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <a
        href="https://wa.me/918081506872"
        target="_blank"
        rel="noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 54,
          height: 54,
          borderRadius: "50%",
          background: "#25D366",
          color: "#fff",
          textDecoration: "none",
          boxShadow: "0 16px 34px rgba(37, 211, 102, 0.35)",
          fontSize: "1.35rem",
        }}
        aria-label="Chat on WhatsApp"
      >
        💬
      </a>
      <Link
        to="/contact"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 54,
          height: 54,
          borderRadius: "50%",
          background: "var(--forest)",
          color: "var(--cream)",
          textDecoration: "none",
          boxShadow: "0 16px 34px rgba(6,8,18,0.25)",
          fontSize: "1.2rem",
        }}
        aria-label="Contact us"
      >
        ✨
      </Link>
      <a
        href="mailto:contact@itiitiyoga.com"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 54,
          height: 54,
          borderRadius: "50%",
          background: "var(--terra)",
          color: "var(--cream)",
          textDecoration: "none",
          boxShadow: "0 16px 34px rgba(216,184,118,0.28)",
          fontSize: "1.2rem",
        }}
        aria-label="Email us"
      >
        ✉️
      </a>
    </div>
  );
}
