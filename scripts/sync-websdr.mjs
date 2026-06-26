import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const outputPath = join(projectRoot, 'public', 'data', 'websdr.generated.json');
const endpoint = 'http://websdr.ewi.utwente.nl/~~websdrlistk?v=1&fmt=2&chseq=0';

const COUNTRY_ALIASES = [
  ['brasil', 'Brazil'],
  ['brazil', 'Brazil'],
  ['u.s.a.', 'United States'],
  ['usa', 'United States'],
  ['united states', 'United States'],
  ['nl', 'Netherlands'],
  ['netherlands', 'Netherlands'],
  ['uk', 'United Kingdom'],
  ['united kingdom', 'United Kingdom'],
  ['england', 'United Kingdom'],
  ['scotland', 'United Kingdom'],
  ['wales', 'United Kingdom'],
  ['france', 'France'],
  ['spain', 'Spain'],
  ['italy', 'Italy'],
  ['denmark', 'Denmark'],
  ['sweden', 'Sweden'],
  ['norway', 'Norway'],
  ['finland', 'Finland'],
  ['germany', 'Germany'],
  ['japan', 'Japan'],
  ['australia', 'Australia'],
  ['argentina', 'Argentina'],
  ['chile', 'Chile'],
  ['canada', 'Canada'],
  ['russia', 'Russia'],
  ['poland', 'Poland'],
  ['czech republic', 'Czech Republic'],
  ['portugal', 'Portugal'],
  ['belgium', 'Belgium'],
  ['switzerland', 'Switzerland'],
  ['austria', 'Austria'],
  ['ireland', 'Ireland'],
  ['hungary', 'Hungary'],
  ['greece', 'Greece'],
  ['turkey', 'Turkey'],
  ['south africa', 'South Africa'],
  ['iceland', 'Iceland'],
  ['new zealand', 'New Zealand'],
];

const CONTINENT_BY_COUNTRY = new Map([
  ['Brazil', 'América do Sul'],
  ['Argentina', 'América do Sul'],
  ['Chile', 'América do Sul'],
  ['United States', 'América do Norte'],
  ['Canada', 'América do Norte'],
  ['Netherlands', 'Europa'],
  ['United Kingdom', 'Europa'],
  ['France', 'Europa'],
  ['Spain', 'Europa'],
  ['Italy', 'Europa'],
  ['Denmark', 'Europa'],
  ['Sweden', 'Europa'],
  ['Norway', 'Europa'],
  ['Finland', 'Europa'],
  ['Germany', 'Europa'],
  ['Poland', 'Europa'],
  ['Czech Republic', 'Europa'],
  ['Portugal', 'Europa'],
  ['Belgium', 'Europa'],
  ['Switzerland', 'Europa'],
  ['Austria', 'Europa'],
  ['Ireland', 'Europa'],
  ['Hungary', 'Europa'],
  ['Greece', 'Europa'],
  ['Turkey', 'Europa'],
  ['Russia', 'Europa'],
  ['Japan', 'Ásia'],
  ['South Africa', 'África'],
  ['Australia', 'Oceania'],
  ['New Zealand', 'Oceania'],
  ['Iceland', 'Europa'],
]);

const BAND_DEFINITIONS = [
  { value: '160m', min: 1.8, max: 2.0 },
  { value: '80m', min: 3.5, max: 4.0 },
  { value: '60m', min: 5.25, max: 5.45 },
  { value: '40m', min: 7.0, max: 7.3 },
  { value: '30m', min: 10.1, max: 10.15 },
  { value: '20m', min: 14.0, max: 14.35 },
  { value: '17m', min: 18.068, max: 18.168 },
  { value: '15m', min: 21.0, max: 21.45 },
  { value: '12m', min: 24.89, max: 24.99 },
  { value: '11m', min: 26.966, max: 29.7 },
  { value: '10m', min: 28.0, max: 29.7 },
];

const CONTINENT_PATTERNS = [
  ['Brazil', 'América do Sul'],
  ['Argentina', 'América do Sul'],
  ['Chile', 'América do Sul'],
  ['Peru', 'América do Sul'],
  ['Uruguay', 'América do Sul'],
  ['Paraguay', 'América do Sul'],
  ['Bolivia', 'América do Sul'],
  ['Colombia', 'América do Sul'],
  ['United States', 'América do Norte'],
  ['Canada', 'América do Norte'],
  ['Mexico', 'América do Norte'],
  ['Netherlands', 'Europa'],
  ['United Kingdom', 'Europa'],
  ['England', 'Europa'],
  ['Scotland', 'Europa'],
  ['Wales', 'Europa'],
  ['Northern Ireland', 'Europa'],
  ['France', 'Europa'],
  ['Spain', 'Europa'],
  ['Italy', 'Europa'],
  ['Denmark', 'Europa'],
  ['Sweden', 'Europa'],
  ['Norway', 'Europa'],
  ['Finland', 'Europa'],
  ['Germany', 'Europa'],
  ['Poland', 'Europa'],
  ['Czech Republic', 'Europa'],
  ['Portugal', 'Europa'],
  ['Belgium', 'Europa'],
  ['Switzerland', 'Europa'],
  ['Austria', 'Europa'],
  ['Ireland', 'Europa'],
  ['Hungary', 'Europa'],
  ['Greece', 'Europa'],
  ['Turkey', 'Europa'],
  ['Russia', 'Europa'],
  ['Iceland', 'Europa'],
  ['Japan', 'Ásia'],
  ['South Korea', 'Ásia'],
  ['North Korea', 'Ásia'],
  ['Taiwan', 'Ásia'],
  ['China', 'Ásia'],
  ['India', 'Ásia'],
  ['Australia', 'Oceania'],
  ['New Zealand', 'Oceania'],
  ['South Africa', 'África'],
  ['Namibia', 'África'],
  ['Kenya', 'África'],
  ['Morocco', 'África'],
];

function inferCountry(text) {
  const normalizedText = text.toLowerCase();

  for (const [needle, country] of COUNTRY_ALIASES) {
    if (normalizedText.includes(needle)) {
      return country;
    }
  }

  return text;
}

function inferContinentFromText(text) {
  const normalizedText = text.toLowerCase();

  for (const [needle, continent] of CONTINENT_PATTERNS) {
    if (normalizedText.includes(needle.toLowerCase())) {
      return continent;
    }
  }

  return null;
}

function inferContinent(location, country, lat, lon) {
  const fromText = inferContinentFromText(location) || inferContinentFromText(country);

  if (fromText) {
    return fromText;
  }

  if (CONTINENT_BY_COUNTRY.has(country)) {
    return CONTINENT_BY_COUNTRY.get(country);
  }

  if (lat > 15 && lat < 75 && lon > -170 && lon < -30) {
    return 'América do Norte';
  }

  if (lat > -60 && lat < 15 && lon > -90 && lon < -30) {
    return 'América do Sul';
  }

  if (lat > 34 && lat < 75 && lon > -25 && lon < 45) {
    return 'Europa';
  }

  if (lat > -40 && lat < 40 && lon > -20 && lon < 55) {
    return 'África';
  }

  if (lat > -10 && lat < 80 && lon > 45 && lon < 180) {
    return 'Ásia';
  }

  return 'Oceania';
}

function dedupe(values) {
  return Array.from(new Set(values)).filter(Boolean);
}

function classifyBands(record) {
  const labels = new Set();
  let antenna = [];
  let minFrequency = Number.POSITIVE_INFINITY;
  let maxFrequency = 0;

  for (const band of record.bands ?? []) {
    const low = Number(band.l);
    const high = Number(band.h);
    minFrequency = Math.min(minFrequency, low);
    maxFrequency = Math.max(maxFrequency, high);

    if (high <= 30) {
      labels.add('HF');
    } else if (low >= 30 && high < 300) {
      labels.add('VHF');
    } else if (low >= 300) {
      labels.add('UHF');
    }

    for (const definition of BAND_DEFINITIONS) {
      if (low < definition.max && high > definition.min) {
        labels.add(definition.value);
      }
    }

    if (band.a) {
      antenna.push(band.a);
    }
  }

  if (labels.size === 0) {
    labels.add('HF');
  }

  if (maxFrequency >= 28.0) {
    labels.add('10m');
  }

  if (minFrequency <= 2.0 && maxFrequency >= 1.8) {
    labels.add('160m');
  }

  if (minFrequency <= 5.45 && maxFrequency >= 5.25) {
    labels.add('60m');
  }

  if (minFrequency <= 10.15 && maxFrequency >= 10.1) {
    labels.add('30m');
  }

  const frequencyRange = Number.isFinite(minFrequency) && maxFrequency > 0
    ? `${minFrequency.toFixed(3)} - ${maxFrequency.toFixed(3)} MHz`
    : '0.000 - 0.000 MHz';

  return {
    bands: dedupe(Array.from(labels)),
    antenna: dedupe(antenna).join(' / ') || 'Unknown',
    frequencyRange,
  };
}

function parseDisplayName(desc) {
  return desc.replace(/^WebSDR at the\s+/i, '').replace(/^WEBSDR\s*-\s*/i, '').trim();
}

function normalizeRecord(record) {
  const name = parseDisplayName(record.desc || record.url);
  const location = record.desc || name;
  const country = inferCountry(location);
  const continent = inferContinent(location, country, Number(record.lat), Number(record.lon));
  const bands = classifyBands(record);
  const qth = record.qth || '';

  return {
    id: new URL(record.url).hostname.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || name.toLowerCase().replace(/[^a-z0-9]+/gi, '-'),
    name,
    location,
    country,
    continent,
    qth,
    lat: Number(record.lat),
    lon: Number(record.lon),
    url: record.url,
    iframeUrl: record.url,
    bands: bands.bands,
    frequencyRange: bands.frequencyRange,
    usersOnline: Number.parseInt(record.users, 10) || 0,
    antenna: bands.antenna,
    description: `${location} (${record.qth || 'sem QTH'})`,
  };
}

async function main() {
  const response = await fetch(endpoint, {
    headers: {
      'user-agent': 'Mozilla/5.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch WebSDR list: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  const jsonStart = text.indexOf('[');
  const jsonText = jsonStart >= 0 ? text.slice(jsonStart) : text;
  const rawRecords = JSON.parse(jsonText);
  const stations = rawRecords.map(normalizeRecord);

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(stations, null, 2)}\n`, 'utf8');

  console.log(`Wrote ${stations.length} stations to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});