import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
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

function Dashboard() {
  const { user, profile, isAdmin, loading, refresh } = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [experience, setExperience] = useState("");
  const [goals, setGoals] = useState("");
  const [applicationStatus, setApplicationStatus] = useState("pending");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [nameErr, setNameErr] = useState<string | null>(null);
  const [applicationErr, setApplicationErr] = useState<string | null>(null);
  const [applicationSaving, setApplicationSaving] = useState(false);
  const [applicationSaved, setApplicationSaved] = useState(false);
  const [formDef, setFormDef] = useState<FormDefinition | null>(null);
  const [formLoading, setFormLoading] = useState(true);
  const [formValues, setFormValues] = useState<Record<string, string | boolean | string[]>>({});
  const [formSaving, setFormSaving] = useState(false);
  const [formSaved, setFormSaved] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  useEffect(() => {
    setName(profile?.full_name || "");
  }, [profile?.full_name]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("applications")
        .select("experience, goals, status, submission_data")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setExperience((data as any)?.experience || "");
        setGoals((data as any)?.goals || "");
        setApplicationStatus((data as any)?.status || "pending");
        const savedValues = (data as any)?.submission_data || {};
        setFormValues((prev) => ({ ...prev, ...savedValues }));
      }
    })();
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("form_definitions")
        .select("*")
        .eq("status", "published")
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        setFormDef(fallbackForm);
        setFormLoading(false);
        return;
      }

      setFormDef((data as FormDefinition | null) || fallbackForm);
      setFormLoading(false);
    })();
  }, [user?.id]);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [loading, user, nav]);

  const saveName = async () => {
    if (!user) return;
    const trimmed = name.trim();
    if (!trimmed) { setNameErr("Name can't be empty."); return; }
    setSaving(true);
    setNameErr(null);
    setSaved(false);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: trimmed })
      .eq("id", user.id);
    setSaving(false);
    if (error) { setNameErr(error.message); return; }
    setSaved(true);
    await refresh();
    setTimeout(() => setSaved(false), 2000);
  };

  const saveApplication = async () => {
    if (!user) return;
    setApplicationSaving(true);
    setApplicationErr(null);
    setApplicationSaved(false);

    const { data: existing } = await supabase
      .from("applications")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    const payload = {
      user_id: user.id,
      experience: experience.trim(),
      goals: goals.trim(),
      status: applicationStatus,
      submission_data: formValues,
    };

    const { error } = existing?.id
      ? await supabase.from("applications").update(payload).eq("id", existing.id)
      : await supabase.from("applications").insert(payload);

    setApplicationSaving(false);
    if (error) { setApplicationErr(error.message); return; }
    setApplicationSaved(true);
    setTimeout(() => setApplicationSaved(false), 2000);
  };

  const saveDashboardForm = async () => {
    if (!user) return;
    setFormSaving(true);
    setFormErr(null);
    setFormSaved(false);

    const { data: existing } = await supabase
      .from("applications")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    const payload = {
      user_id: user.id,
      experience: typeof formValues.experience === "string" ? formValues.experience : "",
      goals: typeof formValues.goals === "string" ? formValues.goals : "",
      status: applicationStatus,
      submission_data: formValues,
    };

    const { error } = existing?.id
      ? await supabase.from("applications").update(payload).eq("id", existing.id)
      : await supabase.from("applications").insert(payload);

    setFormSaving(false);
    if (error) { setFormErr(error.message); return; }
    setFormSaved(true);
    setTimeout(() => setFormSaved(false), 2000);
  };

  const setFormValue = (key: string, value: string | boolean | string[]) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const renderField = (field: FormField) => {
    if (field.hidden) return null;
    const value = formValues[field.key] ?? "";
    const sharedStyle = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: "0.9rem" };

    if (field.type === "heading") {
      return <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.35rem", color: "var(--forest)", fontWeight: 700 }}>{field.label}</div>;
    }
    if (field.type === "paragraph" || field.type === "rich_text" || field.type === "html_block" || field.type === "information_box") {
      return <div style={{ color: "var(--muted)", lineHeight: 1.7 }}>{field.description || field.label}</div>;
    }
    if (field.type === "section_divider") {
      return <div style={{ borderTop: "1px solid var(--border)", margin: "8px 0" }} />;
    }

    const label = (
      <label style={{ display: "flex", flexDirection: "column", gap: 6, color: "var(--text)", fontWeight: 600 }}>
        <span>{field.label}{field.required ? " *" : ""}</span>
        {field.description && <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: "0.8rem" }}>{field.description}</span>}
      </label>
    );

    if (field.type === "long_text") {
      return (
        <div style={{ display: "grid", gap: 6 }}>
          {label}
          <textarea required={field.required} className="field" rows={4} placeholder={field.placeholder} value={typeof value === "string" ? value : ""} onChange={(e) => setFormValue(field.key, e.target.value)} />
        </div>
      );
    }

    if (field.type === "dropdown") {
      return (
        <div style={{ display: "grid", gap: 6 }}>
          {label}
          <select required={field.required} style={sharedStyle} value={typeof value === "string" ? value : ""} onChange={(e) => setFormValue(field.key, e.target.value)}>
            <option value="">Select…</option>
            {(field.options || []).map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
      );
    }

    if (field.type === "radio") {
      return (
        <div style={{ display: "grid", gap: 8 }}>
          {label}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {(field.options || []).map((option) => (
              <label key={option} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input type="radio" name={field.key} checked={value === option} onChange={() => setFormValue(field.key, option)} />
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
          {label}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {(field.options || []).map((option) => {
              const checked = Array.isArray(value) && value.includes(option);
              return (
                <label key={option} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const current = Array.isArray(value) ? value : [];
                      const next = e.target.checked ? [...current, option] : current.filter((item) => item !== option);
                      setFormValue(field.key, next);
                    }}
                  />
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
          {label}
          <div style={{ display: "flex", gap: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}><input type="radio" name={field.key} checked={value === "Yes"} onChange={() => setFormValue(field.key, "Yes")} /> Yes</label>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}><input type="radio" name={field.key} checked={value === "No"} onChange={() => setFormValue(field.key, "No")} /> No</label>
          </div>
        </div>
      );
    }

    return (
      <div style={{ display: "grid", gap: 6 }}>
        {label}
        <input
          required={field.required}
          type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : field.type === "number" ? "number" : "text"}
          className="field"
          placeholder={field.placeholder}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => setFormValue(field.key, e.target.value)}
        />
      </div>
    );
  };

  if (loading || !user) {
    return <PageLayout><div style={{ padding: 120, textAlign: "center", color: "var(--muted)" }}>Loading…</div></PageLayout>;
  }

  return (
    <PageLayout>
      <section style={{ padding: "120px 5% 96px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="section-label">Your Account</div>
          <h1 className="section-title">Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}</h1>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginTop: 32 }}>
            <div className="card">
              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)" }}>Email</div>
              <div style={{ marginTop: 8, color: "var(--text)" }}>{user.email}</div>
              {profile?.phone && (
                <>
                  <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", marginTop: 16 }}>Phone</div>
                  <div style={{ marginTop: 8 }}>{profile.phone}</div>
                </>
              )}

              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", marginTop: 16 }}>Name</div>
              <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setNameErr(null); }}
                  placeholder="Enter your name"
                  style={{
                    flex: 1, minWidth: 160, padding: "8px 12px", borderRadius: 8,
                    border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: "0.9rem",
                  }}
                />
                <button
                  className="btn-outline"
                  disabled={saving || name.trim() === (profile?.full_name || "")}
                  onClick={saveName}
                  style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
              {nameErr && <div style={{ marginTop: 6, color: "#c33", fontSize: "0.8rem" }}>{nameErr}</div>}
              {saved && <div style={{ marginTop: 6, color: "#237", fontSize: "0.8rem" }}>Saved!</div>}
            </div>

            <div className="card" style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)" }}>Registration form</div>
              <p style={{ color: "var(--muted)", marginTop: 8, lineHeight: 1.7 }}>
                Open the registration form page to complete or update your admission details whenever needed.
              </p>
              <Link to="/apply" className="btn-primary" style={{ display: "inline-flex", marginTop: 12, textDecoration: "none" }}>
                Open registration form
              </Link>
            </div>

            <div className="card">
              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)" }}>Quick Links</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                <Link to="/apply" style={{ color: "var(--terra)" }}>→ Registration Form</Link>
                <Link to="/upload-documents" style={{ color: "var(--terra)" }}>→ Upload Documents</Link>
                <Link to="/videos" style={{ color: "var(--terra)" }}>→ Video Library</Link>
                <Link to="/blog" style={{ color: "var(--terra)" }}>→ Blog</Link>
                <Link to="/contact" style={{ color: "var(--terra)" }}>→ Contact Us</Link>
                {isAdmin && <Link to="/admin" style={{ color: "var(--terra)", fontWeight: 600 }}>→ Admin Panel</Link>}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}