import { useMemo } from "react";

/**
 * Fixed, full-viewport ambient night sky: soft gradient wash,
 * a glowing crescent moon, and a scatter of twinkling stars.
 * Purely decorative — sits behind all page content.
 */
export function Starfield() {
  const stars = useMemo(() => {
    // deterministic pseudo-random scatter so it doesn't reshuffle on re-render
    let seed = 42;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    return Array.from({ length: 90 }).map((_, i) => {
      const size = rand() < 0.82 ? 1 + rand() * 1.4 : 2 + rand() * 1.6;
      return {
        id: i,
        top: `${rand() * 100}%`,
        left: `${rand() * 100}%`,
        size,
        delay: `${(rand() * 5).toFixed(2)}s`,
        duration: `${(3.5 + rand() * 3).toFixed(2)}s`,
      };
    });
  }, []);

  return (
    <div className="lunar-sky" aria-hidden="true">
      <div className="moon-glow" />
      {stars.map((s) => (
        <span
          key={s.id}
          className="star"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            animationDelay: s.delay,
            animationDuration: s.duration,
          }}
        />
      ))}
    </div>
  );
}
