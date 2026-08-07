import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";
import { supabase } from "@/lib/supabase";

type Post = { id: string; slug: string; title: string; excerpt: string | null; content: string; cover_image_url: string | null; published_at: string | null; topic_id: string | null; subtopic_id: string | null; category: string | null };
type BlogTopic = { id: string; name: string; slug: string; parent_id: string | null; sort_order: number };

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPost,
  loader: async ({ params }) => {
    // Fetched server-side so the full post renders in the initial HTML —
    // crawlers (and social link previews) see real content, not an empty
    // shell that only fills in after client-side JS runs.
    const [postRes, topicsRes] = await Promise.all([
      supabase
        .from("blog_posts")
        .select("id,slug,title,excerpt,content,cover_image_url,published_at,topic_id,subtopic_id,category")
        .eq("slug", params.slug)
        .eq("published", true)
        .maybeSingle(),
      supabase
        .from("blog_topics")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
    ]);
    return {
      post: (postRes.data as Post | null) ?? null,
      topics: (topicsRes.data as BlogTopic[] | null) ?? [],
    };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    const title = post?.title ? `${post.title} | Iti Iti Yogashram Blog` : "Blog | Iti Iti Yogashram";
    const description = post?.excerpt || "Read the latest yoga, wellness and lifestyle insights from Iti Iti Yogashram.";
    const url = post?.slug ? `https://itiitiyogashram.vercel.app/blog/${post.slug}` : "https://itiitiyogashram.vercel.app/blog";

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        ...(post?.cover_image_url ? [{ property: "og:image", content: post.cover_image_url }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: post
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                headline: post.title,
                description: post.excerpt || undefined,
                image: post.cover_image_url || undefined,
                datePublished: post.published_at || undefined,
                author: { "@type": "Person", name: "Nishant Jha" },
                publisher: { "@type": "Organization", name: "Iti Iti Yogashram" },
                mainEntityOfPage: url,
              }),
            },
          ]
        : [],
    };
  },
});

function BlogPost() {
  const { post, topics } = Route.useLoaderData();

  const topicLabel = post
    ? [
        topics.find((topic) => topic.id === post.topic_id && !topic.parent_id)?.name,
        topics.find((topic) => topic.id === post.subtopic_id)?.name,
      ]
        .filter(Boolean)
        .join(" · ")
    : "";

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
          {topicLabel && (
            <div style={{ color: "var(--terra)", fontSize: "0.85rem", marginTop: 16, fontWeight: 600 }}>{topicLabel}</div>
          )}
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "var(--forest)", fontWeight: 600, lineHeight: 1.15, marginTop: 8 }}>
            {post.title}
          </h1>
          {post.cover_image_url && (
            <img src={post.cover_image_url} alt={`Yoga blog post cover image for ${post.title}`} style={{ width: "100%", borderRadius: 20, marginTop: 32 }} />
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
