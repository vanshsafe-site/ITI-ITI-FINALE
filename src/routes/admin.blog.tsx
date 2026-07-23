import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/blog")({ component: AdminBlog });

type Post = {
  id: string; slug: string; title: string; excerpt: string | null;
  content: string; cover_image_url: string | null; category: string;
  published: boolean; published_at: string | null; author_id: string | null;
};

const CATEGORIES = ["General", "Asanas", "Pranayama", "Meditation", "Nutrition", "Philosophy", "Events"];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

function empty(): Post {
  return { id: "", slug: "", title: "", excerpt: "", content: "", cover_image_url: "", category: "General", published: false, published_at: null, author_id: null };
}

function AdminBlog() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    setPosts((data as any) || []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    setBusy(true);
    const payload: any = {
      ...editing,
      slug: editing.slug || slugify(editing.title),
      author_id: editing.author_id || user?.id,
      published_at: editing.published && !editing.published_at ? new Date().toISOString() : editing.published_at,
    };
    if (!payload.id) delete payload.id;
    const { error } = await supabase.from("blog_posts").upsert(payload);
    setBusy(false);
    if (error) { alert(error.message); return; }
    setEditing(null); load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    load();
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("blog-images").upload(path, file, { upsert: false });
    setUploading(false);
    if (error) { alert(error.message); return null; }
    const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const insertImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !editing) return;
    const url = await uploadImage(f);
    if (url) setEditing({ ...editing, content: editing.content + `\n<img src="${url}" alt="" />\n` });
    e.target.value = "";
  };

  const setCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !editing) return;
    const url = await uploadImage(f);
    if (url) setEditing({ ...editing, cover_image_url: url });
    e.target.value = "";
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", color: "var(--forest)" }}>Blog posts</h2>
        <button className="btn-primary" onClick={() => setEditing(empty())}>+ New post</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {posts.map((p) => (
          <div key={p.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", color: "var(--forest)" }}>{p.title}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>
                /{p.slug} · <span style={{ color: "var(--terra)" }}>{p.category}</span> · {p.published ? <span style={{ color: "var(--sage)" }}>Published</span> : <span style={{ color: "var(--terra)" }}>Draft</span>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-outline" onClick={() => setEditing(p)}>Edit</button>
              <button className="btn-outline" onClick={() => del(p.id)} style={{ color: "#c33", borderColor: "#eaa" }}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 20, overflow: "auto" }} onClick={() => setEditing(null)}>
          <div className="card" style={{ maxWidth: 800, width: "100%" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", color: "var(--forest)", marginBottom: 16 }}>
              {editing.id ? "Edit post" : "New post"}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input className="field" placeholder="Title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.slug || slugify(e.target.value) })} />
              <input className="field" placeholder="Slug (URL)" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
              <textarea className="field" placeholder="Excerpt (short summary)" value={editing.excerpt || ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} />

              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Category</label>
                <select className="field" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Cover image</label>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 6, flexWrap: "wrap" }}>
                  {editing.cover_image_url && <img src={editing.cover_image_url} alt="" style={{ width: 80, height: 50, objectFit: "cover", borderRadius: 6 }} />}
                  <label className="btn-outline" style={{ cursor: "pointer", fontSize: "0.8rem" }}>
                    📷 {editing.cover_image_url ? "Change thumbnail" : "Upload thumbnail"}
                    <input type="file" accept="image/*" onChange={setCover} disabled={uploading} style={{ display: "none" }} />
                  </label>
                  {uploading && <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Uploading…</span>}
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Content (HTML — use &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;img&gt;, etc.)</label>
                <textarea className="field" style={{ minHeight: 300, fontFamily: "monospace", fontSize: "0.85rem" }} value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} />
                <div style={{ marginTop: 6 }}>
                  <label className="btn-outline" style={{ cursor: "pointer", fontSize: "0.8rem" }}>
                    📷 Insert image
                    <input type="file" accept="image/*" onChange={insertImage} disabled={uploading} style={{ display: "none" }} />
                  </label>
                  {uploading && <span style={{ marginLeft: 12, color: "var(--muted)", fontSize: "0.85rem" }}>Uploading…</span>}
                </div>
              </div>

              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
                Published
              </label>

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