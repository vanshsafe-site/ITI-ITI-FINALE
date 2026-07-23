import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/blog/")({ component: BlogList });

type Post = { id: string; slug: string; title: string; excerpt: string | null; cover_image_url: string | null; published_at: string | null; category: string };

function BlogList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    supabase.from("blog_posts").select("id,slug,title,excerpt,cover_image_url,published_at,category")
      .eq("published", true).order("published_at", { ascending: false })
      .then(({ data }) => { setPosts((data as any) || []); setLoading(false); });
  }, []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(posts.map((p) => p.category || "General")))], [posts]);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchesCategory = category === "All" || (p.category || "General") === category;
      const q = query.trim().toLowerCase();
      const matchesQuery = !q || p.title.toLowerCase().includes(q) || (p.excerpt || "").toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [posts, query, category]);

  return (
    <PageLayout>
      <section style={{ padding: "120px 5% 60px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="section-label">Journal</div>
          <h1 className="section-title">Yoga <em>Blog</em></h1>
          <p style={{ color: "var(--muted)", marginTop: 12 }}>Reflections, tips, and teachings from the shala.</p>
        </div>
      </section>

      <section style={{ padding: "0 5% 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <input
            className="field"
            placeholder="Search posts…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ maxWidth: 420, marginBottom: 20 }}
          />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={category === c ? "btn-primary" : "btn-outline"}
                style={{ fontSize: "0.8rem", padding: "6px 16px" }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "20px 5% 96px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {loading && <p style={{ color: "var(--muted)" }}>Loading…</p>}
          {!loading && filtered.length === 0 && (
            <div className="card" style={{ padding: 40, textAlign: "center" }}>
              <p style={{ color: "var(--muted)" }}>{posts.length === 0 ? "No posts yet." : "No posts match your search."}</p>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
            {filtered.map((p) => (
              <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }} style={{ textDecoration: "none" }}>
                <article className="card" style={{ padding: 0, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
                  {p.cover_image_url ? (
                    <img src={p.cover_image_url} alt="" style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover" }} />
                  ) : (
                    <div style={{ background: "var(--leaf)", aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>🪷</div>
                  )}
                  <div style={{ padding: 24 }}>
                    <div style={{ fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--terra)", marginBottom: 6 }}>{p.category || "General"}</div>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", color: "var(--forest)", fontWeight: 600, marginBottom: 8 }}>{p.title}</h3>
                    {p.excerpt && <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>{p.excerpt}</p>}
                    {p.published_at && <div style={{ color: "var(--muted)", fontSize: "0.75rem", marginTop: 12, letterSpacing: "0.05em" }}>{new Date(p.published_at).toLocaleDateString()}</div>}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}