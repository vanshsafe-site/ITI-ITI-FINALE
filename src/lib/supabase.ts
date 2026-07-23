import { createClient } from "@supabase/supabase-js";

const url =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://zsqnnyqqlhtvgbbtxkze.supabase.co";
const key =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzcW5ueXFxbGh0dmdiYnR4a3plIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1MTM5NTEsImV4cCI6MjA5OTA4OTk1MX0.MZO8QRgcCRDo0mvBVVVB2xwtsuZx-cxENieL_8l_71E";

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});
