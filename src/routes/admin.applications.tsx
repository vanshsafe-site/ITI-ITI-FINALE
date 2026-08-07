import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/applications")({ component: AdminApplications });

type FormField = {
  id: string;
  key: string;
  type: string;
  label: string;
  placeholder?: string;
  description?: string;
  options?: string[];
  required?: boolean;
  hidden?: boolean;
};

type FormDefinition = {
  id: string;
  name: string;
  slug: string;
  schema: FormField[];
};

type ApplicationRow = {
  id: string;
  user_id: string;
  form_id: string | null;
  status: string | null;
  created_at: string | null;
  submission_data: Record<string, unknown> | null;
};

const isImageUrl = (value: unknown) =>
  typeof value === "string" && /\.(jpe?g|png|gif|webp|avif|svg)(\?.*)?$/i.test(value);

function AdminApplications() {
  const [rows, setRows] = useState<ApplicationRow[]>([]);
  const [forms, setForms] = useState<Record<string, FormDefinition>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ url: string; label?: string } | null>(null);

  const load = async () => {
    const [appsRes, formsRes] = await Promise.all([
      supabase.from("applications").select("*").order("created_at", { ascending: false }),
      supabase.from("form_definitions").select("*").eq("status", "published")
    ]);

    if (appsRes.error) {
      setError(appsRes.error.message);
      setLoading(false);
      return;
    }

    const formMap: Record<string, FormDefinition> = {};
    for (const row of (formsRes.data as any[]) || []) {
      formMap[row.id] = row as FormDefinition;
    }

    setForms(formMap);
    setRows((appsRes.data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const formatValue = (value: unknown) => {
    if (value === null || value === undefined || value === "") return "—";
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const renderFieldAnswer = (field: FormField, answer: unknown) => {
    if (field.type === "file_upload" || field.type === "image_upload") {
      if (!answer) return "—";
      const url = String(answer);
      const isImage = field.type === "image_upload" || isImageUrl(url);
      return (
        <div style={{ display: "grid", gap: 10 }}>
          {isImage ? (
            <button
              type="button"
              onClick={() => setLightbox({ url, label: field.label })}
              style={{ display: "block", width: "100%", padding: 0, border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", cursor: "zoom-in", background: "none" }}
              title="Click to view full screen"
            >
              <img
                src={url}
                alt={field.label}
                style={{ width: "100%", maxHeight: 320, objectFit: "cover", display: "block" }}
              />
            </button>
          ) : null}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            {isImage && (
              <button
                type="button"
                onClick={() => setLightbox({ url, label: field.label })}
                style={{ color: "var(--terra)", background: "none", border: "none", padding: 0, cursor: "pointer" }}
              >
                View full screen
              </button>
            )}
            <a href={url} target="_blank" rel="noreferrer noopener" style={{ color: "var(--terra)", wordBreak: "break-all" }}>
              {isImage ? "Open in new tab" : "Download file"}
            </a>
          </div>
        </div>
      );
    }
    return <div style={{ color: "var(--muted)" }}>{formatValue(answer)}</div>;
  };

  const renderReadableForm = (row: ApplicationRow) => {
    const payload = row.submission_data || {};
    const formDef = row.form_id ? forms[row.form_id] : null;
    const fields = formDef?.schema || [];

    if (!fields.length) {
      return (
        <div style={{ display: "grid", gap: 6 }}>
          {Object.entries(payload).map(([key, value]) => (
            <div key={key} style={{ display: "grid", gap: 2 }}>
              <div style={{ fontWeight: 700, color: "var(--forest)" }}>{key}</div>
              {isImageUrl(value) ? (
                <div style={{ display: "grid", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setLightbox({ url: String(value), label: key })}
                    style={{ display: "block", width: "100%", maxWidth: 320, padding: 0, border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", cursor: "zoom-in", background: "none" }}
                    title="Click to view full screen"
                  >
                    <img src={String(value)} alt={key} style={{ width: "100%", maxHeight: 220, objectFit: "cover", display: "block" }} />
                  </button>
                  <a href={String(value)} target="_blank" rel="noreferrer noopener" style={{ color: "var(--terra)", wordBreak: "break-all", fontSize: "0.85rem" }}>
                    Open in new tab
                  </a>
                </div>
              ) : (
                <div style={{ color: "var(--muted)" }}>{formatValue(value)}</div>
              )}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div style={{ display: "grid", gap: 10 }}>
        {fields.map((field) => {
          if (field.hidden) return null;
          const answer = payload[field.key];
          return (
            <div key={field.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 10, background: "rgba(6,8,18,0.02)" }}>
              <div style={{ fontWeight: 700, color: "var(--forest)", marginBottom: 4 }}>{field.label}</div>
              {renderFieldAnswer(field, answer)}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) return <p style={{ color: "var(--muted)" }}>Loading applications…</p>;
  if (error) return <p style={{ color: "#c33" }}>{error}</p>;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {rows.map((row) => (
        <div key={row.id} className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontWeight: 700, color: "var(--forest)" }}>{row.user_id}</div>
            <span style={{ color: "var(--muted)" }}>•</span>
            <div style={{ color: "var(--muted)" }}>{row.status || "pending"}</div>
            <span style={{ color: "var(--muted)" }}>•</span>
            <div style={{ color: "var(--muted)" }}>{row.created_at ? new Date(row.created_at).toLocaleString() : "—"}</div>
          </div>

          <details open style={{ border: "1px solid var(--border)", borderRadius: 14, padding: 12 }}>
            <summary style={{ cursor: "pointer", fontWeight: 700, color: "var(--forest)" }}>
              View submitted form
            </summary>
            <div style={{ marginTop: 14 }}>
              {renderReadableForm(row)}
            </div>
          </details>
        </div>
      ))}

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            zIndex: 200,
            cursor: "zoom-out",
          }}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            style={{
              position: "absolute",
              top: 20,
              right: 24,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "#fff",
              borderRadius: 8,
              padding: "8px 14px",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            Close ✕
          </button>
          {lightbox.label && (
            <div style={{ color: "#fff", marginBottom: 12, fontWeight: 700 }}>{lightbox.label}</div>
          )}
          <img
            src={lightbox.url}
            alt={lightbox.label || "Full screen preview"}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "92vw", maxHeight: "82vh", objectFit: "contain", borderRadius: 8, boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}
          />
          <a
            href={lightbox.url}
            target="_blank"
            rel="noreferrer noopener"
            onClick={(e) => e.stopPropagation()}
            style={{ color: "#fff", marginTop: 14, textDecoration: "underline", fontSize: "0.85rem" }}
          >
            Open original in new tab
          </a>
        </div>
      )}
    </div>
  );
}
