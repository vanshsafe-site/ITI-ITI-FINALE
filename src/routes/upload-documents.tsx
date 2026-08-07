import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/upload-documents")({
  component: UploadDocuments,
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
});

type FormField = {
  id: string;
  key: string;
  type: string;
  label: string;
  placeholder?: string;
  description?: string;
  helpText?: string;
  required?: boolean;
  hidden?: boolean;
  readOnly?: boolean;
  options?: string[];
  defaultValue?: string;
  width?: string;
};

type FormDefinition = {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  version: number;
  schema: FormField[];
  settings: { theme?: string; multiStep?: boolean };
};

type FormValues = Record<string, string | boolean | string[] | File | null>;

const fallbackForm: FormDefinition = {
  id: "document-upload",
  name: "Upload Documents",
  slug: "document-upload",
  description: "Upload your profile photo, medical reports, and doctor recommendation.",
  status: "published",
  version: 1,
  schema: [
    { id: "profile_pic", key: "profile_pic", type: "image_upload", label: "Profile Photo", width: "100%" },
    { id: "medical_reports", key: "medical_reports", type: "file_upload", label: "Medical Reports", width: "100%" },
    { id: "doctor_recommendation", key: "doctor_recommendation", type: "file_upload", label: "Doctor Recommendation", width: "100%" },
  ],
  settings: { theme: "light", multiStep: false },
};

function UploadDocuments() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [formDef, setFormDef] = useState<FormDefinition | null>(null);
  const [loadingForm, setLoadingForm] = useState(true);
  const [values, setValues] = useState<FormValues>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      nav({ to: "/auth" });
    }
  }, [loading, user, nav]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("form_definitions")
        .select("*")
        .eq("slug", "document-upload")
        .maybeSingle();

      if (cancelled) return;
      if (error) {
        setFormDef(fallbackForm);
        setErr(null);
        setLoadingForm(false);
        return;
      }

      const def = (data as FormDefinition | null) || fallbackForm;
      setFormDef(def);
      const defaults: FormValues = {};
      for (const field of def.schema) {
        if (field.defaultValue) defaults[field.key] = field.defaultValue;
        else if (field.type === "checkbox" || field.type === "multiple_select") defaults[field.key] = [];
        else if (field.type === "file_upload" || field.type === "image_upload") defaults[field.key] = null;
        else defaults[field.key] = "";
      }
      setValues(defaults);
      setLoadingForm(false);
    })();

    return () => { cancelled = true; };
  }, []);

  const setFieldValue = (key: string, value: string | boolean | string[]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const renderField = (field: FormField) => {
    const value = values[field.key] ?? "";
    const sharedStyle = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: "0.92rem" };

    if (field.hidden) return null;
    if (field.type === "heading") {
      return <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.35rem", color: "var(--forest)", fontWeight: 700 }}>{field.label}</div>;
    }
    if (field.type === "paragraph" || field.type === "rich_text" || field.type === "html_block" || field.type === "information_box") {
      return <div style={{ color: "var(--muted)", lineHeight: 1.7 }}>{field.description || field.label}</div>;
    }

    const fieldLabel = (
      <label style={{ display: "flex", flexDirection: "column", gap: 6, color: "var(--text)", fontWeight: 600 }}>
        <span>{field.label}{field.required ? " *" : ""}</span>
        {field.description && <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: "0.8rem" }}>{field.description}</span>}
      </label>
    );

    if (field.type === "file_upload" || field.type === "image_upload") {
      const selectedFile = value instanceof File ? value : null;
      const accept = field.type === "image_upload" ? "image/*" : ".pdf,image/*";
      return (
        <div style={{ display: "grid", gap: 6 }}>
          {fieldLabel}
          <input
            type="file"
            accept={accept}
            style={sharedStyle}
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setFieldValue(field.key, file);
            }}
          />
          {selectedFile ? <div style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{selectedFile.name}</div> : null}
        </div>
      );
    }

    return (
      <div style={{ display: "grid", gap: 6 }}>
        {fieldLabel}
        <input
          required={field.required}
          type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : field.type === "number" ? "number" : "text"}
          className="field"
          placeholder={field.placeholder}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => setFieldValue(field.key, e.target.value)}
        />
      </div>
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setErr(null);

    const submissionValues: FormValues = { ...values };
    const fileFields = (formDef?.schema || []).filter((field) => field.type === "file_upload" || field.type === "image_upload");

    for (const field of fileFields) {
      const fileValue = submissionValues[field.key];
      if (fileValue instanceof File) {
        const ext = fileValue.name.split('.').pop() || 'bin';
        const bucket = field.type === "image_upload" ? "application-photos" : "application-uploads";
        const path = `${bucket}/${field.key}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: uploadError } = await supabase.storage.from(bucket).upload(path, fileValue, { cacheControl: "3600", upsert: false });
        if (uploadError) {
          setErr(uploadError.message);
          setBusy(false);
          return;
        }
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
        submissionValues[field.key] = urlData?.publicUrl || null;
      }
    }

    const isUuid = (value: string | undefined): value is string =>
      typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

    const { data: appData, error: appErr } = await supabase
      .from("applications")
      .insert({
        user_id: user.id,
        form_id: isUuid(formDef?.id) ? formDef!.id : null,
        status: "pending",
        submission_data: submissionValues,
      })
      .select("id")
      .single();

    if (appErr) {
      setErr(appErr.message);
      setBusy(false);
      return;
    }

    const responses = (formDef?.schema || [])
      .filter((field) => !field.hidden && field.key)
      .map((field) => ({
        application_id: appData.id,
        field_key: field.key,
        field_label: field.label,
        value_json: values[field.key] ?? null,
      }));

    if (responses.length > 0) {
      const { error: responseErr } = await supabase.from("application_responses").insert(responses);
      if (responseErr) {
        setErr(responseErr.message);
        setBusy(false);
        return;
      }
    }

    setDone(true);
    setBusy(false);
  };

  return (
    <PageLayout>
      <section style={{ padding: "120px 5% 96px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div className="section-label">Upload Documents</div>
          <h1 className="section-title">Submit your profile photo and medical files</h1>
          <p style={{ color: "var(--muted)", marginTop: 16, marginBottom: 32, lineHeight: 1.7 }}>
            Upload your profile picture, medical reports, and doctor recommendation to complete your application profile.
          </p>

          {done ? (
            <div className="card" style={{ padding: 32 }}>
              <h3 style={{ color: "var(--forest)", fontSize: "1.4rem", marginBottom: 12 }}>✓ Files uploaded</h3>
              <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
                Your documents are saved. We will review them and follow up if anything else is needed.
              </p>
              <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link to="/dashboard" className="btn-primary">Go to dashboard</Link>
                <Link to="/" className="btn-outline">Go to home</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="card" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 14 }}>
              {loadingForm && <p style={{ color: "var(--muted)" }}>Loading form…</p>}
              {!loadingForm && !formDef && <p style={{ color: "#c33" }}>No upload form is available yet.</p>}
              {!loadingForm && formDef && formDef.schema.map((field) => <div key={field.id}>{renderField(field)}</div>)}
              {err && <div style={{ color: "#c33", fontSize: "0.85rem" }}>{err}</div>}
              <button className="btn-primary" disabled={busy || loadingForm || !formDef} type="submit">{busy ? "Uploading…" : "Upload documents"}</button>
            </form>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
