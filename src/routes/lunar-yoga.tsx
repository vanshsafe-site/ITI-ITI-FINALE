import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";

export const Route = createFileRoute("/lunar-yoga")({
  component: LunarYoga,
  head: () => ({
    meta: [
      { title: "Lunar Yoga | Iti Iti Yogashram" },
      { name: "description", content: "Discover Lunar Yoga practices with Iti Iti Yogashram, aligning your practice with the moon's cycles for deeper wellness." },
      { property: "og:title", content: "Lunar Yoga | Iti Iti Yogashram" },
      { property: "og:description", content: "Discover Lunar Yoga practices with Iti Iti Yogashram, aligning your practice with the moon's cycles for deeper wellness." },
      { property: "og:type", content: "website" },
    ],
  }),
});

export default Route;

function LunarYoga() {
  return (
    <PageLayout>
      <section style={{ padding: "80px 5%", maxWidth: 960, margin: "0 auto" }}>
        <div style={{ marginBottom: 12 }} className="section-label">Lunar Yoga</div>
        <h1 className="section-title">Yoga Guided by the Lunar Cycle</h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.8, marginTop: 12 }}>
          Lunar Yoga pairs classical practices with the natural rhythm of the moon. This approach supports
          optimal recovery, energy management, and a steady, sustainable practice tailored to your body's
          cyclical needs.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, marginTop: 28 }}>
          <div>
            <h2 style={{ marginTop: 8 }}>Overview</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
              The moon's phases are used as an organizing principle: new moon for intention and gentle practice,
              waxing for building strength, full moon for peak practices and pranayama, and waning for release and
              restorative work.
            </p>

            <h3 style={{ marginTop: 18 }}>How it helps</h3>
            <ul style={{ color: "var(--muted)", lineHeight: 1.7 }}>
              <li>Aligns training load with natural energy cycles</li>
              <li>Encourages restorative phases and prevents burnout</li>
              <li>Supports better sleep, focus, and emotional balance</li>
            </ul>

            <h3 style={{ marginTop: 18 }}>Sample 4-week rhythm</h3>
            <ol style={{ color: "var(--muted)", lineHeight: 1.7 }}>
              <li>Week 1 (New → Waxing): Gentle foundations, shorter practices, intention setting.</li>
              <li>Week 2 (Waxing): Add strength and dynamic sequences.</li>
              <li>Week 3 (Full): Peak practices, pranayama, and focused alignment work.</li>
              <li>Week 4 (Waning): Release, yin, and nidra for restoration.</li>
            </ol>

            <h3 style={{ marginTop: 18 }}>Want to learn more?</h3>
            <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
              Join our dedicated Lunar Yoga workshops or book a trial class to experience a month-long guided cycle.
              <br />
              <Link to="/contact" className="btn-primary" style={{ marginTop: 12, display: "inline-block" }}>Contact us</Link>
            </p>
          </div>

          <aside className="card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, color: "var(--forest)", marginBottom: 8 }}>Quick Guide</div>
            <div style={{ color: "var(--muted)", lineHeight: 1.6 }}>
              <strong>New Moon:</strong> Restorative • Intentions
              <br />
              <strong>Waxing:</strong> Build • Strength
              <br />
              <strong>Full Moon:</strong> Peak • Breathwork
              <br />
              <strong>Waning:</strong> Release • Yin
            </div>
          </aside>
        </div>
      </section>
    </PageLayout>
  );
}
