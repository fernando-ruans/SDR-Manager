import type { Filters, Station, StationBand } from '../types';

export const DEFAULT_FILTERS: Filters = {
  band: 'all',
  continent: 'all',
  country: '',
  antenna: '',
  sort: 'popular',
};

export const BAND_OPTIONS: Array<{ label: string; value: 'all' | StationBand }> = [
  { label: 'Todas', value: 'all' },
  { label: 'HF', value: 'HF' },
  { label: 'VHF', value: 'VHF' },
  { label: 'UHF', value: 'UHF' },
  { label: '160m', value: '160m' },
  { label: '80m', value: '80m' },
  { label: '60m', value: '60m' },
  { label: '40m', value: '40m' },
  { label: '30m', value: '30m' },
  { label: '20m', value: '20m' },
  { label: '17m', value: '17m' },
  { label: '15m', value: '15m' },
  { label: '12m', value: '12m' },
  { label: '11m', value: '11m' },
  { label: '10m', value: '10m' },
];

export function getBandIntensity(station: Station): 'HF' | 'VHF' | 'UHF' {
  if (station.bands.includes('UHF')) {
    return 'UHF';
  }

  if (station.bands.includes('VHF')) {
    return 'VHF';
  }

  return 'HF';
}

export function filterStations(stations: Station[], filters: Filters): Station[] {
  const normalizedCountry = filters.country.trim().toLowerCase();
  const normalizedAntenna = filters.antenna.trim().toLowerCase();

  const filtered = stations.filter((station) => {
    const matchesBand = filters.band === 'all' || station.bands.includes(filters.band);
    const matchesContinent = filters.continent === 'all' || station.continent === filters.continent;
    const matchesCountry =
      !normalizedCountry ||
      station.country.toLowerCase().includes(normalizedCountry) ||
      station.location.toLowerCase().includes(normalizedCountry);
    const matchesAntenna = !normalizedAntenna || station.antenna.toLowerCase().includes(normalizedAntenna);

    return matchesBand && matchesContinent && matchesCountry && matchesAntenna;
  });

  switch (filters.sort) {
    case 'quiet':
      return filtered.sort((left, right) => left.usersOnline - right.usersOnline);
    case 'alphabetical':
      return filtered.sort((left, right) => left.name.localeCompare(right.name));
    case 'popular':
    default:
      return filtered.sort((left, right) => right.usersOnline - left.usersOnline);
  }
}

export function buildStationPath(stationId: string): string {
  return `/station/${stationId}`;
}