import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/forms")({ component: AdminForms });

type FormStatus = "draft" | "published" | "archived";
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
  id?: string;
  name: string;
  slug: string;
  description: string;
  status: FormStatus;
  version: number;
  schema: FormField[];
  settings: { theme?: string; multiStep?: boolean };
  created_at?: string;
  updated_at?: string;
};

const FIELD_TYPES = [
  "short_text",
  "long_text",
  "email",
  "phone",
  "number",
  "date",
  "time",
  "dropdown",
  "radio",
  "checkbox",
  "multiple_select",
  "country",
  "state",
  "city",
  "address",
  "height",
  "weight",
  "slider",
  "rating",
  "scale",
  "yes_no",
  "file_upload",
  "image_upload",
  "medical_checklist",
  "emergency_contact",
  "section_divider",
  "heading",
  "paragraph",
  "rich_text",
  "html_block",
  "information_box",
];

const defaultSchema = (): FormField[] => [
  {
    id: crypto.randomUUID(),
    key: "full_name",
    type: "short_text",
    label: "Full Name",
    placeholder: "Enter full name",
    required: true,
    width: "100%",
  },
  {
    id: crypto.randomUUID(),
    key: "email",
    type: "email",
    label: "Email",
    placeholder: "name@example.com",
    required: true,
    width: "100%",
  },
  {
    id: crypto.randomUUID(),
    key: "phone",
    type: "phone",
    label: "Phone",
    placeholder: "Phone / WhatsApp",
    width: "100%",
  },
  {
    id: crypto.randomUUID(),
    key: "goals",
    type: "long_text",
    label: "What are your goals?",
    placeholder: "Tell us what you want to achieve",
    required: true,
    width: "100%",
  },
  {
    id: crypto.randomUUID(),
    key: "experience",
    type: "long_text",
    label: "Yoga experience",
    placeholder: "Tell us about your current practice",
    width: "100%",
  },
];

const emptyForm = (): FormDefinition => ({
  id: undefined,
  name: "Registration Form",
  slug: "registration",
  description: "Default admission form",
  status: "draft",
  version: 1,
  schema: defaultSchema(),
  settings: { theme: "light", multiStep: false },
});

function createField(): FormField {
  return {
    id: crypto.randomUUID(),
    key: `field_${Math.random().toString(36).slice(2, 8)}`,
    type: "short_text",
    label: "New Field",
    placeholder: "Enter value",
    required: false,
    width: "100%",
  };
}

function AdminForms() {
  const [form, setForm] = useState<FormDefinition>(emptyForm());
  const [forms, setForms] = useState<FormDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);

  const loadForms = async () => {
    const { data, error } = await supabase.from("form_definitions").select("*").order("updated_at", { ascending: false });
    if (error) {
      const missingSchema = /form_definitions|could not find table/i.test(error.message);
      setError(missingSchema
        ? "The dynamic form tables are not yet created in Supabase. Run the SQL from SUPABASE_SETUP.sql to create public.form_definitions and public.application_responses."
        : error.message);
      setForms([]);
      setLoading(false);
      return;
    }
    const rows = (data as any[]) || [];
    setForms(rows);
    if (rows.length > 0 && !selectedId) {
      setSelectedId(rows[0].id);
      setForm(rows[0]);
    } else if (rows.length === 0) {
      setForm(emptyForm());
    }
    setLoading(false);
  };

  useEffect(() => { loadForms(); }, []);

  const selectedField = useMemo(() => {
    return form.schema.find((field) => field.id === selectedId) || null;
  }, [form.schema, selectedId]);

  const saveForm = async (override?: FormDefinition) => {
    const target = override || form;
    setBusy(true); setError(null);
    const payload: any = {
      id: target.id || crypto.randomUUID(),
      name: target.name,
      slug: target.slug || "registration",
      description: target.description,
      status: target.status,
      version: target.version,
      schema: target.schema,
      settings: target.settings,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("form_definitions").upsert(payload).select().single();
    setBusy(false);
    if (error) { setError(error.message); return; }
    const next = data as any;
    setForm(next);
    setSelectedId(next.id);
    await loadForms();
  };

  const addField = () => {
    const field = createField();
    setForm((prev) => ({ ...prev, schema: [...prev.schema, field] }));
    setSelectedId(field.id);
  };

  const updateField = (patch: Partial<FormField>) => {
    if (!selectedField) return;
    setForm((prev) => ({
      ...prev,
      schema: prev.schema.map((field) => (field.id === selectedField.id ? { ...field, ...patch } : field)),
    }));
  };

  const moveField = (direction: "up" | "down") => {
    if (!selectedField) return;
    const index = form.schema.findIndex((field) => field.id === selectedField.id);
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= form.schema.length) return;
    const next = [...form.schema];
    const [item] = next.splice(index, 1);
    next.splice(nextIndex, 0, item);
    setForm((prev) => ({ ...prev, schema: next }));
  };

  const duplicateField = () => {
    if (!selectedField) return;
    const dup = { ...selectedField, id: crypto.randomUUID(), key: `${selectedField.key}_copy`, label: `${selectedField.label} Copy` };
    const index = form.schema.findIndex((field) => field.id === selectedField.id);
    const next = [...form.schema];
    next.splice(index + 1, 0, dup);
    setForm((prev) => ({ ...prev, schema: next }));
    setSelectedId(dup.id);
  };

  const deleteField = () => {
    if (!selectedField) return;
    setForm((prev) => ({ ...prev, schema: prev.schema.filter((field) => field.id !== selectedField.id) }));
    setSelectedId(null);
  };

  const useForm = async (row: FormDefinition) => {
    setForm(row);
    setSelectedId(row.schema?.[0]?.id || null);
  };

  const toggleStatus = async (nextStatus: FormStatus) => {
    const next = { ...form, status: nextStatus };
    setForm(next);
    await saveForm(next);
  };

  const duplicateForm = async () => {
    const next = {
      ...form,
      id: undefined,
      name: `${form.name} Copy`,
      slug: `${form.slug}-copy`,
      status: "draft",
      version: (form.version || 1) + 1,
    };
    setForm(next);
    await saveForm(next);
  };

  if (loading) return <div style={{ color: "var(--muted)", padding: 20 }}>Loading forms…</div>;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div className="section-label">Form Builder</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", color: "var(--forest)" }}>Dynamic Registration Forms</h2>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn-outline" onClick={() => { setForm(emptyForm()); setSelectedId(null); }}>New form</button>
            <button className="btn-outline" onClick={duplicateForm}>Duplicate</button>
            <button className="btn-outline" onClick={() => setPreview(true)}>Preview</button>
            <button className="btn-outline" onClick={() => toggleStatus("draft")}>Save draft</button>
            <button className="btn-primary" onClick={() => toggleStatus("published")}>Publish</button>
            <button className="btn-outline" onClick={() => toggleStatus("archived")}>Archive</button>
            <button className="btn-primary" onClick={saveForm} disabled={busy}>{busy ? "Saving…" : "Save"}</button>
          </div>
        </div>
        {error && <div style={{ marginTop: 12, color: "#c33", fontSize: "0.85rem" }}>{error}</div>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(260px, 340px) 1fr", gap: 20 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 700, color: "var(--forest)", marginBottom: 12 }}>Forms</div>
          <div style={{ display: "grid", gap: 8 }}>
            {forms.map((row) => (
              <button
                key={row.id}
                onClick={() => useForm(row)}
                style={{ textAlign: "left", padding: 12, borderRadius: 10, border: "1px solid var(--border)", background: row.id === form.id ? "rgba(156,143,232,0.08)" : "var(--cream)", color: "var(--forest)" }}
              >
                <div style={{ fontWeight: 700 }}>{row.name}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 4 }}>{row.status} • v{row.version || 1}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: "grid", gap: 12 }}>
            <input className="field" placeholder="Form name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="field" placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <textarea className="field" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn-outline" onClick={addField}>+ Add field</button>
              <button className="btn-outline" onClick={duplicateField} disabled={!selectedField}>Duplicate field</button>
              <button className="btn-outline" onClick={moveField.bind(null, "up")} disabled={!selectedField}>↑ Up</button>
              <button className="btn-outline" onClick={moveField.bind(null, "down")} disabled={!selectedField}>↓ Down</button>
              <button className="btn-outline" onClick={deleteField} disabled={!selectedField} style={{ color: "#c33" }}>Delete field</button>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {form.schema.map((field) => (
                <button
                  key={field.id}
                  onClick={() => setSelectedId(field.id)}
                  style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 12, textAlign: "left", background: selectedField?.id === field.id ? "rgba(156,143,232,0.08)" : "var(--cream)" }}
                >
                  <div style={{ fontWeight: 700, color: "var(--forest)" }}>{field.label || "Untitled field"}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 4 }}>{field.type}</div>
                </button>
              ))}
            </div>

            {selectedField && (
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "grid", gap: 10 }}>
                <div style={{ fontWeight: 700, color: "var(--forest)" }}>Field settings</div>
                <input className="field" placeholder="Field label" value={selectedField.label} onChange={(e) => updateField({ label: e.target.value })} />
                <input className="field" placeholder="Internal key" value={selectedField.key} onChange={(e) => updateField({ key: e.target.value })} />
                <input className="field" placeholder="Placeholder" value={selectedField.placeholder || ""} onChange={(e) => updateField({ placeholder: e.target.value })} />
                <textarea className="field" placeholder="Description" value={selectedField.description || ""} onChange={(e) => updateField({ description: e.target.value })} />
                <select className="field" value={selectedField.type} onChange={(e) => updateField({ type: e.target.value })}>
                  {FIELD_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6 }}><input type="checkbox" checked={!!selectedField.required} onChange={(e) => updateField({ required: e.target.checked })} /> Required</label>
                  <label style={{ display: "flex", alignItems: "center", gap: 6 }}><input type="checkbox" checked={!!selectedField.hidden} onChange={(e) => updateField({ hidden: e.target.checked })} /> Hidden</label>
                  <label style={{ display: "flex", alignItems: "center", gap: 6 }}><input type="checkbox" checked={!!selectedField.readOnly} onChange={(e) => updateField({ readOnly: e.target.checked })} /> Read only</label>
                </div>
                <textarea className="field" placeholder="Options (comma separated)" value={(selectedField.options || []).join(", ")} onChange={(e) => updateField({ options: e.target.value.split(",").map((option) => option.trim()).filter(Boolean) })} />
              </div>
            )}
          </div>
        </div>
      </div>

      {preview && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 110 }} onClick={() => setPreview(false)}>
          <div className="card" style={{ width: "100%", maxWidth: 820, padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", color: "var(--forest)" }}>Preview</h3>
              <button className="btn-outline" onClick={() => setPreview(false)}>Close</button>
            </div>
            <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
              {form.schema.map((field) => (
                <div key={field.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 12 }}>
                  <div style={{ fontWeight: 700, color: "var(--forest)" }}>{field.label}</div>
                  <div style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: 4 }}>{field.type}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
