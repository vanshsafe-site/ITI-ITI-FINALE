import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { PageLayout } from "@/components/PageLayout";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) nav({ to: "/auth" });
      else if (!isAdmin) nav({ to: "/dashboard" });
    }
  }, [loading, user, isAdmin, nav]);

  if (loading || !user || !isAdmin) {
    return <PageLayout><div style={{ padding: 120, textAlign: "center", color: "var(--muted)" }}>Checking access…</div></PageLayout>;
  }

  const link = (to: string, label: string) => (
    <Link
      to={to}
      style={{ padding: "8px 16px", borderRadius: 8, textDecoration: "none", color: "var(--forest)", fontSize: "0.9rem" }}
      activeOptions={{ exact: to === "/admin" }}
      activeProps={{ style: { background: "var(--leaf)", color: "var(--forest)", fontWeight: 600 } }}
    >{label}</Link>
  );

  return (
    <PageLayout>
      <section style={{ padding: "100px 5% 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="section-label">Admin</div>
          <h1 className="section-title">Site <em>Control</em></h1>
          <nav style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 24, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
            {link("/admin", "Overview")}
            {link("/admin/users", "Users")}
            {link("/admin/pricing", "Pricing")}
            {link("/admin/videos", "Videos")}
            {link("/admin/blog", "Blog")}
          </nav>
        </div>
      </section>
      <section style={{ padding: "20px 5% 96px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Outlet />
        </div>
      </section>
    </PageLayout>
  );
}