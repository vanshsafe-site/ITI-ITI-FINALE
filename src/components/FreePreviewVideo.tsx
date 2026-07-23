import { useState } from "react";
import { ProtectedVideoPlayer } from "@/components/ProtectedVideoPlayer";

const FREE_VIDEO = {
  id: "free-preview",
  title: "Free Preview Class",
  description: "A short intro to get a feel for our teaching style.",
  youtube_id: "ABVj6ZsgZHg",
};

export function FreePreviewVideo() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ margin: "40px 0", padding: "24px", background: "rgba(197,217,168,0.12)", border: "1px solid rgba(117,146,101,0.18)", borderRadius: 24, boxSizing: "border-box", overflow: "hidden" }}>
      <div
        style={{
          fontSize: "0.75rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: 16,
        }}
      >
        Free preview
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))", gap: 24, alignItems: "center" }}>
        <div
          onClick={() => setOpen(true)}
          style={{
            aspectRatio: "16/9",
            width: "100%",
            minWidth: 0,
            background: `url(https://img.youtube.com/vi/${FREE_VIDEO.youtube_id}/hqdefault.jpg) center/cover`,
            borderRadius: 16,
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 18px 40px rgba(0,0,0,0.16)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.25)",
              borderRadius: 16,
              color: "#fff",
              fontSize: "2rem",
            }}
          >
            ▶
          </div>
        </div>

        <div style={{ textAlign: "left", minWidth: 0 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.45rem", fontWeight: 600, color: "var(--forest)", marginBottom: 10 }}>
            {FREE_VIDEO.title}
          </div>
          <p style={{ color: "var(--muted)", lineHeight: 1.8, marginBottom: 14, fontWeight: 300, overflowWrap: "break-word" }}>
            Get a real feel for the energy, pace, and guidance of our sessions before you commit. This free preview is a calm, welcoming introduction to the practice.
          </p>
          <ul style={{ paddingLeft: 18, margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
            <li>Live online & offline support</li>
            <li>Gentle, structured guidance</li>
            <li>Perfect for beginners and returning students</li>
          </ul>
        </div>
      </div>

      {open && <ProtectedVideoPlayer video={FREE_VIDEO} onClose={() => setOpen(false)} />}
    </div>
  );
}