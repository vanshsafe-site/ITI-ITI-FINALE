// Vercel Serverless Function (Node.js runtime): /api/astro-chart
// Deploy this at: api/astro-chart.ts in your Vercel project (Vercel
// auto-detects anything under /api as a serverless function).
//
// Frontend should call: POST /api/astro-chart with body { date, time, place }
// It returns BOTH the Rasi (D1) chart and the Navamsa (D9) chart in one response.
//
// Data source: Navamsha Vedic Astrology API (https://www.navamsha.in)
//   - Free tier: 10,000 calls/month, no credit card.
//   - Get a key at https://www.navamsha.in/auth/signup
//   - Put it in the NAVAMSHA_API_KEY environment variable (see env.local.example).
//   - Docs: https://api.navamsha.in/docs

import type { VercelRequest, VercelResponse } from "@vercel/node";

const NAVAMSHA_BASE = "https://api.navamsha.in/api/v1";

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

// 0 = movable (chara), 1 = fixed (sthira), 2 = dual (dwiswabhava) — indexed by sign (0 = Aries).
const SIGN_MODALITY = [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2];

const PLANET_ABBR: Record<string, string> = {
  Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju",
  Venus: "Ve", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke", Ascendant: "As",
  // Navamsha may abbreviate planet names itself — accept short forms too.
  Su: "Su", Mo: "Mo", Ma: "Ma", Me: "Me", Ju: "Ju", Ve: "Ve", Sa: "Sa", Ra: "Ra", Ke: "Ke", As: "As",
};

type ChartHouses = Record<string, { sign: string; planets: string[] }>;
type Chart = { ascendantSign: string; houses: ChartHouses };

function emptyHouses(): ChartHouses {
  const houses: ChartHouses = {};
  for (let i = 1; i <= 12; i++) houses[String(i)] = { sign: "", planets: [] };
  return houses;
}

// Fills in every house's sign by walking forward from the Ascendant sign, then
// returns the finished chart. Used for both D1 and D9 once we know the Lagna.
function buildChartFromAscendant(ascendantSignIdx: number, planetsBySign: Record<number, string[]>): Chart {
  const houses = emptyHouses();
  for (let i = 0; i < 12; i++) {
    const signIdx = (ascendantSignIdx + i) % 12;
    const houseKey = String(i + 1);
    houses[houseKey].sign = SIGNS[signIdx];
    houses[houseKey].planets = planetsBySign[signIdx] ?? [];
  }
  return { ascendantSign: SIGNS[ascendantSignIdx], houses };
}

// Standard Navamsa (D9) division: each 30° sign is split into nine 3°20' slices.
// Which sign the first slice starts from depends on the D1 sign's modality.
function navamsaSignIndex(signIdx: number, degreeInSign: number): number {
  const slice = Math.min(8, Math.floor(degreeInSign / (30 / 9))); // 0-8
  const modality = SIGN_MODALITY[signIdx];
  // Movable signs start their Navamsa count from themselves; fixed signs start
  // from the 9th sign from themselves; dual signs start from the 5th sign from themselves.
  const startOffset = modality === 0 ? 0 : modality === 1 ? 8 : 4;
  const startSign = (signIdx + startOffset) % 12;
  return (startSign + slice) % 12;
}


// --- Geocoding: Open-Meteo Geocoding API (free, no key, server-friendly) ---
function validatePlace(place: string) {
  if (typeof place !== "string") return false;
  const normalized = place.trim();
  if (!normalized) return false;

  const parts = normalized.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length !== 2) return false;

  const validNamePattern = /^[\p{L}\p{M}'\-\.\s]+$/u;
  return parts.every((part) => validNamePattern.test(part));
}

async function geocodePlace(place: string): Promise<{ lat: number; lon: number }> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?count=1&language=en&format=json&name=${encodeURIComponent(place)}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Open-Meteo geocoding failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const results = data?.results;
  if (!Array.isArray(results) || results.length === 0) {
    throw new Error(`Could not find coordinates for "${place}"`);
  }

  const { latitude, longitude } = results[0];
  return { lat: Number(latitude), lon: Number(longitude) };
}

// --- Timezone: geo-tz (lat/lon -> IANA name) + Intl (UTC offset for the date) ---
async function getTimezoneForLocation(latitude: number, longitude: number, year: number, month: number, day: number, hours: number, minutes: number): Promise<number> {
  // Dynamically import `geo-tz` and handle CommonJS/ESM export shapes.
  const geoTzMod = await import("geo-tz").catch((e) => {
    console.error("dynamic import geo-tz failed", e?.message ?? e);
    return null;
  });
  if (!geoTzMod) {
    try {
      const { createRequire } = await import("module");
      const req = createRequire(typeof document === "undefined" ? (typeof import.meta !== "undefined" ? import.meta.url : __filename) : __filename);
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const cjs = req("geo-tz");
      if (cjs) {
        if (typeof cjs === "function") {
          const tzsCjs: unknown = cjs(Number(latitude), Number(longitude));
          const tzNameCjs = Array.isArray(tzsCjs) ? tzsCjs[0] : (tzsCjs as string | undefined);
          if (typeof tzNameCjs === "string") {
            return tzNameCjs as any;
          }
        }
      }
    } catch (e) {
      console.error("require fallback for geo-tz failed", e?.message ?? e);
    }
    throw new Error("geo-tz package not available");
  }

  const modAny: any = geoTzMod as any;
  let geoTzFn: any = null;
  if (typeof geoTzMod === "function") geoTzFn = geoTzMod;
  else if (typeof modAny.default === "function") geoTzFn = modAny.default;
  else if (typeof modAny.geoTz === "function") geoTzFn = modAny.geoTz;

  if (!geoTzFn) {
    // Try CommonJS require via createRequire as a last resort
    try {
      const { createRequire } = await import("module");
      const req = createRequire(typeof document === "undefined" ? (typeof import.meta !== "undefined" ? import.meta.url : __filename) : __filename);
      const cjs = req("geo-tz");
      if (typeof cjs === "function") geoTzFn = cjs;
      else if (typeof cjs?.default === "function") geoTzFn = cjs.default;
      else if (typeof cjs?.geoTz === "function") geoTzFn = cjs.geoTz;
    } catch (e) {
      console.error("require fallback for geo-tz failed", e?.message ?? e);
    }
  }

  if (typeof geoTzFn !== "function") {
    console.error("geo-tz module shape:", Object.keys(modAny));
    throw new Error("geo-tz export is not a function");
  }

  const tzs: unknown = geoTzFn(Number(latitude), Number(longitude));
  const tzName = Array.isArray(tzs) ? tzs[0] : (tzs as string | undefined);
  if (typeof tzName !== "string") {
    throw new Error(`Could not determine timezone for coordinates ${latitude}, ${longitude}`);
  }

  const naiveUtcMs = Date.UTC(year, month - 1, day, hours, minutes);

  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tzName,
    hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  const parts = dtf.formatToParts(new Date(naiveUtcMs));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);

  const asIfUtc = Date.UTC(
    get("year"), get("month") - 1, get("day"),
    get("hour") === 24 ? 0 : get("hour"), get("minute"), get("second"),
  );

  const diffMs = naiveUtcMs - asIfUtc;
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
}

// Pulls a { signIndex, degreeInSign } pair out of a planet row, tolerating a
// few different possible field names/shapes from the Navamsha API response.
function readSignAndDegree(row: any): { signIdx: number; degree: number } | null {
  if (!row || typeof row !== "object") return null;

  const rawSign =
    row.sign ?? row.rasi ?? row.zodiac_sign ?? row.zodiacSign ?? row.current_sign ?? row.rasi_number ?? row.sign_number;

  let signIdx: number | null = null;
  if (typeof rawSign === "number") {
    signIdx = (rawSign - 1 + 12) % 12;
  } else if (typeof rawSign === "string") {
    const idx = SIGNS.findIndex((s) => s.toLowerCase() === rawSign.toLowerCase());
    if (idx >= 0) signIdx = idx;
  }
  if (signIdx === null) return null;

  const fullDegree: number | undefined =
    row.full_degree ?? row.fullDegree ?? row.longitude ?? row.degree_full;
  const degreeInSign: number | undefined =
    row.degree ?? row.degrees ?? row.norm_degree ?? row.normDegree ?? row.degree_in_sign;

  let degree = 0;
  if (typeof degreeInSign === "number") {
    degree = degreeInSign % 30;
  } else if (typeof fullDegree === "number") {
    degree = fullDegree % 30;
  }

  return { signIdx, degree };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.NAVAMSHA_API_KEY;
    const { date, time, place } = req.body ?? {};

    if (!date || !time || !place) {
      return res.status(400).json({ error: "Date, time and place are required." });
    }

    if (!validatePlace(place)) {
      return res.status(400).json({ error: "Place must be entered as City, Country using only letters, spaces, hyphens, apostrophes, or periods." });
    }

    if (!apiKey) {
      return res.status(500).json({ error: "Navamsha API key not configured. Please set NAVAMSHA_API_KEY." });
    }

    const [year, month, day] = date.split("-").map(Number);
    const [hours, minutes] = time.split(":").map(Number);

    if (
      !Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day) ||
      !Number.isFinite(hours) || !Number.isFinite(minutes)
    ) {
      return res.status(400).json({ error: "Date and time must be in a valid format." });
    }

    // 1. Geocode place -> lat/lon (Open-Meteo, free, keyless).
    const { lat: latitude, lon: longitude } = await geocodePlace(place);

    // 2. lat/lon -> IANA timezone -> UTC offset for that specific date (DST-aware).
    const timezone = await getTimezoneForLocation(latitude, longitude, year, month, day, hours, minutes);

    // 3. Extended planetary positions (sign + exact degree for every graha,
    //    including the Ascendant) from the Navamsha API.
    const payload = {
      date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      time: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
      latitude: String(latitude),
      longitude: String(longitude),
      timezone: String(timezone),
      ayanamsha: "lahiri",
    };

    const planetsRes = await fetch(`${NAVAMSHA_BASE}/planets/extended`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!planetsRes.ok) {
      throw new Error(`Navamsha planets/extended failed: ${planetsRes.status} ${await planetsRes.text()}`);
    }

    const planetsData = await planetsRes.json();
    const rows: any[] = Array.isArray(planetsData)
      ? planetsData
      : Array.isArray(planetsData?.planets)
        ? planetsData.planets
        : Object.values(planetsData?.data ?? planetsData?.output ?? planetsData ?? {});

    const rasiPlanetsBySign: Record<number, string[]> = {};
    const navamsaPlanetsBySign: Record<number, string[]> = {};
    let ascendantRasiSign: number | null = null;
    let ascendantNavamsaSign: number | null = null;

    for (const row of rows) {
      if (!row || typeof row !== "object") continue;

      const name: string = row.planet ?? row.name ?? row.planet_name ?? row.graha ?? "";
      const abbr = PLANET_ABBR[name];
      if (!abbr) continue;

      const parsed = readSignAndDegree(row);
      if (!parsed) continue;
      const { signIdx, degree } = parsed;

      if (name === "Ascendant" || name === "As" || name === "Lagna") {
        ascendantRasiSign = signIdx;
        ascendantNavamsaSign = navamsaSignIndex(signIdx, degree);
        continue;
      }

      (rasiPlanetsBySign[signIdx] ??= []).push(abbr);
      const navSign = navamsaSignIndex(signIdx, degree);
      (navamsaPlanetsBySign[navSign] ??= []).push(abbr);
    }

    if (ascendantRasiSign === null) {
      return res.status(500).json({ error: "Unable to parse the Ascendant from Navamsha API response." });
    }

    const rasiChart = buildChartFromAscendant(ascendantRasiSign, rasiPlanetsBySign);
    const navamsaChart = buildChartFromAscendant(
      ascendantNavamsaSign ?? ascendantRasiSign,
      navamsaPlanetsBySign,
    );

    return res.status(200).json({ rasiChart, navamsaChart });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Unable to generate chart. Please try again later.";
    return res.status(500).json({ error: message });
  }
}
