import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/")({ component: AdminIndex });

function AdminIndex() {
  const [counts, setCounts] = useState({ users: 0, videos: 0, posts: 0 });

  useEffect(() => {
    (async () => {
      const [u, v, b] = await Promise.all([
        supabase.rpc("admin_list_users"),
        supabase.from("videos").select("id", { count: "exact", head: true }),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
      ]);
      setCounts({ users: (u.data as any[])?.length || 0, videos: v.count || 0, posts: b.count || 0 });
    })();
  }, []);

  const stat = (label: string, val: number, to: string) => (
    <Link to={to} className="card" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
      <div style={{ fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>{label}</div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.4rem", color: "var(--forest)", marginTop: 4 }}>{val}</div>
    </Link>
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
      {stat("Users", counts.users, "/admin/users")}
      {stat("Videos", counts.videos, "/admin/videos")}
      {stat("Blog posts", counts.posts, "/admin/blog")}
    </div>
  );
}