import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/apply")({
  component: Apply,
  head: () => ({
    meta: [
      { title: "Apply Now | Iti Iti Yogashram" },
      { name: "description", content: "Apply to join Iti Iti Yogashram's yoga classes online or in Prayagraj. Fill out the enrollment form to get started." },
      { property: "og:title", content: "Apply Now | Iti Iti Yogashram" },
      { property: "og:description", content: "Apply to join Iti Iti Yogashram's yoga classes online or in Prayagraj. Fill out the enrollment form to get started." },
      { property: "og:type", content: "website" },
    ],
  }),
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
  id: "default-registration",
  name: "Registration Form",
  slug: "registration",
  description: "Full registration form for yoga admissions",
  status: "published",
  version: 1,
  schema: [
    { id: "full_name", key: "full_name", type: "short_text", label: "Full Name", placeholder: "Enter full name", required: true, width: "100%" },
    { id: "email_address", key: "email", type: "email", label: "Email Address", placeholder: "name@example.com", required: true, width: "100%" },
    { id: "mobile_number", key: "mobile_number", type: "phone", label: "Mobile Number", placeholder: "Mobile number", required: true, width: "100%" },
    { id: "whatsapp_number", key: "whatsapp_number", type: "phone", label: "WhatsApp Number (if different)", placeholder: "WhatsApp number", width: "100%" },
    { id: "country", key: "country", type: "short_text", label: "Country", placeholder: "Country", required: true, width: "100%" },
    { id: "state", key: "state", type: "short_text", label: "State", placeholder: "State", width: "100%" },
    { id: "city", key: "city", type: "short_text", label: "City", placeholder: "City", width: "100%" },
    { id: "full_address", key: "full_address", type: "long_text", label: "Full Address", placeholder: "Street / Area / Pin code", required: true, width: "100%" },
    { id: "date_of_birth", key: "date_of_birth", type: "date", label: "Date of Birth", placeholder: "Date of birth", width: "100%" },
    { id: "age", key: "age", type: "number", label: "Age", placeholder: "Age", required: true, width: "100%" },
    { id: "gender", key: "gender", type: "dropdown", label: "Gender", placeholder: "Select gender", required: true, options: ["Female", "Male", "Non-binary", "Prefer not to say"], width: "100%" },
    { id: "height", key: "height", type: "number", label: "Height", placeholder: "Height", width: "100%" },
    { id: "weight", key: "weight", type: "number", label: "Weight", placeholder: "Weight", width: "100%" },
    { id: "occupation", key: "occupation", type: "short_text", label: "Occupation", placeholder: "Occupation", width: "100%" },
    { id: "time_zone", key: "time_zone", type: "short_text", label: "Time Zone (Auto Detect)", placeholder: "Auto-detected zone", width: "100%" },
    { id: "experience", key: "experience", type: "dropdown", label: "Experience", placeholder: "Select experience", options: ["Never Practiced", "Beginner", "Intermediate", "Advanced"], width: "100%" },
    { id: "goals", key: "goals", type: "checkbox", label: "Goals", options: ["Weight Loss", "Flexibility", "Strength", "Balance", "Better Posture", "Stress Relief", "Mental Peace", "Pain Relief", "Injury Recovery", "Improve Health", "Better Sleep", "Meditation", "Other"], width: "100%" },
    { id: "areas_of_interest", key: "areas_of_interest", type: "checkbox", label: "Areas of Interest", options: ["Asana", "Pranayama", "Meditation", "Yoga Nidra", "Yin Yoga", "Ashtanga Yoga", "Yoga Philosophy"], width: "100%" },
    { id: "stress_level", key: "stress_level", type: "slider", label: "Stress Level (1-10)", placeholder: "1 to 10", width: "100%" },
    { id: "physical_activity", key: "physical_activity", type: "slider", label: "Physical Activity", description: "Very Inactive → Very Active", width: "100%" },
    { id: "bones_and_joints", key: "bones_and_joints", type: "checkbox", label: "Bones & Joints", options: ["Arthritis", "Cervical", "Back Pain", "Sciatica", "Slipped Disc"], width: "100%" },
    { id: "respiratory", key: "respiratory", type: "checkbox", label: "Respiratory", options: ["Asthma", "Bronchitis", "Cold"], width: "100%" },
    { id: "digestive", key: "digestive", type: "checkbox", label: "Digestive", options: ["Constipation", "Ulcer", "Digestive Disorder"], width: "100%" },
    { id: "hormonal", key: "hormonal", type: "checkbox", label: "Hormonal", options: ["Thyroid", "Diabetes", "Obesity"], width: "100%" },
    { id: "blood_pressure", key: "blood_pressure", type: "checkbox", label: "Blood Pressure", options: ["High BP", "Low BP"], width: "100%" },
    { id: "mental_health", key: "mental_health", type: "checkbox", label: "Mental Health", options: ["Stress", "Anxiety", "Depression", "Sleep Disorder"], width: "100%" },
    { id: "other_conditions", key: "other_conditions", type: "long_text", label: "Other Conditions", placeholder: "Describe any other medical conditions", width: "100%" },
    { id: "emergency_contact_name", key: "emergency_contact_name", type: "short_text", label: "Emergency Contact Name", placeholder: "Emergency contact name", width: "100%" },
    { id: "emergency_contact_relationship", key: "emergency_contact_relationship", type: "short_text", label: "Emergency Contact Relationship", placeholder: "Relationship", width: "100%" },
    { id: "emergency_contact_phone", key: "emergency_contact_phone", type: "phone", label: "Emergency Contact Phone Number", placeholder: "Phone number", width: "100%" },
    { id: "preferred_batch", key: "preferred_batch", type: "short_text", label: "Preferred Batch", placeholder: "Preferred batch", width: "100%" },
    { id: "preferred_time", key: "preferred_time", type: "short_text", label: "Preferred Time", placeholder: "Preferred time", width: "100%" },
    { id: "preferred_language", key: "preferred_language", type: "short_text", label: "Preferred Language", placeholder: "Preferred language", width: "100%" },
    { id: "class_mode", key: "class_mode", type: "radio", label: "Class Mode", options: ["Live Only", "Recorded Only", "Both"], width: "100%" },
    { id: "how_heard", key: "how_heard", type: "dropdown", label: "How did you hear about us?", options: ["Google", "YouTube", "Instagram", "Facebook", "Friend", "Student Referral", "WhatsApp", "Other"], width: "100%" },
    { id: "consent_medical", key: "consent_medical", type: "checkbox", label: "I understand Yoga is not a substitute for medical treatment.", options: ["Yes"], width: "100%" },
    { id: "consent_disclosure", key: "consent_disclosure", type: "checkbox", label: "I have disclosed all relevant medical conditions.", options: ["Yes"], width: "100%" },
    { id: "consent_privacy", key: "consent_privacy", type: "checkbox", label: "I agree to the privacy policy.", options: ["Yes"], width: "100%" },
    { id: "consent_notifications", key: "consent_notifications", type: "checkbox", label: "I agree to receive class notifications.", options: ["Yes"], width: "100%" },
  ],
  settings: { theme: "light", multiStep: false },
};

function Apply() {
  const [formDef, setFormDef] = useState<FormDefinition | null>(null);
  const [loadingForm, setLoadingForm] = useState(true);
  const [values, setValues] = useState<FormValues>({ password: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("form_definitions")
        .select("*")
        .eq("status", "published")
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;
      if (error) {
        const missingSchema = /form_definitions|could not find table/i.test(error.message);
        if (missingSchema) {
          setFormDef(fallbackForm);
          setErr(null);
          setLoadingForm(false);
          return;
        }
        setErr(error.message);
        setLoadingForm(false);
        return;
      }

      const def = (data as FormDefinition | null) || fallbackForm;
      setFormDef(def);
      const defaults: FormValues = { password: "" };
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
    if (field.type === "section_divider") {
      return <div style={{ borderTop: "1px solid var(--border)", margin: "8px 0" }} />;
    }

    const fieldLabel = (
      <label style={{ display: "flex", flexDirection: "column", gap: 6, color: "var(--text)", fontWeight: 600 }}>
        <span>{field.label}{field.required ? " *" : ""}</span>
        {field.description && <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: "0.8rem" }}>{field.description}</span>}
      </label>
    );

    if (field.type === "long_text") {
      return (
        <div style={{ display: "grid", gap: 6 }}>
          {fieldLabel}
          <textarea
            required={field.required}
            className="field"
            placeholder={field.placeholder}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => setFieldValue(field.key, e.target.value)}
            rows={4}
          />
        </div>
      );
    }

    if (field.type === "dropdown") {
      return (
        <div style={{ display: "grid", gap: 6 }}>
          {fieldLabel}
          <select required={field.required} style={sharedStyle} value={typeof value === "string" ? value : ""} onChange={(e) => setFieldValue(field.key, e.target.value)}>
            <option value="">Select…</option>
            {(field.options || []).map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
      );
    }

    if (field.type === "radio") {
      return (
        <div style={{ display: "grid", gap: 8 }}>
          {fieldLabel}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {(field.options || []).map((option) => (
              <label key={option} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input type="radio" name={field.key} checked={value === option} onChange={() => setFieldValue(field.key, option)} />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    if (field.type === "checkbox" || field.type === "multiple_select") {
      return (
        <div style={{ display: "grid", gap: 8 }}>
          {fieldLabel}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {(field.options || []).map((option) => {
              const checked = Array.isArray(value) && value.includes(option);
              return (
                <label key={option} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input type="checkbox" checked={checked} onChange={(e) => {
                    const current = Array.isArray(value) ? value : [];
                    const next = e.target.checked ? [...current, option] : current.filter((item) => item !== option);
                    setFieldValue(field.key, next);
                  }} />
                  <span>{option}</span>
                </label>
              );
            })}
          </div>
        </div>
      );
    }

    if (field.type === "yes_no") {
      return (
        <div style={{ display: "grid", gap: 8 }}>
          {fieldLabel}
          <div style={{ display: "flex", gap: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}><input type="radio" name={field.key} checked={value === "Yes"} onChange={() => setFieldValue(field.key, "Yes")} /> Yes</label>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}><input type="radio" name={field.key} checked={value === "No"} onChange={() => setFieldValue(field.key, "No")} /> No</label>
          </div>
        </div>
      );
    }

    if (field.type === "file_upload" || field.type === "image_upload") {
      const selectedFile = value instanceof File ? value : null;
      const accept = field.key === "photo" ? "image/*" : ".pdf,image/*";
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
          {selectedFile ? (
            <div style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{selectedFile.name}</div>
          ) : null}
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
    setBusy(true);
    setErr(null);

    const email = String(values.email || "").trim().toLowerCase();
    const password = String(values.password || "");
    const fullName = String(values.full_name || "");
    const phone = String(values.mobile_number || values.phone || "");

    if (!email || !password) {
      setErr("Email and password are required to submit the form.");
      setBusy(false);
      return;
    }

    let session = null;
    let authUser = null;

    const signInResult = await supabase.auth.signInWithPassword({ email, password });
    if (!signInResult.error) {
      session = signInResult.data.session;
      authUser = signInResult.data.user;
    } else {
      const signUpResult = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: typeof window !== "undefined" ? window.location.origin + "/dashboard" : undefined,
          data: { full_name: fullName, phone },
        },
      });

      if (signUpResult.error) {
        if (/already registered|duplicate|user already exists/i.test(signUpResult.error.message)) {
          setErr("An account already exists for this email. Please sign in with your password or reset it if you forgot it.");
        } else {
          setErr(signUpResult.error.message);
        }
        setBusy(false);
        return;
      }

      authUser = signUpResult.data.user ?? null;
      session = signUpResult.data.session ?? null;
    }

    const { data: sessionResult } = await supabase.auth.getSession();
    session = sessionResult.session ?? session;
    authUser = authUser ?? session?.user ?? null;

    if (!session) {
      setErr("Please confirm your email address before submitting your application. Check your inbox for the verification link.");
      setBusy(false);
      return;
    }

    const uid = authUser?.id || session?.user?.id;
    if (!uid) {
      setErr("Unable to authenticate. Please sign in and try again.");
      setBusy(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: uid,
      full_name: fullName,
      phone,
      status: "pending",
    });
    if (profileError) {
      setErr(profileError.message);
      setBusy(false);
      return;
    }

    const submissionValues: FormValues = { ...values };
    const fileFields = (formDef?.schema || []).filter((field) => field.type === "file_upload" || field.type === "image_upload");

    for (const field of fileFields) {
      const fileValue = submissionValues[field.key];
      if (fileValue instanceof File) {
        const ext = fileValue.name.split(".").pop() || "bin";
        const path = `application-uploads/${field.key}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("application-uploads").upload(path, fileValue, { cacheControl: "3600", upsert: false });
        if (uploadError) {
          setErr(uploadError.message);
          setBusy(false);
          return;
        }
        const { data: urlData } = supabase.storage.from("application-uploads").getPublicUrl(path);
        submissionValues[field.key] = urlData?.publicUrl || null;
      }
    }

    const isUuid = (value: string | undefined): value is string =>
      typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

    const { data: appData, error: appErr } = await supabase
      .from("applications")
      .insert({
        form_id: isUuid(formDef?.id) ? formDef!.id : null,
        experience: typeof values.experience === "string" ? values.experience : null,
        goals: Array.isArray(values.goals) ? values.goals.join(", ") : typeof values.goals === "string" ? values.goals : null,
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
          <div className="section-label">Join Us</div>
          <h1 className="section-title">Apply to <em>Practice</em></h1>
          <p style={{ color: "var(--muted)", marginTop: 16, marginBottom: 32, lineHeight: 1.7 }}>
            Submit an application to get started. Nishant or our team will reach out to you personally, and once confirmed we'll activate your account so you can access our video library and members area.
          </p>

          {done ? (
            <div className="card" style={{ padding: 32 }}>
              <h3 style={{ color: "var(--forest)", fontSize: "1.4rem", marginBottom: 12 }}>✓ Application received</h3>
              <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
                Check your email to confirm your address (if required by your Supabase settings), then we'll be in touch shortly to schedule an intro conversation.
              </p>
              <div style={{ marginTop: 20 }}>
                <Link to="/dashboard" className="btn-primary">Go to dashboard</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="card" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 6, color: "var(--text)", fontWeight: 600 }}>
                  <span>Password *</span>
                </label>
                <input
                  required
                  type="password"
                  minLength={6}
                  className="field"
                  placeholder="Password (min 6 chars)"
                  value={typeof values.password === "string" ? values.password : ""}
                  onChange={(e) => setFieldValue("password", e.target.value)}
                />
              </div>
              {loadingForm && <p style={{ color: "var(--muted)" }}>Loading form…</p>}
              {!loadingForm && !formDef && <p style={{ color: "#c33" }}>No published form is available yet.</p>}
              {!loadingForm && formDef &&
                formDef.schema.map((field) => (
                  <div key={field.id}>{renderField(field)}</div>
                ))
              }
              {err && <div style={{ color: "#c33", fontSize: "0.85rem" }}>{err}</div>}
              <button className="btn-primary" disabled={busy || loadingForm || !formDef} type="submit">{busy ? "Submitting…" : "Submit application"}</button>
              <Link to="/upload-documents" className="btn-outline" style={{ marginTop: 8, width: "fit-content" }}>Upload documents</Link>
              <p style={{ fontSize: "0.8rem", color: "var(--muted)", textAlign: "center" }}>
                Already applied? <Link to="/auth" style={{ color: "var(--terra)" }}>Sign in</Link>
              </p>
            </form>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
