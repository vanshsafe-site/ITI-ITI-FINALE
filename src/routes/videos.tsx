import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { ProtectedVideoPlayer } from "@/components/ProtectedVideoPlayer";
import { FreePreviewVideo } from "@/components/FreePreviewVideo";

export const Route = createFileRoute("/videos")({
  component: Videos,
  head: () => ({
    meta: [
      { title: "Yoga Videos | Iti Iti Yogashram" },
      { name: "description", content: "Watch yoga practice videos and free previews from Iti Iti Yogashram, led by Nishant Jha." },
      { property: "og:title", content: "Yoga Videos | Iti Iti Yogashram" },
      { property: "og:description", content: "Watch yoga practice videos and free previews from Iti Iti Yogashram, led by Nishant Jha." },
      { property: "og:type", content: "website" },
    ],
  }),
});

type Video = {
  id: string;
  title: string;
  description: string | null;
  youtube_id: string;
  thumbnail_url: string | null;
  is_free: boolean | null;
};

function Videos() {
  const { user, profile, isAdmin, loading } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [active, setActive] = useState<Video | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isActive = isAdmin || profile?.status === "active";

  useEffect(() => {
    if (!user) { setDataLoading(false); return; }
    let cancelled = false;
    setDataLoading(true);
    setError(null);

    const query = supabase
      .from("videos")
      .select("*")
      .order("sort_order");

    const request = isActive ? query : query.eq("is_free", true);

    request.then(({ data, error }) => {
      if (cancelled) return;
      if (error) { setError(error.message); setVideos([]); }
      else { setVideos((data as any) || []); }
      setDataLoading(false);
    });

    return () => { cancelled = true; };
  }, [user, isActive]);

  if (loading) {
    return <PageLayout><div style={{ padding: 120, textAlign: "center", color: "var(--muted)" }}>Loading…</div></PageLayout>;
  }

  if (!user) {
    return (
      <PageLayout>
        <section style={{ padding: "120px 5%", textAlign: "center" }}>
          <h1 className="section-title">Sign in required</h1>
          <p style={{ color: "var(--muted)", margin: "16px 0 24px" }}>Please sign in to access videos.</p>
          <a href="/auth" className="btn-primary">Sign in</a>
        </section>
        <section style={{ padding: "0 5% 96px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <FreePreviewVideo />
          </div>
        </section>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <section style={{ padding: "120px 5% 60px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="section-label">{isActive ? "Members Only" : "Preview Access"}</div>
          <h1 className="section-title">Video <em>Library</em></h1>
          <p style={{ color: "var(--muted)", marginTop: 12 }}>
            {isActive
              ? "Exclusive classes for active members. Please do not share."
              : "Your account is pending activation. Logged-in members can still preview admin-approved free videos until activation is complete."}
          </p>
        </div>
      </section>

      <section style={{ padding: "20px 5% 96px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {dataLoading && <p style={{ color: "var(--muted)" }}>Loading videos…</p>}

          {!dataLoading && error && (
            <div className="card" style={{ padding: 40, textAlign: "center" }}>
              <p style={{ color: "#c33", marginBottom: 8 }}>Could not load videos.</p>
              <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{error}</p>
            </div>
          )}

          {!dataLoading && !error && videos.length === 0 && (
            <div className="card" style={{ padding: 40, textAlign: "center" }}>
              <p style={{ color: "var(--muted)" }}>
                {isActive ? "No videos yet. Check back soon." : "No free preview videos are available yet. Once your account is activated, the full library will open up."}
              </p>
            </div>
          )}

          {!dataLoading && !error && videos.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {videos.map((v) => (
                <VideoCard key={v.id} video={v} onOpen={() => setActive(v)} />
              ))}
            </div>
          )}

          {!isActive && !dataLoading && videos.length > 0 && (
            <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
              <Link to="/contact" className="btn-primary">Contact Us</Link>
            </div>
          )}
        </div>
      </section>

      {active && <ProtectedVideoPlayer video={active} onClose={() => setActive(null)} />}
    </PageLayout>
  );
}

function VideoCard({ video, onOpen }: { video: Video; onOpen: () => void }) {
  const [thumbFailed, setThumbFailed] = useState(false);
  const thumb = video.thumbnail_url || `https://i.ytimg.com/vi/${video.youtube_id}/hqdefault.jpg`;

  return (
    <button
      onClick={onOpen}
      style={{ background: "var(--cream)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", cursor: "pointer", padding: 0, textAlign: "left", transition: "transform .3s, box-shadow .3s" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(6,8,18,.1)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      <div style={{ aspectRatio: "16/9", background: "var(--leaf)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {!thumbFailed ? (
          <img
            src={thumb}
            alt={`Yoga exercises video thumbnail: ${video.title}`}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onContextMenu={(e) => e.preventDefault()}
            onError={() => setThumbFailed(true)}
          />
        ) : (
          <div style={{ fontSize: "3rem" }}>🎥</div>
        )}
        <div style={{ position: "absolute", inset: 0, background: "rgba(6,8,18,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(11,14,29,0.9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", color: "var(--forest)" }}>▶</div>
        </div>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 600, color: "var(--forest)" }}>{video.title}</div>
        {video.description && <div style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: 6, lineHeight: 1.5 }}>{video.description}</div>}
      </div>
    </button>
  );
}