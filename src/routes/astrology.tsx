import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { NorthIndianChart, type BirthChart } from "@/components/NorthIndianChart";

export const Route = createFileRoute("/astrology")({
  component: Astrology,
  head: () => ({
    meta: [
      { title: "Vedic Astrology Birth Chart | Iti Iti Yogashram" },
      { name: "description", content: "Generate your Vedic astrology birth chart (Rasi and Navamsa) with Iti Iti Yogashram's free astrology tool." },
      { property: "og:title", content: "Vedic Astrology Birth Chart | Iti Iti Yogashram" },
      { property: "og:description", content: "Generate your Vedic astrology birth chart (Rasi and Navamsa) with Iti Iti Yogashram's free astrology tool." },
      { property: "og:type", content: "website" },
    ],
  }),
});

export default Route;

const fieldStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 8,
  border: "1.5px solid var(--border)",
  background: "rgba(255,255,255,0.02)",
  color: "var(--forest)",
  fontSize: 14,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 6,
  fontSize: 13,
  color: "var(--muted)",
};

type ChartResponse = {
  rasiChart?: BirthChart;
  navamsaChart?: BirthChart;
  error?: string;
};

type ChartTab = "rasi" | "navamsa";

const countryOptions = [
  "India",
  "United States",
  "United Kingdom",
  "Australia",
  "Canada",
  "Germany",
  "France",
  "Japan",
  "Singapore",
  "Brazil",
];

const cityOptionsByCountry: Record<string, string[]> = {
  India: ["Mumbai", "Delhi", "Bengaluru", "Chennai", "Kolkata", "Hyderabad", "Pune", "Jaipur", "Ahmedabad"],
  "United States": ["New York", "Los Angeles", "Chicago", "Houston", "San Francisco", "Miami", "Seattle"],
  "United Kingdom": ["London", "Manchester", "Birmingham", "Liverpool", "Leeds"],
  Australia: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
  Canada: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa"],
  Germany: ["Berlin", "Munich", "Frankfurt", "Hamburg", "Cologne"],
  France: ["Paris", "Lyon", "Marseille", "Nice", "Toulouse"],
  Japan: ["Tokyo", "Osaka", "Kyoto", "Nagoya", "Sapporo"],
  Singapore: ["Singapore"],
  Brazil: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza"],
};

function Astrology() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rasiChart, setRasiChart] = useState<BirthChart | null>(null);
  const [navamsaChart, setNavamsaChart] = useState<BirthChart | null>(null);
  const [activeTab, setActiveTab] = useState<ChartTab>("rasi");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRasiChart(null);
    setNavamsaChart(null);

    const cityValue = city.trim();
    const countryValue = country.trim();

    if (!countryOptions.includes(countryValue) || !cityOptionsByCountry[countryValue]?.includes(cityValue)) {
      setLoading(false);
      setError("Please select a valid city and country from the list.");
      return;
    }

    const place = `${cityValue}, ${countryValue}`;

    let data: ChartResponse | null = null;
    let fnError: unknown = null;

    try {
      // Client-side: compute charts using swisseph/browser and a small city database.
      const cityDb: Record<string, { lat: number; lon: number; tz: string }> = {
        // India
        Mumbai: { lat: 19.076, lon: 72.8777, tz: "Asia/Kolkata" },
        Delhi: { lat: 28.7041, lon: 77.1025, tz: "Asia/Kolkata" },
        Bengaluru: { lat: 12.9716, lon: 77.5946, tz: "Asia/Kolkata" },
        Chennai: { lat: 13.0827, lon: 80.2707, tz: "Asia/Kolkata" },
        Kolkata: { lat: 22.5726, lon: 88.3639, tz: "Asia/Kolkata" },
        Hyderabad: { lat: 17.385, lon: 78.4867, tz: "Asia/Kolkata" },
        Pune: { lat: 18.5204, lon: 73.8567, tz: "Asia/Kolkata" },
        Jaipur: { lat: 26.9124, lon: 75.7873, tz: "Asia/Kolkata" },
        Ahmedabad: { lat: 23.0225, lon: 72.5714, tz: "Asia/Kolkata" },
        // US
        "New York": { lat: 40.7128, lon: -74.006, tz: "America/New_York" },
        "Los Angeles": { lat: 34.0522, lon: -118.2437, tz: "America/Los_Angeles" },
        Chicago: { lat: 41.8781, lon: -87.6298, tz: "America/Chicago" },
        Houston: { lat: 29.7604, lon: -95.3698, tz: "America/Chicago" },
        "San Francisco": { lat: 37.7749, lon: -122.4194, tz: "America/Los_Angeles" },
        Miami: { lat: 25.7617, lon: -80.1918, tz: "America/New_York" },
        Seattle: { lat: 47.6062, lon: -122.3321, tz: "America/Los_Angeles" },
        // UK
        London: { lat: 51.5074, lon: -0.1278, tz: "Europe/London" },
        Manchester: { lat: 53.4808, lon: -2.2426, tz: "Europe/London" },
        Birmingham: { lat: 52.4862, lon: -1.8904, tz: "Europe/London" },
        Liverpool: { lat: 53.4084, lon: -2.9916, tz: "Europe/London" },
        Leeds: { lat: 53.8008, lon: -1.5491, tz: "Europe/London" },
        // Australia
        Sydney: { lat: -33.8688, lon: 151.2093, tz: "Australia/Sydney" },
        Melbourne: { lat: -37.8136, lon: 144.9631, tz: "Australia/Melbourne" },
        Brisbane: { lat: -27.4698, lon: 153.0251, tz: "Australia/Brisbane" },
        Perth: { lat: -31.9505, lon: 115.8605, tz: "Australia/Perth" },
        Adelaide: { lat: -34.9285, lon: 138.6007, tz: "Australia/Adelaide" },
        // Canada
        Toronto: { lat: 43.6532, lon: -79.3832, tz: "America/Toronto" },
        Vancouver: { lat: 49.2827, lon: -123.1207, tz: "America/Vancouver" },
        Montreal: { lat: 45.5017, lon: -73.5673, tz: "America/Toronto" },
        Calgary: { lat: 51.0447, lon: -114.0719, tz: "America/Edmonton" },
        Ottawa: { lat: 45.4215, lon: -75.6972, tz: "America/Toronto" },
        // Germany
        Berlin: { lat: 52.52, lon: 13.405, tz: "Europe/Berlin" },
        Munich: { lat: 48.1351, lon: 11.582, tz: "Europe/Berlin" },
        Frankfurt: { lat: 50.1109, lon: 8.6821, tz: "Europe/Berlin" },
        Hamburg: { lat: 53.5511, lon: 9.9937, tz: "Europe/Berlin" },
        Cologne: { lat: 50.9375, lon: 6.9603, tz: "Europe/Berlin" },
        // France
        Paris: { lat: 48.8566, lon: 2.3522, tz: "Europe/Paris" },
        Lyon: { lat: 45.764, lon: 4.8357, tz: "Europe/Paris" },
        Marseille: { lat: 43.2965, lon: 5.3698, tz: "Europe/Paris" },
        Nice: { lat: 43.7102, lon: 7.262, tz: "Europe/Paris" },
        Toulouse: { lat: 43.6047, lon: 1.4442, tz: "Europe/Paris" },
        // Japan
        Tokyo: { lat: 35.6762, lon: 139.6503, tz: "Asia/Tokyo" },
        Osaka: { lat: 34.6937, lon: 135.5023, tz: "Asia/Tokyo" },
        Kyoto: { lat: 35.0116, lon: 135.7681, tz: "Asia/Tokyo" },
        Nagoya: { lat: 35.1815, lon: 136.9066, tz: "Asia/Tokyo" },
        Sapporo: { lat: 43.0618, lon: 141.3545, tz: "Asia/Tokyo" },
        // Singapore
        Singapore: { lat: 1.3521, lon: 103.8198, tz: "Asia/Singapore" },
        // Brazil
        "São Paulo": { lat: -23.5505, lon: -46.6333, tz: "America/Sao_Paulo" },
        "Rio de Janeiro": { lat: -22.9068, lon: -43.1729, tz: "America/Sao_Paulo" },
        Brasília: { lat: -15.8267, lon: -47.9218, tz: "America/Sao_Paulo" },
        Salvador: { lat: -12.9777, lon: -38.5016, tz: "America/Bahia" },
        Fortaleza: { lat: -3.7319, lon: -38.5267, tz: "America/Fortaleza" },
      };

      const dbEntry = cityDb[cityValue];
      if (!dbEntry) {
        throw new Error("City not supported by the built-in database.");
      }

      // Compute timezone offset (hours) for the provided local date/time at the IANA zone.
      const [y, m, d] = date.split("-").map(Number);
      const [hh, mm] = time.split(":").map(Number);
      const naiveUtcMs = Date.UTC(y, m - 1, d, hh, mm);
      const dtf = new Intl.DateTimeFormat("en-US", { timeZone: dbEntry.tz, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const parts = dtf.formatToParts(new Date(naiveUtcMs));
      const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
      const asIfUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour") === 24 ? 0 : get("hour"), get("minute"), get("second"));
      const tzOffsetHours = Math.round(((naiveUtcMs - asIfUtc) / (1000 * 60 * 60)) * 100) / 100;

      // Convert local time to UT hours
      const localMs = Date.UTC(y, m - 1, d, hh, mm);
      const utMs = localMs - tzOffsetHours * 60 * 60 * 1000;
      const utDate = new Date(utMs);

      // Dynamically load swisseph browser build from CDN first, then local fallback.
      // Try unpkg then jsdelivr then local package.
      let swe: any = null;
      try {
        // Load ES module build from unpkg first (runtime import via absolute URL).
        // @ts-ignore
        swe = await import("https://unpkg.com/swisseph?module");
      } catch (e1) {
        try {
          // @ts-ignore
          swe = await import("https://cdn.jsdelivr.net/npm/swisseph?module");
        } catch (e2) {
          console.error("Failed to load swisseph from CDN", e1, e2);
          throw new Error("Could not load swisseph ephemeris library from CDN");
        }
      }
      // Initialize ephemeris path if provided (browser bundles data)
      try { if (swe && typeof swe.swe_set_ephe_path === "function") swe.swe_set_ephe_path("/ephe"); } catch (e) {}

      const yearUtc = utDate.getUTCFullYear();
      const monthUtc = utDate.getUTCMonth() + 1;
      const dayUtc = utDate.getUTCDate();
      const hourUtc = utDate.getUTCHours() + utDate.getUTCMinutes() / 60 + utDate.getUTCSeconds() / 3600;

      // Julian day UT
      // @ts-ignore
      const jd = swe.swe_julday(yearUtc, monthUtc, dayUtc, hourUtc, swe.SE_GREG_CAL);

      const PLANETS = [
        { name: "Sun", id: swe.SE_SUN },
        { name: "Moon", id: swe.SE_MOON },
        { name: "Mars", id: swe.SE_MARS },
        { name: "Mercury", id: swe.SE_MERCURY },
        { name: "Jupiter", id: swe.SE_JUPITER },
        { name: "Venus", id: swe.SE_VENUS },
        { name: "Saturn", id: swe.SE_SATURN },
      ];

      const rows: any[] = [];
      for (const p of PLANETS) {
        // @ts-ignore
        const res = swe.swe_calc_ut(jd, p.id, swe.SEFLG_SPEED);
        // res[0] is longitude in degrees
        const lon = Array.isArray(res) ? res[0] : (res?.lon ?? null);
        rows.push({ planet: p.name, longitude: lon });
      }

      // Compute Ascendant using houses
      let ascLon = null;
      try {
        // @ts-ignore
        const houses = swe.swe_houses(jd, dbEntry.lat, dbEntry.lon, "P");
        // houses.ascmc[0] or houses[1]? swisseph returns [cusps, ascmc], sometimes object. Try both.
        if (Array.isArray(houses)) {
          const ascmc = houses[1];
          ascLon = Array.isArray(ascmc) ? ascmc[0] : null;
        } else if (houses && typeof houses === "object") {
          ascLon = houses.ascmc?.[0] ?? houses.ascendant ?? null;
        }
      } catch (e) {
        console.error("swe_houses failed", e);
      }

      if (ascLon == null) {
        // Fallback: use Sun longitude as proxy for ascendant (less accurate)
        ascLon = rows.find((r) => r.planet === "Sun")?.longitude ?? 0;
      }

      // Map rows to rasi/navamsa like server expects
      const SIGNS = [
        "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
      ];

      function navamsaSignIndex(signIdx: number, degreeInSign: number) {
        const slice = Math.min(8, Math.floor(degreeInSign / (30 / 9)));
        const SIGN_MODALITY = [0,1,2,0,1,2,0,1,2,0,1,2];
        const modality = SIGN_MODALITY[signIdx];
        const startOffset = modality === 0 ? 0 : modality === 1 ? 8 : 4;
        const startSign = (signIdx + startOffset) % 12;
        return (startSign + slice) % 12;
      }

      const rasiPlanetsBySign: Record<number, string[]> = {};
      const navamsaPlanetsBySign: Record<number, string[]> = {};

      for (const row of rows) {
        const fullDegree = Number(row.longitude) || 0;
        const signIdx = Math.floor(fullDegree / 30) % 12;
        const degree = fullDegree % 30;
        const abbr = row.planet.slice(0,2);
        (rasiPlanetsBySign[signIdx] ??= []).push(abbr);
        const navSign = navamsaSignIndex(signIdx, degree);
        (navamsaPlanetsBySign[navSign] ??= []).push(abbr);
      }

      const ascSignIdx = Math.floor((Number(ascLon) % 360) / 30);

      function buildChartFromAscendant(ascendantSignIdx: number, planetsBySign: Record<number, string[]>) {
        const houses: any = {};
        for (let i = 1; i <= 12; i++) houses[String(i)] = { sign: "", planets: [] };
        const SIGNS_LOCAL = SIGNS;
        for (let i = 0; i < 12; i++) {
          const signIdx = (ascendantSignIdx + i) % 12;
          const houseKey = String(i + 1);
          houses[houseKey].sign = SIGNS_LOCAL[signIdx];
          houses[houseKey].planets = planetsBySign[signIdx] ?? [];
        }
        return { ascendantSign: SIGNS[ascendantSignIdx], houses };
      }

      const rasiChartLocal = buildChartFromAscendant(ascSignIdx, rasiPlanetsBySign);
      const navamsaChartLocal = buildChartFromAscendant(navamsaSignIndex(ascSignIdx, 0), navamsaPlanetsBySign);

      data = { rasiChart: rasiChartLocal, navamsaChart: navamsaChartLocal };
    } catch (err) {
      fnError = err;
    }

    setLoading(false);

    if (fnError || !data?.rasiChart || !data?.navamsaChart) {
      setError(data?.error ?? "Something went wrong generating your chart. Please try again.");
      return;
    }

    setRasiChart(data.rasiChart);
    setNavamsaChart(data.navamsaChart);
    setActiveTab("rasi");
  }

  const activeChart = activeTab === "rasi" ? rasiChart : navamsaChart;

  return (
    <PageLayout>
      <section style={{ padding: "80px 5%", maxWidth: 960, margin: "0 auto" }}>
        <div style={{ marginBottom: 12 }} className="section-label">
          Vedic Astrology
        </div>
        <h1 className="section-title">Your Free Birth Chart (Kundli)</h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.8, marginTop: 12, maxWidth: 640 }}>
          Enter your exact birth date, time, and place to generate your Rasi (D1) chart and your
          Navamsa (D9) chart in the traditional North Indian style. Birth time matters — even a few
          minutes off can shift your Ascendant and house placements.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 32, marginTop: 36 }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Date of birth</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={fieldStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Time of birth</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={fieldStyle}
              />
            </div>
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label style={labelStyle}>Country of birth</label>
                <select
                  required
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    setCity("");
                  }}
                  style={fieldStyle}
                >
                  <option value="">Select country</option>
                  {countryOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>City of birth</label>
                <select
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={fieldStyle}
                  disabled={!country}
                >
                  <option value="">{country ? "Select city" : "Select country first"}</option>
                  {(cityOptionsByCountry[country] || []).map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? "Calculating..." : "Generate my chart"}
            </button>
            {error && <p style={{ color: "#E08B7A", fontSize: 13 }}>{error}</p>}
          </form>

          <div>
            {activeChart ? (
              <>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <ChartTabButton
                    label="Rasi Chart (D1)"
                    active={activeTab === "rasi"}
                    onClick={() => setActiveTab("rasi")}
                  />
                  <ChartTabButton
                    label="Navamsa Chart (D9)"
                    active={activeTab === "navamsa"}
                    onClick={() => setActiveTab("navamsa")}
                  />
                </div>

                <NorthIndianChart
                  chart={activeChart}
                  title={activeTab === "rasi" ? "Rasi Chart (D1)" : "Navamsa Chart (D9)"}
                />

                <p style={{ marginTop: 14, fontSize: 12, color: "var(--muted)", textAlign: "center" }}>
                  {activeTab === "rasi"
                    ? "Your main birth chart — overall personality, life direction, and house placements."
                    : "Your D9 divisional chart — marriage, spiritual strength, and the finer promise behind each planet."}
                </p>
              </>
            ) : (
              <div
                style={{
                  border: "1.5px dashed var(--border)",
                  borderRadius: 12,
                  padding: "60px 20px",
                  textAlign: "center",
                  color: "var(--muted)",
                }}
              >
                Fill in your birth details to see your Rasi and Navamsa charts here.
              </div>
            )}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}

function ChartTabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "8px 16px",
        borderRadius: 999,
        border: `1.5px solid ${active ? "var(--terra)" : "var(--border)"}`,
        background: active ? "var(--terra)" : "transparent",
        color: active ? "#fff" : "var(--muted)",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
    >
      {label}
    </button>
  );
}
