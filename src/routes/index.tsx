import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/")({ component: Home });

type Plan = { id: string; name: string; price: number; currency: string; period: string; features: string[]; badge?: string };
type BlogPost = { id: string; slug: string; title: string; excerpt: string | null; cover_image_url: string | null; published_at: string | null; category: string | null };
type Video = { id: string; title: string; description: string | null; youtube_id: string; thumbnail_url: string | null; sort_order: number };

const whyChooseUs = [
  ["🌿", "Traditional Yoga", "Rooted in classic yogic structure and discipline."],
  ["🤝", "Personalized Guidance", "Clear cues that adapt to different experience levels."],
  ["📹", "Live + Recorded", "Practice in real time or revisit the class later."],
  ["🌙", "Lunar Yoga Cycle", "A grounded framework for rhythm, recovery, and consistency."],
  ["👥", "Small Batch Learning", "Focused attention for stronger progress."],
  ["🧠", "Research Based Teaching", "Structured, practical instruction for sustainable results."],
];

const testimonials = [
  { name: "Vansh", role: "India", img: "/testimonials/vansh.png", text: "Nishant Sir creates a calm and disciplined environment. His guidance made yoga feel practical and sustainable." },
  { name: "Karla", role: "Mexico 🇲🇽", img: "/testimonials/karla.png", text: "Joining online from Mexico gave me structure, confidence, and a routine that truly improved my overall well-being." },
  { name: "Anonymous", role: "Student", img: "/testimonials/student.png", text: "The classes helped me reduce stress, regain balance, and stay consistent with a gentle, realistic approach." },
];

const timeline = ["Book Trial", "Attend Live Class", "Receive Recording", "Join Membership"];

const faqPreview = [
  { q: "Who can join?", a: "Beginners, seniors, and international students are all welcome." },
  { q: "Do I need prior experience?", a: "No, the classes are designed to be beginner-friendly and progressively guided." },
  { q: "What if I miss a class?", a: "Members receive recordings and support for continued learning." },
  { q: "Which platform do sessions use?", a: "Live sessions are delivered through accessible online tools with clear guides." },
  { q: "Can I practice only from recordings?", a: "Yes, recordings support flexible practice for members who prefer that rhythm." },
];

function Home() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    supabase.from("pricing_plans").select("*").order("sort_order").limit(1)
      .then(({ data }) => {
        if (data && data[0]) setPlan(data[0] as any);
      });

    supabase.from("blog_posts").select("id,slug,title,excerpt,cover_image_url,published_at,category")
      .eq("published", true).order("published_at", { ascending: false }).limit(3)
      .then(({ data }) => { setBlogs((data as any) || []); })
      .catch(() => setBlogs([]));

    supabase.from("videos").select("*").order("sort_order").limit(3)
      .then(({ data }) => { setVideos((data as any) || []); })
      .catch(() => setVideos([]));
  }, []);

  return (
    <PageLayout>
      {/* HERO */}
      <section style={{ minHeight: "90vh", position: "relative", display: "flex", alignItems: "center", padding: "100px 5% 80px", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 70% 80% at 80% 50%, rgba(167,180,230,0.28) 0%, transparent 65%), radial-gradient(ellipse 50% 60% at 15% 80%, rgba(216,184,118,0.12) 0%, transparent 55%), var(--cream)",
        }} />
        {/* Abstract Art - Top Right */}
        <svg
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: "clamp(500px, 70vw, 1000px)",
            height: "clamp(500px, 70vh, 900px)",
            opacity: 0.65,
            zIndex: 1,
          }}
          viewBox="0 0 600 600"
          xmlns="http://www.w3.org/1200/svg"
        >
          {/* Flowing organic shapes with nature-inspired colors */}
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "rgba(167,180,230,0.5)", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "rgba(216,184,118,0.4)", stopOpacity: 1 }} />
            </linearGradient>
            <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: "rgba(137,146,184,0.4)", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "rgba(167,180,230,0.3)", stopOpacity: 1 }} />
            </linearGradient>
            <radialGradient id="grad3" cx="40%" cy="40%">
              <stop offset="0%" style={{ stopColor: "rgba(167,180,230,0.6)", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "rgba(216,184,118,0.2)", stopOpacity: 1 }} />
            </radialGradient>
            <filter id="blur">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
            </filter>
            <filter id="blur2">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
            </filter>
          </defs>
          
          {/* Large flowing background curves */}
          <path
            d="M 0,-100 Q 200,150 400,80 T 800,250 Q 500,400 300,550 Q 100,400 0,450 Z"
            fill="url(#grad1)"
            opacity="0.45"
          />
          
          {/* Secondary flowing shape */}
          <path
            d="M 300,0 Q 500,120 550,300 Q 500,450 300,550 Q 150,450 100,300 Q 150,120 300,0 Z"
            fill="url(#grad2)"
            opacity="0.35"
          />
          
          {/* Large organic blob shapes */}
          <circle cx="480" cy="120" r="95" fill="rgba(167,180,230,0.3)" filter="url(#blur)" />
          <circle cx="520" cy="280" r="85" fill="rgba(216,184,118,0.25)" filter="url(#blur)" />
          <circle cx="380" cy="200" r="110" fill="rgba(137,146,184,0.2)" filter="url(#blur)" opacity="0.6" />
          <ellipse cx="420" cy="400" rx="80" ry="120" fill="url(#grad3)" opacity="0.4" filter="url(#blur)" />
          
          {/* Additional decorative blobs */}
          <circle cx="250" cy="80" r="65" fill="rgba(167,180,230,0.25)" filter="url(#blur)" opacity="0.5" />
          <circle cx="550" cy="450" r="70" fill="rgba(216,184,118,0.2)" filter="url(#blur)" opacity="0.4" />
          
          {/* Curved flowing lines for movement */}
          <path
            d="M 250,50 Q 450,180 480,380"
            stroke="rgba(167,180,230,0.35)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            filter="url(#blur2)"
          />
          <path
            d="M 350,100 Q 520,250 450,500"
            stroke="rgba(216,184,118,0.25)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            filter="url(#blur2)"
          />
          <path
            d="M 200,150 Q 380,280 320,550"
            stroke="rgba(137,146,184,0.2)"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            filter="url(#blur2)"
          />
          
          {/* Decorative circular elements */}
          <circle cx="420" cy="300" r="35" fill="none" stroke="rgba(167,180,230,0.3)" strokeWidth="2.5" />
          <circle cx="500" cy="200" r="50" fill="none" stroke="rgba(216,184,118,0.25)" strokeWidth="2" opacity="0.7" />
          <circle cx="350" cy="450" r="40" fill="none" stroke="rgba(137,146,184,0.2)" strokeWidth="2" />
          
          {/* Small accent circles */}
          <circle cx="480" cy="320" r="18" fill="rgba(167,180,230,0.4)" />
          <circle cx="520" cy="380" r="22" fill="rgba(216,184,118,0.25)" />
          <circle cx="350" cy="150" r="15" fill="rgba(137,146,184,0.3)" />
          <circle cx="440" cy="500" r="20" fill="rgba(167,180,230,0.3)" />
          <circle cx="280" cy="380" r="16" fill="rgba(216,184,118,0.2)" />
        </svg>
        <div style={{ position: "relative", maxWidth: 680, zIndex: 2 }} className="fade-up">
          <div style={{ display: "inline-flex", background: "var(--leaf)", border: "1px solid var(--leaf-mid)", borderRadius: 40, padding: "6px 14px", fontSize: "0.78rem", color: "var(--sage)", marginBottom: 28 }}>
            🌿 Est. — Prayagraj, Uttar Pradesh
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(3rem, 7vw, 5.5rem)", fontWeight: 600, lineHeight: 1.05, color: "var(--forest)", marginBottom: 20 }}>
            Your Journey to <em style={{ fontStyle: "italic", fontWeight: 300, color: "var(--terra)" }}>Lifelong</em> Wellness
          </h1>
          <p style={{ fontSize: "1.05rem", lineHeight: 1.75, color: "var(--muted)", maxWidth: 520, marginBottom: 38, fontWeight: 300 }}>
            Guided by Nishant Jha, a certified government yoga teacher with 10+ years of experience, serving 10,000+ students from India and beyond.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
            {['Live Classes', 'Recorded Access', 'International Students'].map((text) => (
              <span key={text} style={{ background: "rgba(6,8,18,0.06)", border: "1px solid var(--border)", borderRadius: 40, padding: "6px 12px", color: "var(--forest)", fontSize: "0.78rem" }}>{text}</span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link to="/contact" className="btn-primary">🌿 Join Free Trial</Link>
            <Link to="/videos" className="btn-outline">▶ Watch Introduction</Link>
          </div>
          <div style={{ display: "flex", gap: 40, marginTop: 56, paddingTop: 40, borderTop: "1px solid var(--border)", flexWrap: "wrap" }}>
            {[["10,000+", "Students Worldwide"], ["10+", "Years of Experience"], [plan ? `${plan.currency}${plan.price}` : "₹1200", "Per Month"]].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.4rem", fontWeight: 600, color: "var(--forest)", lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 4, letterSpacing: "0.05em" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Practice (moved up) */}
      <section style={{ background: "var(--warm-white)", padding: "96px 5%" }}>
        <div style={{ maxWidth: 600, marginBottom: 56 }}>
          <div className="section-label">Our Practice</div>
          <h2 className="section-title">What We <em>Offer</em></h2>
          <p style={{ marginTop: 16, color: "var(--muted)", fontWeight: 300, lineHeight: 1.8 }}>
            A comprehensive curriculum designed to nurture body, mind, and spirit.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20, maxWidth: 1200, margin: "0 auto" }}>
          {(
            [
              ["🌊", "Vinyasa Yoga", "Flowing, breath-linked movement sequences."],
              ["🧘", "Hatha Yoga", "Classical postures, breathing, and relaxation."],
              ["🧱", "Wall Yoga", "Wall-assisted poses for alignment and support."],
              ["☀️", "Sun Salutation", "Surya Namaskar to energize the body."],
              ["😌", "Yoga Nidra", "Guided deep-rest meditation for restoration."],
              ["🔥", "Ashtanga Yoga (Basic, Intermediate, Advance)", "Standing, mixed, and advanced sequences across the full Ashtanga path."],
              ["🌙", "Moon Salutation", "Chandra Namaskar for calm, grounding energy."],
              ["🌸", "Yin Yoga", "Deep passive stretches for stillness."],
            ].concat(whyChooseUs)
          ).map(([e, t, d]) => (
            <div key={t} className="card" style={{ transition: "transform .3s, box-shadow .3s" }}>
              <div style={{ fontSize: "2rem", marginBottom: 14 }}>{e}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", fontWeight: 600, color: "var(--forest)", marginBottom: 8 }}>{t}</div>
              <div style={{ fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.65, fontWeight: 300 }}>{d}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "96px 5%" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ marginBottom: 40 }}>
            <div className="section-label">How it works</div>
            <h2 className="section-title">From your first step to your <em>daily ritual</em></h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
            {timeline.map((step, index) => (
              <div key={step} className="card" style={{ textAlign: "center", padding: 22 }}>
                <div style={{ fontSize: "0.74rem", letterSpacing: "0.1em", color: "var(--terra)", marginBottom: 10 }}>STEP {index + 1}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", color: "var(--forest)", fontWeight: 600 }}>{step}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "0 5% 96px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
          <div className="card" style={{ padding: 24 }}>
            <div className="section-label">Featured blogs</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.7rem", color: "var(--forest)", marginBottom: 16 }}>Latest insights</h3>
            {blogs.length === 0 ? (
              <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>Blog content will appear here when published in the admin dashboard.</p>
            ) : (
              <div style={{ display: "grid", gap: 14 }}>
                {blogs.map((post) => (
                  <Link key={post.id} to="/blog/$slug" params={{ slug: post.slug }} style={{ textDecoration: "none", border: "1px solid var(--border)", borderRadius: 16, padding: 14, display: "block" }}>
                    <div style={{ fontSize: "0.72rem", color: "var(--terra)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{post.category || "General"}</div>
                    <div style={{ fontWeight: 700, color: "var(--forest)", marginBottom: 6 }}>{post.title}</div>
                    <div style={{ fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.6 }}>{post.excerpt || "Read the full article to explore the practice."}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div className="section-label">Featured videos</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.7rem", color: "var(--forest)", marginBottom: 16 }}>Recent classes</h3>
            {videos.length === 0 ? (
              <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>Video previews will appear here as soon as the video library is populated.</p>
            ) : (
              <div style={{ display: "grid", gap: 14 }}>
                {videos.map((video) => (
                  <div key={video.id} style={{ border: "1px solid var(--border)", borderRadius: 16, padding: 12, display: "grid", gridTemplateColumns: "88px 1fr", gap: 12, alignItems: "center" }}>
                    <img src={video.thumbnail_url || `https://i.ytimg.com/vi/${video.youtube_id}/hqdefault.jpg`} alt={video.title} style={{ width: 88, height: 62, objectFit: "cover", borderRadius: 10 }} />
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--forest)", marginBottom: 4 }}>{video.title}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.5 }}>{video.description || "A class from the member library."}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section style={{ padding: "0 5% 96px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gap: 20 }}>
          <div className="card" style={{ padding: 32 }}>
            <div className="section-label">FAQ preview</div>
            <h2 className="section-title">Common questions, answered <em>clearly</em></h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginTop: 20 }}>
              {faqPreview.map((item) => (
                <div key={item.q} style={{ border: "1px solid var(--border)", borderRadius: 16, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: "var(--forest)", marginBottom: 8 }}>{item.q}</div>
                  <div style={{ fontSize: "0.84rem", color: "var(--muted)", lineHeight: 1.6 }}>{item.a}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "0 5% 120px", textAlign: "center" }}>
        <div className="card" style={{ maxWidth: 900, margin: "0 auto", padding: "40px 32px", background: "linear-gradient(135deg, rgba(6,8,18,0.98), rgba(156,143,232,0.35))", color: "var(--forest)" }}>
          <div style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(232,234,246,0.75)", marginBottom: 12 }}>Ready to begin?</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 600, marginBottom: 16 }}>Join the free trial</h2>
          <p style={{ maxWidth: 640, margin: "0 auto 24px", color: "rgba(232,234,246,0.82)", lineHeight: 1.8 }}>Start with a welcoming introduction, meet the teacher, and see whether the pace and philosophy feel right for you.</p>
          <Link to="/contact" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: "var(--gold)", color: "#0B0E1D", borderRadius: 50, padding: "12px 24px", textDecoration: "none", fontWeight: 700 }}>Join Free Trial</Link>
        </div>
      </section>

      {/* CTA to offerings */}
      <section style={{ padding: "80px 5%", textAlign: "center" }}>
        <div className="section-label" style={{ justifyContent: "center" }}>Join Us</div>
        <h2 className="section-title">Ready to <em>Begin</em>?</h2>
        <p style={{ color: "var(--muted)", margin: "16px 0 32px" }}>See our full offerings and pricing.</p>
        <Link to="/offerings" className="btn-primary">View Offerings →</Link>
      </section>

      {/* Student Voices (moved to bottom) */}
      <section style={{ background: "var(--leaf)", padding: "96px 5%" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="section-label" style={{ justifyContent: "center" }}>Student voices</div>
          <h2 className="section-title">Testimonials from our <em>community</em></h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, maxWidth: 1100, margin: "0 auto" }}>
          {testimonials.map((item) => (
            <div key={item.name} className="card" style={{ padding: 28, borderRadius: 24 }}>
              <div style={{ color: "var(--gold)", marginBottom: 12 }}>★★★★★</div>
              <p style={{ color: "var(--muted)", fontStyle: "italic", lineHeight: 1.8, marginBottom: 20, fontSize: "0.92rem" }}>{item.text}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img src={item.img} alt={item.name} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
                <div>
                  <div style={{ fontWeight: 700, color: "var(--forest)" }}>{item.name}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{item.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}