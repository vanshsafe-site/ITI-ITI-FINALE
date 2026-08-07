import type { ReactNode } from "react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { FloatingCTAs } from "./FloatingCTAs";
import { Starfield } from "./Starfield";

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--cream)" }}>
      <Starfield />
      <Nav />
      <main style={{ flex: 1, paddingTop: 0 }}>{children}</main>
      <Footer />
      <FloatingCTAs />
    </div>
  );
}