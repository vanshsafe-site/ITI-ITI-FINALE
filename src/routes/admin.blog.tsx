import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/blog")({ component: AdminBlog });

type Post = {
  id: string; slug: string; title: string; excerpt: string | null;
  content: string; cover_image_url: string | null; category: string;
  published: boolean; published_at: string | null; author_id: string | null;
  topic_id: string | null; subtopic_id: string | null;
};

type BlogTopic = {
  id: string; name: string; slug: string; parent_id: string | null; sort_order: number;
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

function empty(): Post {
  return { id: "", slug: "", title: "", excerpt: "", content: "", cover_image_url: "", category: "General", published: false, published_at: null, author_id: null, topic_id: null, subtopic_id: null };
}

function AdminBlog() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);
  const [topics, setTopics] = useState<BlogTopic[]>([]);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [newSubtopicName, setNewSubtopicName] = useState("");
  const [newSubtopicParentId, setNewSubtopicParentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const [postsRes, topicsRes] = await Promise.all([
      supabase.from("blog_posts").select("id,slug,title,excerpt,content,cover_image_url,category,published,published_at,author_id,topic_id,subtopic_id").order("created_at", { ascending: false }),
      supabase.from("blog_topics").select("*").order("sort_order", { ascending: true }).order("name", { ascending: true }),
    ]);
    if (postsRes.error) {
      setError(postsRes.error.message);
    } else if (!postsRes.data || postsRes.data.length === 0) {
      // Query succeeded but returned nothing — most likely cause is RLS:
      // your account isn't flagged 'admin' in public.user_roles, so only
      // already-published posts (if any) would be visible to you.
      setError("No posts returned. If you have posts saved, this is usually because your account isn't marked admin in public.user_roles — drafts are hidden from non-admins by RLS.");
    }
    setPosts((postsRes.data as any) || []);
    setTopics((topicsRes.data as any) || []);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const parentTopics = useMemo(() => topics.filter((topic) => !topic.parent_id), [topics]);
  const subtopicsByParent = useMemo(() => {
    const grouped = new Map<string, BlogTopic[]>();
    topics.filter((topic) => topic.parent_id).forEach((topic) => {
      const current = grouped.get(topic.parent_id!) || [];
      current.push(topic);
      grouped.set(topic.parent_id!, current);
    });
    return grouped;
  }, [topics]);

  const save = async () => {
    if (!editing) return;
    setBusy(true);
    const selectedTopic = topics.find((topic) => topic.id === editing.topic_id && !topic.parent_id) || null;
    const payload: any = {
      ...editing,
      slug: editing.slug || slugify(editing.title),
      author_id: editing.author_id || user?.id,
      category: selectedTopic?.name || editing.category || "General",
      published_at: editing.published && !editing.published_at ? new Date().toISOString() : editing.published_at,
    };
    if (!payload.id) delete payload.id;
    const { error } = await supabase.from("blog_posts").upsert(payload);
    setBusy(false);
    if (error) { alert(error.message); return; }
    setEditing(null); await load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    await load();
  };

  const addTopic = async () => {
    const name = newTopicName.trim();
    if (!name) return;
    const { error } = await supabase.from("blog_topics").insert({
      name,
      slug: slugify(name),
      parent_id: null,
      sort_order: (parentTopics.length + 1) * 10,
    });
    if (error) { alert(error.message); return; }
    setNewTopicName("");
    await load();
  };

  const addSubtopic = async () => {
    const name = newSubtopicName.trim();
    if (!name || !newSubtopicParentId) return;
    const { error } = await supabase.from("blog_topics").insert({
      name,
      slug: slugify(name),
      parent_id: newSubtopicParentId,
      sort_order: (subtopicsByParent.get(newSubtopicParentId)?.length || 0 + 1) * 10,
    });
    if (error) { alert(error.message); return; }
    setNewSubtopicName("");
    setNewSubtopicParentId("");
    await load();
  };

  const removeTopic = async (id: string) => {
    if (!confirm("Remove this topic and any subtopics?")) return;
    const { error } = await supabase.from("blog_topics").delete().eq("id", id);
    if (error) { alert(error.message); return; }
    await load();
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

  const topicLabel = (post: Post) => {
    const selectedTopic = topics.find((topic) => topic.id === post.topic_id && !topic.parent_id);
    const selectedSubtopic = topics.find((topic) => topic.id === post.subtopic_id);
    const pieces = [selectedTopic?.name, selectedSubtopic?.name].filter(Boolean);
    return pieces.join(" · ");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", color: "var(--forest)" }}>Blog posts</h2>
        <button className="btn-primary" onClick={() => setEditing(empty())}>+ New post</button>
      </div>

      {error && (
        <div className="card" style={{ padding: 14, marginBottom: 16, borderColor: "#eaa", color: "#a33", fontSize: "0.9rem" }}>
          {error}
        </div>
      )}
      {loading && <div style={{ color: "var(--muted)", marginBottom: 16 }}>Loading posts…</div>}

      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", color: "var(--forest)", marginBottom: 12 }}>Manage blog topics</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <input className="field" placeholder="Add a new topic" value={newTopicName} onChange={(e) => setNewTopicName(e.target.value)} style={{ minWidth: 220 }} />
          <button className="btn-primary" onClick={addTopic}>Add topic</button>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
          <select className="field" value={newSubtopicParentId} onChange={(e) => setNewSubtopicParentId(e.target.value)} style={{ minWidth: 220 }}>
            <option value="">Select a parent topic</option>
            {parentTopics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
          </select>
          <input className="field" placeholder="Add a subtopic" value={newSubtopicName} onChange={(e) => setNewSubtopicName(e.target.value)} style={{ minWidth: 220 }} />
          <button className="btn-outline" onClick={addSubtopic}>Add subtopic</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {parentTopics.map((parent) => (
            <div key={parent.id} className="card" style={{ padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <strong style={{ color: "var(--forest)" }}>{parent.name}</strong>
                <button className="btn-outline" onClick={() => removeTopic(parent.id)} style={{ color: "#c33", borderColor: "#eaa", fontSize: "0.8rem" }}>Remove</button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                {(subtopicsByParent.get(parent.id) || []).map((child) => (
                  <span key={child.id} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--sage)", color: "#fff", padding: "4px 10px", borderRadius: 999, fontSize: "0.8rem" }}>
                    {child.name}
                    <button type="button" onClick={() => removeTopic(child.id)} style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}>×</button>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {posts.map((p) => (
          <div key={p.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", color: "var(--forest)" }}>{p.title}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>
                /{p.slug} · <span style={{ color: "var(--terra)" }}>{topicLabel(p) || p.category || "General"}</span> · {p.published ? <span style={{ color: "var(--sage)" }}>Published</span> : <span style={{ color: "var(--terra)" }}>Draft</span>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-outline" onClick={() => setEditing(p)}>Edit</button>
              <button className="btn-outline" onClick={() => void del(p.id)} style={{ color: "#c33", borderColor: "#eaa" }}>Delete</button>
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
                <label style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Main topic</label>
                <select className="field" value={editing.topic_id || ""} onChange={(e) => {
                  const nextTopicId = e.target.value;
                  const nextSubtopicId = editing.subtopic_id && (subtopicsByParent.get(nextTopicId) || []).some((topic) => topic.id === editing.subtopic_id) ? editing.subtopic_id : null;
                  const nextTopic = topics.find((topic) => topic.id === nextTopicId && !topic.parent_id);
                  setEditing({
                    ...editing,
                    topic_id: nextTopicId || null,
                    subtopic_id: nextSubtopicId,
                    category: nextTopic?.name || editing.category,
                  });
                }}>
                  <option value="">No topic</option>
                  {parentTopics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Subtopic</label>
                <select className="field" value={editing.subtopic_id || ""} onChange={(e) => setEditing({ ...editing, subtopic_id: e.target.value || null })} disabled={!editing.topic_id}>
                  <option value="">No subtopic</option>
                  {(subtopicsByParent.get(editing.topic_id || "") || []).map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
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
                <button className="btn-primary" disabled={busy} onClick={() => void save()}>{busy ? "Saving…" : "Save"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}