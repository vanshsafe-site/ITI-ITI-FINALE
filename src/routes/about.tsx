import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: "About Nishant Jha | Iti Iti Yogashram" },
      { name: "description", content: "Meet Nishant Jha, founder of Iti Iti Yogashram, and learn about our approach to certified yoga instruction in Prayagraj and online." },
      { property: "og:title", content: "About Nishant Jha | Iti Iti Yogashram" },
      { property: "og:description", content: "Meet Nishant Jha, founder of Iti Iti Yogashram, and learn about our approach to certified yoga instruction in Prayagraj and online." },
      { property: "og:type", content: "website" },
    ],
  }),
});

function About() {
  const [title, setTitle] = useState("About Me");
  const [content, setContent] = useState(
    `Yogacharya Nishant Jha is the Founder of Iti Iti Yogashram, a Yoga educator, researcher, artist, and holistic wellness practitioner dedicated to making authentic Yoga accessible worldwide.

With over 10 years of professional Yoga teaching experience and 7+ years of international online instruction, he has guided students from India, the United States, Canada, Mexico, UAE, Australia, [...]

Holding an M.A. in Yoga, an M.Sc. in Mathematics, and a B.Ed., Nishant combines analytical thinking with traditional Yogic wisdom. His teaching philosophy is inspired by the principles of "Sthiram[...]

He specializes in Ashtanga Yoga (Beginner to Advanced), Hatha Yoga, Yin Yoga, Vinyasa Flow, Pranayama, Meditation, Yoga Nidra, Wall Yoga, Sound Healing, Yoga Philosophy, and Corporate Wellness Pro[...]

Alongside regular classes, he conducts workshops, wellness camps, school and college programs, private coaching, corporate sessions, International Yoga Day events, and Bhagavad Gita classes.
`
  );
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [profileImagePositionX, setProfileImagePositionX] = useState(50);
  const [profileImagePositionY, setProfileImagePositionY] = useState(50);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const { data, error } = await supabase
        .from("page_contents")
        .select("title, content, profile_image_url, profile_image_position_x, profile_image_position_y")
        .eq("page", "about")
        .single();

      if (!error && data) {
        setTitle(data.title || "About Me");
        setContent(data.content || content);
        setProfileImageUrl(data.profile_image_url || "");
        setProfileImagePositionX(data.profile_image_position_x ?? 50);
        setProfileImagePositionY(data.profile_image_position_y ?? 50);
      }
      setLoading(false);
    })();
  }, []);

  const paragraphs = useMemo(
    () => content.split(/\n\s*\n/).filter(Boolean),
    [content]
  );

  const [lead, ...body] = paragraphs;

  return (
    <PageLayout>
      <section
        style={{
          background: "radial-gradient(circle at top left, rgba(156,143,232,0.12), transparent 30%), radial-gradient(circle at 95% 18%, rgba(216,184,118,0.12), transparent 25%), var(--cream)",
          padding: "100px 5% 96px",
          color: "var(--forest)",
        }}
      >
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gap: 48 }}>
          <div style={{ display: "grid", gap: 32, gridTemplateColumns: "1.4fr 0.9fr", alignItems: "start" }} className="about-grid">
            <div>
              <div className="section-label">About</div>
              <h1
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(3rem, 6vw, 5.2rem)",
                  fontWeight: 600,
                  color: "var(--forest)",
                  lineHeight: 1.02,
                  maxWidth: 780,
                }}
              >
                {title}
              </h1>
              {lead ? (
                <p
                  style={{
                    marginTop: 24,
                    maxWidth: 760,
                    fontSize: "clamp(1.05rem, 1.4vw, 1.18rem)",
                    lineHeight: 1.95,
                    color: "var(--muted)",
                    fontWeight: 300,
                  }}
                >
                  {lead}
                </p>
              ) : null}
            </div>

            {profileImageUrl ? (
              <div
                style={{
                  width: "100%",
                  aspectRatio: "4 / 3",
                  display: "grid",
                  justifyItems: "center",
                  alignItems: "center",
                  background: "var(--dusk)",
                  border: "1px solid var(--border)",
                  borderRadius: 28,
                  overflow: "hidden",
                  minHeight: 360,
                }}
              >
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    objectPosition: "center",
                    background: "var(--dusk)",
                  }}
                />
              </div>
            ) : null}
          </div>

          <div style={{ display: "grid", gap: 32 }}>
            <article
              style={{
                background: "var(--warm-white)",
                border: "1px solid var(--border)",
                borderRadius: 28,
                padding: "36px 40px",
                boxShadow: "0 40px 100px -48px rgba(0,0,0,0.55)",
              }}
            >
              {body.map((paragraph) => (
                <p
                  key={paragraph}
                  style={{
                    marginTop: 24,
                    fontSize: "1rem",
                    lineHeight: 1.9,
                    color: "var(--text)",
                    fontWeight: 300,
                  }}
                >
                  {paragraph}
                </p>
              ))}
            </article>

            <blockquote
              style={{
                margin: 0,
                padding: "30px 36px",
                background: "rgba(216,184,118,0.1)",
                borderLeft: "4px solid var(--terra)",
                borderRadius: 22,
                color: "var(--forest)",
                fontStyle: "italic",
                lineHeight: 1.85,
                boxShadow: "0 24px 70px -45px rgba(0, 0, 0, 0.5)",
              }}
            >
              “True Yoga is not about mastering difficult postures—it is about cultivating balance, awareness, and steady progress in harmony with oneself, nature, and life.”
            </blockquote>

          </div>
        </div>
      </section>
      <style>{`@media (max-width: 900px) { .about-grid { grid-template-columns: 1fr !important; gap: 40px !important; } }`}</style>
    </PageLayout>
  );
}

export default About;
