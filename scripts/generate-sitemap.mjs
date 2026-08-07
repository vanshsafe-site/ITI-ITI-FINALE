// Runs before `vite build` (see package.json "build" script).
//
// Generates public/sitemap.xml, combining the site's static routes with
// every currently-published blog post fetched from Supabase. Blog posts
// are data-driven (not static files), so a hand-written sitemap can't
// list them — this keeps the sitemap accurate every time the site builds.
import { createClient } from "@supabase/supabase-js";
import { writeFile } from "node:fs/promises";

const SITE_URL = "https://itiitiyogashram.vercel.app";

// Same fallback values used by src/lib/supabase.ts, so this script works
// in CI/Vercel builds without requiring extra env var setup.
const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || "https://zsqnnyqqlhtvgbbtxkze.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzcW5ueXFxbGh0dmdiYnR4a3plIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1MTM5NTEsImV4cCI6MjA5OTA4OTk1MX0.MZO8QRgcCRDo0mvBVVVB2xwtsuZx-cxENieL_8l_71E";

const STATIC_ROUTES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/offerings", changefreq: "weekly", priority: "0.9" },
  { path: "/lunar-yoga", changefreq: "monthly", priority: "0.7" },
  { path: "/gallery", changefreq: "monthly", priority: "0.6" },
  { path: "/videos", changefreq: "weekly", priority: "0.7" },
  { path: "/blog", changefreq: "daily", priority: "0.8" },
  { path: "/astrology", changefreq: "monthly", priority: "0.6" },
  { path: "/apply", changefreq: "monthly", priority: "0.7" },
  { path: "/contact", changefreq: "yearly", priority: "0.6" },
];

function urlEntry({ loc, changefreq, priority, lastmod }) {
  return [
    "    <url>",
    `        <loc>${loc}</loc>`,
    lastmod ? `        <lastmod>${lastmod}</lastmod>` : null,
    `        <changefreq>${changefreq}</changefreq>`,
    `        <priority>${priority}</priority>`,
    "    </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

async function main() {
  const entries = STATIC_ROUTES.map((r) =>
    urlEntry({ loc: `${SITE_URL}${r.path}`, changefreq: r.changefreq, priority: r.priority }),
  );

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: posts, error } = await supabase
      .from("blog_posts")
      .select("slug,published_at,updated_at")
      .eq("published", true);

    if (error) throw error;

    for (const post of posts ?? []) {
      entries.push(
        urlEntry({
          loc: `${SITE_URL}/blog/${post.slug}`,
          changefreq: "monthly",
          priority: "0.7",
          lastmod: (post.updated_at || post.published_at || "").slice(0, 10) || undefined,
        }),
      );
    }
    console.log(`[generate-sitemap] Included ${posts?.length ?? 0} published blog post(s)`);
  } catch (err) {
    console.warn(
      "[generate-sitemap] Could not fetch blog posts from Supabase, sitemap will only include static routes:",
      err.message,
    );
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n` +
    entries.join("\n\n") +
    `\n\n</urlset>\n`;

  await writeFile("public/sitemap.xml", xml);
  console.log(`[generate-sitemap] Wrote public/sitemap.xml with ${entries.length} URL(s)`);
}

main().catch((err) => {
  console.error("[generate-sitemap] Failed:", err);
  process.exit(1);
});
