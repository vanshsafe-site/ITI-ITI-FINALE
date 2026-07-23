import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/blog/$slug")({ component: BlogPost });

type Post = { id: string; slug: string; title: string; excerpt: string | null; content: string; cover_image_url: string | null; published_at: string | null };

function BlogPost() {
  const { slug } = Route.useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("blog_posts").select("*").eq("slug", slug).eq("published", true).maybeSingle()
      .then(({ data }) => { setPost(data as any); setLoading(false); });
  }, [slug]);

  if (loading) return <PageLayout><div style={{ padding: 120, textAlign: "center", color: "var(--muted)" }}>Loading…</div></PageLayout>;
  if (!post) {
    return (
      <PageLayout>
        <section style={{ padding: "120px 5%", textAlign: "center" }}>
          <h1 className="section-title">Post not found</h1>
          <Link to="/blog" className="btn-outline" style={{ marginTop: 24 }}>← Back to blog</Link>
        </section>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <article style={{ padding: "120px 5% 96px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <Link to="/blog" style={{ color: "var(--terra)", fontSize: "0.85rem" }}>← Back to blog</Link>
          {post.published_at && (
            <div style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: 16, letterSpacing: "0.05em" }}>
              {new Date(post.published_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
            </div>
          )}
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "var(--forest)", fontWeight: 600, lineHeight: 1.15, marginTop: 8 }}>
            {post.title}
          </h1>
          {post.cover_image_url && (
            <img src={post.cover_image_url} alt="" style={{ width: "100%", borderRadius: 20, marginTop: 32 }} />
          )}
          <div
            className="prose"
            style={{ marginTop: 32, color: "var(--text)", fontSize: "1.05rem", lineHeight: 1.85 }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </article>
      <style>{`
        .prose h2 { font-family: "Cormorant Garamond", serif; font-size: 2rem; color: var(--forest); margin: 32px 0 12px; font-weight: 600; }
        .prose h3 { font-family: "Cormorant Garamond", serif; font-size: 1.5rem; color: var(--forest); margin: 24px 0 8px; font-weight: 600; }
        .prose p { margin: 16px 0; }
        .prose a { color: var(--terra); }
        .prose img { max-width: 100%; border-radius: 12px; margin: 20px 0; }
        .prose ul, .prose ol { margin: 16px 0; padding-left: 24px; }
        .prose blockquote { border-left: 3px solid var(--sage); padding-left: 20px; color: var(--muted); font-style: italic; margin: 20px 0; }
      `}</style>
    </PageLayout>
  );
}
