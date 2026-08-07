// Runs after `vite build` (see package.json "build" script).
//
// Why this exists: the Nitro "vercel" preset writes a complete
// .vercel/output directory (Build Output API v3). Once a build supplies
// its own .vercel/output, Vercel deploys exactly that and skips its usual
// zero-config /api auto-detection — so api/astro-chart.ts would silently
// stop being deployed. This script bundles it into
// .vercel/output/functions/api/astro-chart.func so it keeps working.
import { build } from "esbuild";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const outDir = ".vercel/output/functions/api/astro-chart.func";

async function main() {
  if (!existsSync(".vercel/output")) {
    console.log("[bundle-api] .vercel/output not found, skipping (not a Vercel build)");
    return;
  }

  await mkdir(outDir, { recursive: true });

  await build({
    entryPoints: ["api/astro-chart.ts"],
    outfile: `${outDir}/index.mjs`,
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node20",
    external: ["@vercel/node"],
  });

  await writeFile(
    `${outDir}/.vc-config.json`,
    JSON.stringify(
      {
        runtime: "nodejs20.x",
        handler: "index.mjs",
        launcherType: "Nodejs",
        shouldAddHelpers: true,
      },
      null,
      2,
    ),
  );

  console.log("[bundle-api] Bundled api/astro-chart.ts -> " + outDir);

  const configPath = ".vercel/output/config.json";
  const config = JSON.parse(await readFile(configPath, "utf8"));

  const apiRoute = { src: "/api/astro-chart", dest: "/api/astro-chart" };
  const sitemapHeaderRoute = {
    headers: { "content-type": "application/xml; charset=utf-8" },
    src: "/sitemap.xml",
  };
  const robotsHeaderRoute = {
    headers: { "content-type": "text/plain; charset=utf-8" },
    src: "/robots.txt",
  };

  const routeExists = (route) =>
    config.routes.some((r) => JSON.stringify(r) === JSON.stringify(route));

  // Header-only routes must come BEFORE "handle":"filesystem" (matching the
  // existing /assets/(.*) pattern nitro already generates) — once filesystem
  // matches and serves a real static file it can short-circuit, so header
  // rules placed after it may never apply.
  const filesystemIndex = config.routes.findIndex((r) => r.handle === "filesystem");
  const headerInsertAt = filesystemIndex === -1 ? 0 : filesystemIndex;

  let inserted = false;
  for (const route of [sitemapHeaderRoute, robotsHeaderRoute]) {
    if (!routeExists(route)) {
      config.routes.splice(headerInsertAt, 0, route);
      inserted = true;
    }
  }

  // The /api/astro-chart route just needs to come before the SSR catch-all
  // ("/(.*)" -> "/__server") so it resolves to its own function.
  const catchAllIndex = config.routes.findIndex(
    (r) => r.src === "/(.*)" && r.dest === "/__server",
  );
  const apiInsertAt = catchAllIndex === -1 ? config.routes.length : catchAllIndex;
  if (!routeExists(apiRoute)) {
    config.routes.splice(apiInsertAt, 0, apiRoute);
    inserted = true;
  }

  if (inserted) {
    await writeFile(configPath, JSON.stringify(config, null, 2));
    console.log("[bundle-api] Patched config.json (sitemap/robots headers + /api/astro-chart route)");
  }
}

main().catch((err) => {
  console.error("[bundle-api] Failed to bundle api/astro-chart.ts:", err);
  process.exit(1);
});
