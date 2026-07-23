import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  status: "pending" | "active";
  email?: string | null;
};

type AuthCtx = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  session: null,
  user: null,
  profile: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (uid: string) => {
    const { data: p } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .maybeSingle();
    setProfile(p as Profile | null);
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid);
    setIsAdmin(!!roles?.some((r: any) => r.role === "admin"));
  };

  const refresh = async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    if (data.session?.user) await loadProfile(data.session.user.id);
    else {
      setProfile(null);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      await refresh();
      if (mounted) setLoading(false);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s?.user) loadProfile(s.user.id);
      else {
        setProfile(null);
        setIsAdmin(false);
      }
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
  };

  return (
    <Ctx.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        isAdmin,
        loading,
        signOut,
        refresh,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
