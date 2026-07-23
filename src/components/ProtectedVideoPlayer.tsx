import { useEffect } from "react";

type Video = { id: string; title: string; description: string | null; youtube_id: string };

export function ProtectedVideoPlayer({ video, onClose }: { video: Video; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // db row might hold a full URL or messy value instead of clean 11-char id
  // (old rows made before id-parsing existed) — strip it down same as admin form does
  const cleanId = (() => {
    const m = video.youtube_id.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
    return m ? m[1] : video.youtube_id.trim();
  })();

  const src = `https://www.youtube-nocookie.com/embed/${cleanId}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(28,28,26,0.92)",
        zIndex: 200, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <button
        onClick={onClose}
        style={{ position: "absolute", top: 20, right: 20, background: "var(--cream)", border: "none", borderRadius: 40, padding: "10px 20px", cursor: "pointer", fontWeight: 500 }}
      >
        ✕ Close
      </button>

      <div style={{ width: "100%", maxWidth: 1000 }}>
        <div style={{ color: "var(--cream)", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", marginBottom: 16 }}>
          {video.title}
        </div>
        <div
          style={{
            position: "relative", aspectRatio: "16/9",
            background: "#000", borderRadius: 16, overflow: "hidden",
            boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
          }}
        >
          <iframe
            src={src}
            title={video.title}
            allow="autoplay; accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        </div>
        {video.description && (
          <p style={{ color: "rgba(253,250,244,0.7)", marginTop: 16, lineHeight: 1.7 }}>{video.description}</p>
        )}
        <p style={{ color: "rgba(253,250,244,0.4)", marginTop: 12, fontSize: "0.8rem" }}>
          Content is for personal, non-commercial use only. Please do not share or redistribute.
        </p>
      </div>
    </div>
  );
}