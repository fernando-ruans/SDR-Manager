import type { Continent, Station, StationBand } from '../types';

type LiveBand = {
  c?: string;
  l?: number;
  h?: number;
  a?: string;
};

type LiveRecord = {
  url: string;
  desc?: string;
  qth?: string;
  lon?: number;
  lat?: number;
  users?: string;
  mobile?: string;
  bands?: LiveBand[];
};

const COUNTRY_ALIASES: Array<[string, string]> = [
  ['brasil', 'Brazil'],
  ['brazil', 'Brazil'],
  ['u.s.a.', 'United States'],
  ['usa', 'United States'],
  ['united states', 'United States'],
  ['netherlands', 'Netherlands'],
  ['nl', 'Netherlands'],
  ['united kingdom', 'United Kingdom'],
  ['uk', 'United Kingdom'],
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

const CONTINENT_BY_COUNTRY = new Map<string, Continent>([
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
  ['Australia', 'Oceania'],
  ['New Zealand', 'Oceania'],
  ['South Africa', 'África'],
]);

const BAND_TAGS: Array<{ band: StationBand; min: number; max: number }> = [
  { band: '160m', min: 1.8, max: 2.0 },
  { band: '80m', min: 3.5, max: 4.0 },
  { band: '60m', min: 5.25, max: 5.45 },
  { band: '40m', min: 7.0, max: 7.3 },
  { band: '30m', min: 10.1, max: 10.15 },
  { band: '20m', min: 14.0, max: 14.35 },
  { band: '17m', min: 18.068, max: 18.168 },
  { band: '15m', min: 21.0, max: 21.45 },
  { band: '12m', min: 24.89, max: 24.99 },
  { band: '11m', min: 26.966, max: 29.7 },
  { band: '10m', min: 28.0, max: 29.7 },
];

function inferCountry(text: string): string {
  const normalizedText = text.toLowerCase();

  for (const [needle, country] of COUNTRY_ALIASES) {
    if (normalizedText.includes(needle)) {
      return country;
    }
  }

  return text;
}

function inferContinent(location: string, country: string, lat: number, lon: number): Continent {
  const normalizedLocation = location.toLowerCase();

  for (const [needle, continent] of Array.from(CONTINENT_BY_COUNTRY.entries())) {
    if (normalizedLocation.includes(needle.toLowerCase())) {
      return continent;
    }
  }

  if (CONTINENT_BY_COUNTRY.has(country)) {
    return CONTINENT_BY_COUNTRY.get(country) as Continent;
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

function parseDisplayName(desc: string) {
  return desc.replace(/^WebSDR at the\s+/i, '').replace(/^WEBSDR\s*-\s*/i, '').trim();
}

function formatBands(record: LiveRecord) {
  const labels = new Set<StationBand | 'HF' | 'VHF' | 'UHF'>();
  let antenna = new Set<string>();
  let minFrequency = Number.POSITIVE_INFINITY;
  let maxFrequency = 0;

  for (const band of record.bands ?? []) {
    const low = Number(band.l);
    const high = Number(band.h);

    if (Number.isFinite(low) && Number.isFinite(high)) {
      minFrequency = Math.min(minFrequency, low);
      maxFrequency = Math.max(maxFrequency, high);

      if (high <= 30) {
        labels.add('HF');
      } else if (low >= 30 && high < 300) {
        labels.add('VHF');
      } else if (low >= 300) {
        labels.add('UHF');
      }

      for (const entry of BAND_TAGS) {
        if (low < entry.max && high > entry.min) {
          labels.add(entry.band);
        }
      }
    }

    if (band.a) {
      antenna.add(band.a);
    }
  }

  if (labels.size === 0) {
    labels.add('HF');
  }

  const normalizedAntenna = Array.from(antenna).join(' / ') || 'Unknown';
  const frequencyRange = Number.isFinite(minFrequency) && maxFrequency > 0
    ? `${minFrequency.toFixed(3)} - ${maxFrequency.toFixed(3)} MHz`
    : '0.000 - 0.000 MHz';

  return {
    bands: Array.from(labels),
    antenna: normalizedAntenna,
    frequencyRange,
  };
}

export function normalizeWebsdrRecord(record: LiveRecord): Station {
  const location = record.desc?.trim() || record.url;
  const name = parseDisplayName(location);
  const country = inferCountry(location);
  const continent = inferContinent(location, country, Number(record.lat), Number(record.lon));
  const bandInfo = formatBands(record);

  return {
    id: new URL(record.url).hostname.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || name.toLowerCase().replace(/[^a-z0-9]+/gi, '-'),
    name,
    location,
    country,
    continent,
    qth: record.qth || '',
    lat: Number(record.lat),
    lon: Number(record.lon),
    url: record.url,
    iframeUrl: record.url,
    bands: bandInfo.bands,
    frequencyRange: bandInfo.frequencyRange,
    usersOnline: Number.parseInt(record.users || '0', 10) || 0,
    antenna: bandInfo.antenna,
    description: `${location} (${record.qth || 'sem QTH'})`,
  };
}

export function normalizeWebsdrRecords(records: LiveRecord[]): Station[] {
  return records.map(normalizeWebsdrRecord);
}