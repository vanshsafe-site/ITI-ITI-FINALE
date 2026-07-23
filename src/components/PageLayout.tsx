import type { ReactNode } from "react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--cream)" }}>
      <Nav />
      <main style={{ flex: 1, paddingTop: 80 }}>{children}</main>
      <Footer />
    </div>
  );
}
