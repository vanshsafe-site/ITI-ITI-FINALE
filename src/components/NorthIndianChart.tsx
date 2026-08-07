import { useState } from "react";

export type ChartHouse = {
  sign: string;
  planets: string[];
};

export type BirthChart = {
  ascendantSign: string;
  houses: Record<string, ChartHouse>;
};

const PLANET_LABELS: Record<string, string> = {
  Su: "Su", Mo: "Mo", Ma: "Ma", Me: "Me", Ju: "Ju",
  Ve: "Ve", Sa: "Sa", Ra: "Ra", Ke: "Ke", As: "As",
};

// Fixed cell centers for the North Indian diamond layout (400x400 viewBox).
// House 1 (Lagna) is always top-center; 2-12 run clockwise from there.
const CELLS: Record<string, { x: number; y: number }> = {
  "1": { x: 200, y: 95 },
  "2": { x: 100, y: 45 },
  "3": { x: 45, y: 100 },
  "4": { x: 100, y: 200 },
  "5": { x: 45, y: 300 },
  "6": { x: 100, y: 355 },
  "7": { x: 200, y: 305 },
  "8": { x: 300, y: 355 },
  "9": { x: 355, y: 300 },
  "10": { x: 300, y: 200 },
  "11": { x: 355, y: 100 },
  "12": { x: 300, y: 45 },
};

export function NorthIndianChart({
  chart,
  title = "Rasi Chart (D1)",
}: {
  chart: BirthChart;
  title?: string;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1.5px solid var(--border)",
        borderRadius: 12,
        padding: "28px 20px",
        maxWidth: 460,
        margin: "0 auto",
      }}
    >
      <h3
        style={{
          textAlign: "center",
          margin: "0 0 20px",
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.4rem",
          color: "var(--forest)",
          fontWeight: 600,
        }}
      >
        {title}
      </h3>

      <svg viewBox="0 0 400 400" style={{ width: "100%", height: "auto", display: "block" }}>
        <rect x="10" y="10" width="380" height="380" fill="none" stroke="var(--terra)" strokeWidth="1.5" />
        <line x1="10" y1="10" x2="390" y2="390" stroke="var(--terra)" strokeWidth="1" opacity="0.6" />
        <line x1="390" y1="10" x2="10" y2="390" stroke="var(--terra)" strokeWidth="1" opacity="0.6" />
        <polygon points="200,10 390,200 200,390 10,200" fill="none" stroke="var(--terra)" strokeWidth="1" opacity="0.6" />

        {Object.entries(CELLS).map(([houseNum, pos]) => {
          const house = chart.houses[houseNum];
          const isHovered = hovered === houseNum;
          return (
            <g
              key={houseNum}
              onMouseEnter={() => setHovered(houseNum)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              {isHovered && <circle cx={pos.x} cy={pos.y} r="34" fill="var(--terra)" opacity="0.12" />}
              <text x={pos.x} y={pos.y - 14} textAnchor="middle" fontSize="10" fill="var(--muted)" fontWeight={600}>
                {house?.sign?.slice(0, 4) ?? ""}
              </text>
              {house?.planets?.map((p, i) => (
                <text
                  key={p}
                  x={pos.x - ((house.planets.length - 1) * 13) / 2 + i * 13}
                  y={pos.y + 6}
                  textAnchor="middle"
                  fontSize="13"
                  fill="var(--forest)"
                  fontWeight={700}
                >
                  {PLANET_LABELS[p] ?? p}
                </text>
              ))}
              <text x={pos.x} y={pos.y + 24} textAnchor="middle" fontSize="9" fill="var(--muted)">
                H{houseNum}
              </text>
            </g>
          );
        })}
      </svg>

      {hovered && (
        <div
          style={{
            marginTop: 16,
            padding: "10px 14px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 13,
            color: "var(--forest)",
          }}
        >
          <strong>House {hovered}</strong> — {chart.houses[hovered]?.sign}
          {chart.houses[hovered]?.planets?.length > 0 && (
            <> · Planets: {chart.houses[hovered].planets.join(", ")}</>
          )}
        </div>
      )}
    </div>
  );
}
