import { createFileRoute, Link } from "@tanstack/react-router";
import { type ChangeEvent, useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/about")({ component: AdminAbout });

function AdminAbout() {
  const [title, setTitle] = useState("About Me");
  const [content, setContent] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [profileImagePositionX, setProfileImagePositionX] = useState(50);
  const [profileImagePositionY, setProfileImagePositionY] = useState(50);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void (async () => {
      const { data, error } = await supabase
        .from("page_contents")
        .select("title,content,profile_image_url,profile_image_position_x,profile_image_position_y")
        .eq("page", "about")
        .single();

      if (!error && data) {
        setTitle(data.title || "About Me");
        setContent(data.content || "");
        setProfileImageUrl(data.profile_image_url || "");
        setProfileImagePositionX(data.profile_image_position_x ?? 50);
        setProfileImagePositionY(data.profile_image_position_y ?? 50);
      }
      setLoaded(true);
    })();
  }, []);

  const uploadProfileImage = async (file: File): Promise<string | null> => {
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `about-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("about-images")
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      setUploading(false);
      alert(uploadError.message);
      return null;
    }

    const { data } = supabase.storage.from("about-images").getPublicUrl(path);
    setUploading(false);
    return data?.publicUrl || null;
  };

  const handleProfileImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreviewImageUrl(localUrl);
    setProfileImagePositionX(50);
    setProfileImagePositionY(50);

    const url = await uploadProfileImage(file);
    if (url) setProfileImageUrl(url);
  };

  const handleSave = async () => {
    setBusy(true);
    const payload = {
      page: "about",
      title: title || "About Me",
      content,
      profile_image_url: profileImageUrl,
      profile_image_position_x: profileImagePositionX,
      profile_image_position_y: profileImagePositionY,
    };

    const { error } = await supabase
      .from("page_contents")
      .upsert(payload, { onConflict: "page" });
    setBusy(false);

    if (error) {
      alert(error.message || "Unable to save About page content.");
    } else {
      alert("About page content saved.");
    }
  };

  return (
    <PageLayout>
      <section style={{ padding: "40px 5% 96px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="section-label">Admin</div>
          <h1 className="section-title">Edit About Page</h1>

          <div style={{ display: "grid", gap: 20, marginTop: 24 }}>
            <label style={{ display: "grid", gap: 8 }}>
              <span style={{ fontWeight: 700, color: "var(--forest)" }}>Page title</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="field"
                placeholder="About Me"
              />
            </label>

            <label style={{ display: "grid", gap: 8 }}>
              <span style={{ fontWeight: 700, color: "var(--forest)" }}>Profile picture</span>
              <div style={{ display: "grid", gap: 12 }}>
                <div
                  style={{
                    width: 160,
                    aspectRatio: "4 / 3",
                    borderRadius: 24,
                    overflow: "hidden",
                    background: "var(--dusk)",
                    border: "1px solid var(--border)",
                    position: "relative",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {(previewImageUrl || profileImageUrl) ? (
                    <img
                      src={previewImageUrl || profileImageUrl}
                      alt="Profile preview"
                      draggable={false}
                      onDragStart={(event) => event.preventDefault()}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        objectPosition: "center",
                        userSelect: "none",
                        background: "var(--dusk)",
                      }}
                    />
                  ) : (
                    <div style={{ color: "var(--muted)", fontSize: "0.85rem", padding: 12, textAlign: "center" }}>
                      No image uploaded
                    </div>
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handleProfileImageChange} disabled={uploading} />
                {uploading ? <div style={{ color: "var(--muted)" }}>Uploading…</div> : null}
              </div>
            </label>

            <label style={{ display: "grid", gap: 8 }}>
              <span style={{ fontWeight: 700, color: "var(--forest)" }}>About page content</span>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                className="field"
                rows={16}
                placeholder="Enter the About page text here. Use blank lines to separate paragraphs."
                style={{ minHeight: 360, fontFamily: "inherit" }}
              />
            </label>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button className="btn-primary" onClick={handleSave} disabled={busy || !loaded || uploading}>
                {busy ? "Saving…" : "Save About Page"}
              </button>
              <Link to="/admin" className="btn-outline" style={{ textDecoration: "none" }}>
                Back to Admin
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
