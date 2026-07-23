import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "../styles.css?url";
import { AuthProvider } from "@/lib/auth";

function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--cream)" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "5rem", color: "var(--forest)" }}>404</h1>
        <p style={{ color: "var(--muted)", marginBottom: 24 }}>This page doesn't exist.</p>
        <a href="/" className="btn-primary">Go home</a>
      </div>
    </div>
  );
}

function ErrorC({ error }: { error: Error }) {
  console.error(error);
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--cream)" }}>
      <div style={{ textAlign: "center", maxWidth: 500 }}>
        <h1 style={{ color: "var(--forest)" }}>Something went wrong</h1>
        <p style={{ color: "var(--muted)", margin: "12px 0 24px" }}>{error.message}</p>
        <a href="/" className="btn-primary">Go home</a>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  ssr: false,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Iti Iti Yogashram — Your Journey to Lifelong Wellness" },
      { name: "description", content: "Certified yoga classes with Nishant Jha in Prayagraj, India — online & offline. 10,000+ students worldwide." },
      { property: "og:title", content: "Iti Iti Yogashram" },
      { property: "og:description", content: "Your Journey to Lifelong Wellness — daily yoga classes online and in Prayagraj." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: ErrorC,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </QueryClientProvider>
  );
}
