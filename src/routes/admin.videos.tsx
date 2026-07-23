import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/videos")({ component: AdminVideos });

type Video = { id: string; title: string; description: string | null; youtube_id: string; thumbnail_url: string | null; sort_order: number };

function empty(): Video {
  return { id: "", title: "", description: "", youtube_id: "", thumbnail_url: "", sort_order: 0 };
}

function parseYouTubeId(input: string): string {
  const m = input.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : input;
}

function AdminVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [editing, setEditing] = useState<Video | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("videos").select("*").order("sort_order");
    setVideos((data as any) || []);
  };
  useEffect(() => { load(); }, []);

  const uploadThumbnail = async (file: File) => {
    if (!editing) return;
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("video-thumbnails").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) { alert(error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("video-thumbnails").getPublicUrl(path);
    setEditing({ ...editing, thumbnail_url: data.publicUrl });
    setUploading(false);
  };

  const save = async () => {
    if (!editing) return;
    setBusy(true);
    const payload: any = {
      ...editing,
      youtube_id: parseYouTubeId(editing.youtube_id),
      thumbnail_url: editing.thumbnail_url || `https://i.ytimg.com/vi/${parseYouTubeId(editing.youtube_id)}/hqdefault.jpg`,
    };
    if (!payload.id) delete payload.id;
    const { error } = await supabase.from("videos").upsert(payload);
    setBusy(false);
    if (error) { alert(error.message); return; }
    setEditing(null); load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this video?")) return;
    await supabase.from("videos").delete().eq("id", id);
    load();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", color: "var(--forest)" }}>Videos</h2>
        <button className="btn-primary" onClick={() => setEditing(empty())}>+ Add video</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {videos.map((v) => (
          <div key={v.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
            <img src={v.thumbnail_url || `https://i.ytimg.com/vi/${v.youtube_id}/hqdefault.jpg`} alt="" style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover" }} />
            <div style={{ padding: 16 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem", color: "var(--forest)" }}>{v.title}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>ID: {v.youtube_id}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button className="btn-outline" onClick={() => setEditing(v)}>Edit</button>
                <button className="btn-outline" onClick={() => del(v.id)} style={{ color: "#c33", borderColor: "#eaa" }}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setEditing(null)}>
          <div className="card" style={{ maxWidth: 500, width: "100%" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", color: "var(--forest)", marginBottom: 16 }}>
              {editing.id ? "Edit video" : "New video"}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input className="field" placeholder="Title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              <input className="field" placeholder="YouTube URL or ID (use UNLISTED videos)" value={editing.youtube_id} onChange={(e) => setEditing({ ...editing, youtube_id: e.target.value })} />
              <textarea className="field" placeholder="Description" value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              <input className="field" placeholder="Thumbnail URL (auto-generated if empty)" value={editing.thumbnail_url || ""} onChange={(e) => setEditing({ ...editing, thumbnail_url: e.target.value })} />
              <div>
                <label className="btn-outline" style={{ display: "inline-block", cursor: "pointer" }}>
                  {uploading ? "Uploading…" : "📤 Upload thumbnail"}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    disabled={uploading}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadThumbnail(f); e.target.value = ""; }}
                  />
                </label>
                {editing.thumbnail_url && (
                  <img src={editing.thumbnail_url} alt="" style={{ width: 100, aspectRatio: "16/9", objectFit: "cover", borderRadius: 8, marginTop: 8, display: "block" }} />
                )}
              </div>
              <input className="field" type="number" placeholder="Sort order" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
              <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                💡 Set your YouTube videos to <strong>Unlisted</strong>. Only people with the link can view — combined with our gated access this keeps your library members-only.
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="btn-outline" onClick={() => setEditing(null)}>Cancel</button>
                <button className="btn-primary" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}