import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type GalleryGroup = {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
};

type GalleryItem = {
  id: string;
  group_id: string | null;
  title: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
};

function emptyGroup(): GalleryGroup {
  return { id: "", title: "", description: "", sort_order: 0 };
}

function emptyItem(group_id: string | null): GalleryItem {
  return { id: "", group_id, title: "", description: "", image_url: "", sort_order: 0 };
}

export const Route = createFileRoute("/admin/gallery")({ component: AdminGallery });

function AdminGallery() {
  const [groups, setGroups] = useState<GalleryGroup[]>([]);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<GalleryGroup | null>(null);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const validGroupIds = useMemo(() => new Set(groups.map((group) => group.id)), [groups]);

  const load = async () => {
    const [groupRes, itemRes] = await Promise.all([
      supabase.from("gallery_groups").select("*").order("sort_order", { ascending: true }),
      supabase.from("gallery_items").select("*").order("sort_order", { ascending: true }),
    ]);
    const loadedGroups = (groupRes.data as GalleryGroup[]) || [];
    const loadedItems = (itemRes.data as GalleryItem[]) || [];
    const orphanedExists = loadedItems.some((item) => !item.group_id || !loadedGroups.some((group) => group.id === item.group_id));
    setGroups(loadedGroups);
    setItems(loadedItems);
    setSelectedGroupId((prev) => prev || loadedGroups[0]?.id || (orphanedExists ? "uncategorized" : null));
  };

  useEffect(() => { void load(); }, []);

  const uploadImage = async (file: File): Promise<string | null> => {
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("gallery-images").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    setUploading(false);
    if (error) {
      alert(error.message);
      return null;
    }
    const { data } = supabase.storage.from("gallery-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const saveGroup = async () => {
    if (!editingGroup) return;
    setBusy(true);
    const payload: any = { ...editingGroup };
    if (!payload.id) delete payload.id;
    const { error } = await supabase.from("gallery_groups").upsert(payload);
    setBusy(false);
    if (error) { alert(error.message); return; }
    setEditingGroup(null);
    await load();
  };

  const deleteGroup = async (id: string) => {
    if (!confirm("Delete this gallery group and all its images?")) return;
    await supabase.from("gallery_groups").delete().eq("id", id);
    await load();
  };

  const saveItem = async () => {
    if (!editingItem) return;
    setBusy(true);
    const payload: any = { ...editingItem };
    if (!payload.id) delete payload.id;
    const { error } = await supabase.from("gallery_items").upsert(payload);
    setBusy(false);
    if (error) { alert(error.message); return; }
    setEditingItem(null);
    await load();
  };

  const uploadFiles = async (files: FileList | null) => {
    if (!selectedGroupId || !files?.length) return;
    setUploading(true);

    const uploadedUrls: string[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadImage(file);
      if (url) uploadedUrls.push(url);
    }

    if (uploadedUrls.length === 0) {
      setUploading(false);
      return;
    }

    const nextSortBase = items.filter((item) => item.group_id === selectedGroupId).length + 1;
    const payload = uploadedUrls.map((url, index) => ({
      group_id: selectedGroupId,
      title: "",
      description: "",
      image_url: url,
      sort_order: nextSortBase + index,
    }));

    const { error } = await supabase.from("gallery_items").insert(payload);
    setUploading(false);
    if (error) {
      alert(error.message);
      return;
    }

    await load();
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this image?")) return;
    await supabase.from("gallery_items").delete().eq("id", id);
    await load();
  };

  const selectedGroup = useMemo(() => {
    if (selectedGroupId === "uncategorized") {
      return {
        id: "uncategorized",
        title: "Uncategorized",
        description: "Images without a gallery group",
        sort_order: 0,
      };
    }
    return groups.find((group) => group.id === selectedGroupId) || null;
  }, [groups, selectedGroupId]);

  const groupItems = useMemo(() => {
    if (selectedGroupId === "uncategorized") {
      return items.filter((item) => !item.group_id || !validGroupIds.has(item.group_id));
    }
    return items.filter((item) => item.group_id === selectedGroupId);
  }, [items, selectedGroupId, validGroupIds]);

  const uncategorizedCount = useMemo(
    () => items.filter((item) => !item.group_id || !validGroupIds.has(item.group_id)).length,
    [items, validGroupIds],
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", color: "var(--forest)" }}>Gallery Groups</h2>
        <button className="btn-primary" onClick={() => setEditingGroup(emptyGroup())}>+ Add group</button>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        {groups.map((group) => (
          <button
            key={group.id}
            onClick={() => setSelectedGroupId(group.id)}
            className={group.id === selectedGroupId ? "btn-primary" : "btn-outline"}
            style={{ minWidth: 160, textAlign: "left" }}
          >
            <div style={{ fontWeight: 600 }}>{group.title || "Untitled group"}</div>
            <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{group.description || "No description"}</div>
          </button>
        ))}
        {uncategorizedCount > 0 ? (
          <button
            key="uncategorized"
            onClick={() => setSelectedGroupId("uncategorized")}
            className={selectedGroupId === "uncategorized" ? "btn-primary" : "btn-outline"}
            style={{ minWidth: 160, textAlign: "left" }}
          >
            <div style={{ fontWeight: 600 }}>Uncategorized</div>
            <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
              {uncategorizedCount} item{uncategorizedCount === 1 ? "" : "s"}
            </div>
          </button>
        ) : null}
      </div>

      {!selectedGroup ? (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <p style={{ margin: 0, color: "var(--muted)" }}>Create a group first to add gallery images.</p>
        </div>
      ) : (
        <>
          <div className="card" style={{ padding: 20, marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "1.15rem", fontWeight: 600, color: "var(--forest)" }}>{selectedGroup.title || "Untitled group"}</div>
                <div style={{ color: "var(--muted)", marginTop: 6 }}>{selectedGroup.description || "No description"}</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {selectedGroup?.id !== "uncategorized" && (
                  <>
                    <button className="btn-outline" onClick={() => setEditingGroup(selectedGroup)}>Edit group</button>
                    <button className="btn-outline" onClick={() => deleteGroup(selectedGroup.id)} style={{ color: "#c33", borderColor: "#eaa" }}>Delete group</button>
                  </>
                )}
                <label
                  className="btn-primary"
                  style={{ cursor: selectedGroup?.id === "uncategorized" ? "not-allowed" : "pointer", margin: 0, opacity: selectedGroup?.id === "uncategorized" ? 0.6 : 1 }}
                >
                  {uploading ? "Uploading…" : "+ Upload photos"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: "none" }}
                    disabled={uploading || selectedGroup?.id === "uncategorized"}
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files?.length) void uploadFiles(files);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {groupItems.length === 0 ? (
              <div className="card" style={{ padding: 40, textAlign: "center" }}>
                <p style={{ margin: 0, color: "var(--muted)" }}>No images yet in this group. Add one above.</p>
              </div>
            ) : groupItems.map((item) => (
              <div key={item.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", aspectRatio: "4/3", background: "var(--leaf)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--forest)", fontSize: "1.5rem" }}>
                    No image
                  </div>
                )}
                <div style={{ padding: 16 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem", color: "var(--forest)" }}>{item.title}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: 8 }}>{item.description || "No description"}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button className="btn-outline" onClick={() => setEditingItem(item)}>Edit</button>
                    <button className="btn-outline" onClick={() => deleteItem(item.id)} style={{ color: "#c33", borderColor: "#eaa" }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {editingGroup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setEditingGroup(null)}>
          <div className="card" style={{ maxWidth: 540, width: "100%" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", color: "var(--forest)", marginBottom: 16 }}>
              {editingGroup.id ? "Edit gallery group" : "New gallery group"}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input className="field" placeholder="Group title" value={editingGroup.title} onChange={(e) => setEditingGroup({ ...editingGroup, title: e.target.value })} />
              <textarea className="field" placeholder="Group description" value={editingGroup.description || ""} onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })} />
              <input className="field" type="number" placeholder="Sort order" value={editingGroup.sort_order} onChange={(e) => setEditingGroup({ ...editingGroup, sort_order: Number(e.target.value) })} />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="btn-outline" onClick={() => setEditingGroup(null)}>Cancel</button>
                <button className="btn-primary" disabled={busy} onClick={saveGroup}>{busy ? "Saving…" : "Save"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingItem && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setEditingItem(null)}>
          <div className="card" style={{ maxWidth: 540, width: "100%" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", color: "var(--forest)", marginBottom: 16 }}>
              {editingItem.id ? "Edit photo" : "New photo"}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input className="field" placeholder="Title" value={editingItem.title} onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })} />
              <textarea className="field" placeholder="Description" value={editingItem.description || ""} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} />
              <input className="field" placeholder="Image URL" value={editingItem.image_url || ""} onChange={(e) => setEditingItem({ ...editingItem, image_url: e.target.value })} />
              <label className="btn-outline" style={{ display: "inline-block", cursor: "pointer" }}>
                {uploading ? "Uploading…" : "📤 Upload image"}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  disabled={uploading}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) void (async () => {
                    const url = await uploadImage(f);
                    if (url) setEditingItem((prev) => prev ? { ...prev, image_url: url } : null);
                  })(); e.target.value = ""; }}
                />
              </label>
              {editingItem.image_url && <img src={editingItem.image_url} alt={editingItem.title} style={{ width: 120, aspectRatio: "4/3", objectFit: "cover", borderRadius: 8, marginTop: 8 }} />}
              <input className="field" type="number" placeholder="Sort order" value={editingItem.sort_order} onChange={(e) => setEditingItem({ ...editingItem, sort_order: Number(e.target.value) })} />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="btn-outline" onClick={() => setEditingItem(null)}>Cancel</button>
                <button className="btn-primary" disabled={busy} onClick={saveItem}>{busy ? "Saving…" : "Save"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
