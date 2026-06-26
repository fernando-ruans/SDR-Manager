export type Continent = 'América do Sul' | 'América do Norte' | 'Europa' | 'Ásia' | 'Oceania' | 'África';

export type StationBand =
  | 'HF'
  | 'VHF'
  | 'UHF'
  | '160m'
  | '80m'
  | '60m'
  | '40m'
  | '30m'
  | '20m'
  | '17m'
  | '15m'
  | '12m'
  | '11m'
  | '10m';

export type Station = {
  id: string;
  name: string;
  location: string;
  country: string;
  continent: Continent;
  qth: string;
  lat: number;
  lon: number;
  url: string;
  iframeUrl: string;
  bands: StationBand[];
  frequencyRange: string;
  usersOnline: number;
  antenna: string;
  description: string;
};

export type Filters = {
  band: 'all' | StationBand;
  continent: 'all' | Continent;
  country: string;
  antenna: string;
  sort: 'popular' | 'quiet' | 'alphabetical';
};