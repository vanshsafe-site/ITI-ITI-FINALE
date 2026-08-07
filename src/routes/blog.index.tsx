import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { supabase } from "@/lib/supabase";

type Post = { id: string; slug: string; title: string; excerpt: string | null; cover_image_url: string | null; published_at: string | null; category: string; topic_id: string | null; subtopic_id: string | null };
type BlogTopic = { id: string; name: string; slug: string; parent_id: string | null; sort_order: number };

export const Route = createFileRoute("/blog/")({
  component: BlogList,
  loader: async () => {
    // Fetched server-side so the post list (and its links to each post)
    // are present in the initial HTML — this is what lets Google discover
    // individual posts by crawling, not just via the sitemap.
    const [postsRes, topicsRes] = await Promise.all([
      supabase
        .from("blog_posts")
        .select("id,slug,title,excerpt,cover_image_url,published_at,category,topic_id,subtopic_id")
        .eq("published", true)
        .order("published_at", { ascending: false }),
      supabase
        .from("blog_topics")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
    ]);
    return {
      posts: (postsRes.data as Post[] | null) ?? [],
      topics: (topicsRes.data as BlogTopic[] | null) ?? [],
    };
  },
  head: () => ({
    meta: [
      { title: "Blog | Iti Iti Yogashram" },
      { name: "description", content: "Yoga, wellness and lifestyle articles from Iti Iti Yogashram — tips, practices and insights from Nishant Jha." },
      { property: "og:title", content: "Blog | Iti Iti Yogashram" },
      { property: "og:description", content: "Yoga, wellness and lifestyle articles from Iti Iti Yogashram — tips, practices and insights from Nishant Jha." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://itiitiyogashram.vercel.app/blog" }],
  }),
});

function BlogList() {
  const { posts, topics } = Route.useLoaderData();
  const [query, setQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [selectedSubtopic, setSelectedSubtopic] = useState("All");

  const parentTopics = useMemo(() => topics.filter((topic) => !topic.parent_id), [topics]);
  const subtopicsForSelectedTopic = useMemo(() => selectedTopic === "All" ? [] : topics.filter((topic) => topic.parent_id === selectedTopic), [selectedTopic, topics]);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchesTopic = selectedTopic === "All" || p.topic_id === selectedTopic;
      const matchesSubtopic = selectedSubtopic === "All" || p.subtopic_id === selectedSubtopic;
      const q = query.trim().toLowerCase();
      const matchesQuery = !q || p.title.toLowerCase().includes(q) || (p.excerpt || "").toLowerCase().includes(q);
      return matchesTopic && matchesSubtopic && matchesQuery;
    });
  }, [posts, query, selectedTopic, selectedSubtopic]);

  const getTopicName = (post: Post) => {
    const topic = topics.find((item) => item.id === post.topic_id && !item.parent_id);
    const subtopic = topics.find((item) => item.id === post.subtopic_id);
    return [topic?.name, subtopic?.name].filter(Boolean).join(" · ");
  };

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
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            <button onClick={() => { setSelectedTopic("All"); setSelectedSubtopic("All"); }} className={selectedTopic === "All" ? "btn-primary" : "btn-outline"} style={{ fontSize: "0.8rem", padding: "6px 16px" }}>
              All topics
            </button>
            {parentTopics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => { setSelectedTopic(topic.id); setSelectedSubtopic("All"); }}
                className={selectedTopic === topic.id ? "btn-primary" : "btn-outline"}
                style={{ fontSize: "0.8rem", padding: "6px 16px" }}
              >
                {topic.name}
              </button>
            ))}
          </div>
          {selectedTopic !== "All" && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              <button onClick={() => setSelectedSubtopic("All")} className={selectedSubtopic === "All" ? "btn-primary" : "btn-outline"} style={{ fontSize: "0.8rem", padding: "6px 16px" }}>
                All subtopics
              </button>
              {subtopicsForSelectedTopic.map((topic) => (
                <button key={topic.id} onClick={() => setSelectedSubtopic(topic.id)} className={selectedSubtopic === topic.id ? "btn-primary" : "btn-outline"} style={{ fontSize: "0.8rem", padding: "6px 16px" }}>
                  {topic.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section style={{ padding: "20px 5% 96px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {filtered.length === 0 && (
            <div className="card" style={{ padding: 40, textAlign: "center" }}>
              <p style={{ color: "var(--muted)" }}>{posts.length === 0 ? "No posts yet." : "No posts match your search."}</p>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
            {filtered.map((p) => (
              <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }} style={{ textDecoration: "none" }}>
                <article className="card" style={{ padding: 0, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
                  {p.cover_image_url ? (
                    <img src={p.cover_image_url} alt={`Yoga blog preview image for ${p.title}`} style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover" }} />
                  ) : (
                    <div style={{ background: "var(--leaf)", aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>🪷</div>
                  )}
                  <div style={{ padding: 24 }}>
                    <div style={{ fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--terra)", marginBottom: 6 }}>{getTopicName(p) || p.category || "General"}</div>
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