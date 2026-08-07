import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState, type MouseEvent } from "react";
import { useAuth } from "@/lib/auth";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkCls = "text-sm font-medium tracking-wide opacity-75 hover:opacity-100 transition-opacity";
  const linkStyle = { color: "var(--forest)" };

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, to: string) => {
    if (location.pathname === to) {
      event.preventDefault();
      setOpen(false);
      window.location.assign(to);
    } else {
      setOpen(false);
    }
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, zIndex: 100,
        padding: "16px 5%",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(11,14,29,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        boxShadow: scrolled ? "0 1px 0 var(--border)" : "none",
        transition: "background .4s, box-shadow .4s",
      }}
    >
      <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
        <span
          aria-hidden="true"
          style={{
            fontSize: "1.4rem", color: "var(--terra)",
            filter: "drop-shadow(0 0 6px rgba(216,184,118,0.5))",
          }}
        >
          ☾
        </span>
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.75rem", fontWeight: 600, color: "var(--forest)", whiteSpace: "nowrap", marginBottom: 3 }}>
            Iti Iti Yogashram
          </div>
          <div style={{ fontSize: "0.65rem", letterSpacing: "0.08em", color: "var(--muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>
            Daily Yoga Lifelong Wellness
          </div>
        </div>
      </Link>

      <button
        onClick={() => setOpen((v) => !v)}
        style={{ display: "none", background: "none", border: "none", color: "var(--forest)", cursor: "pointer" }}
        className="mobile-menu-btn"
        aria-label="Menu"
      >
        ☰
      </button>

      <ul
        className="nav-links"
        style={{
          display: "flex", alignItems: "center", gap: 28, listStyle: "none",
          margin: 0, padding: 0,
        }}
      >
        <li><Link to="/" className={linkCls} style={linkStyle} onClick={(event) => handleNavClick(event, "/")}>Home</Link></li>
        <li><Link to="/about" className={linkCls} style={linkStyle} onClick={(event) => handleNavClick(event, "/about")}>About</Link></li>
        <li><Link to="/offerings" className={linkCls} style={linkStyle} onClick={(event) => handleNavClick(event, "/offerings")}>Offerings</Link></li>
        <li><Link to="/gallery" className={linkCls} style={linkStyle} onClick={(event) => handleNavClick(event, "/gallery")}>Gallery</Link></li>
        <li><Link to="/lunar-yoga" className={linkCls} style={linkStyle} onClick={(event) => handleNavClick(event, "/lunar-yoga")}>Lunar Yoga</Link></li>
        <li><Link to="/blog" className={linkCls} style={linkStyle} onClick={(event) => handleNavClick(event, "/blog")}>Blog</Link></li>
        <li><Link to="/videos" className={linkCls} style={linkStyle} onClick={(event) => handleNavClick(event, "/videos")}>Videos</Link></li>
        <li><Link to="/contact" className={linkCls} style={linkStyle} onClick={(event) => handleNavClick(event, "/contact")}>Contact</Link></li>
        {user ? (
          <>
            <li><Link to="/dashboard" className={linkCls} style={linkStyle}>Dashboard</Link></li>
            {isAdmin && <li><Link to="/admin" className={linkCls} style={{ color: "var(--terra)", fontWeight: 600, opacity: 1 }}>Admin</Link></li>}
            <li>
              <button
                onClick={() => signOut()}
                style={{
                  background: "var(--forest)", color: "var(--cream)",
                  padding: "9px 20px", borderRadius: 40, border: "none",
                  fontSize: "0.85rem", fontWeight: 500, cursor: "pointer",
                }}
              >
                Sign out
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link
                to="/auth"
                onClick={(event) => handleNavClick(event, "/auth")}
                style={{
                  background: "var(--forest)", color: "var(--cream)",
                  padding: "9px 20px", borderRadius: 40,
                  textDecoration: "none", fontSize: "0.85rem", fontWeight: 500,
                }}
              >
                Sign in
              </Link>
            </li>
          </>
        )}
      </ul>

      {open && (
        <div
          className="mobile-menu"
          style={{
            position: "absolute", top: "100%", left: 0, right: 0,
            background: "var(--warm-white)", borderBottom: "1px solid var(--border)",
            padding: 20, display: "flex", flexDirection: "column", gap: 12,
          }}
        >
          <Link to="/" onClick={(event) => handleNavClick(event, "/")}>Home</Link>
          <Link to="/about" onClick={(event) => handleNavClick(event, "/about")}>About</Link>
          <Link to="/offerings" onClick={(event) => handleNavClick(event, "/offerings")}>Offerings</Link>
          <Link to="/gallery" onClick={(event) => handleNavClick(event, "/gallery")}>Gallery</Link>
          <Link to="/lunar-yoga" onClick={(event) => handleNavClick(event, "/lunar-yoga")}>Lunar Yoga</Link>
          <Link to="/blog" onClick={(event) => handleNavClick(event, "/blog")}>Blog</Link>
          <Link to="/videos" onClick={(event) => handleNavClick(event, "/videos")}>Videos</Link>
          <Link to="/contact" onClick={(event) => handleNavClick(event, "/contact")}>Contact</Link>
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
              {isAdmin && <Link to="/admin" onClick={() => setOpen(false)}>Admin</Link>}
              <button onClick={() => { signOut(); setOpen(false); }}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/auth" onClick={() => setOpen(false)}>Sign in</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .nav-links { display: none !important; }
          .mobile-menu-btn { display: block !important; font-size: 1.5rem; }
        }
      `}</style>
    </nav>
  );
}