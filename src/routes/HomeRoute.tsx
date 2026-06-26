import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { buildStationPath, DEFAULT_FILTERS, filterStations, getBandIntensity } from '../lib/catalog';
import { normalizeWebsdrRecords } from '../lib/websdrNormalize';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Filters, Station } from '../types';
import { FilterSidebar } from '../components/FilterSidebar';
import { StationMap } from '../components/StationMap';
import { StationViewer } from '../components/StationViewer';

export function HomeRoute() {
  const navigate = useNavigate();
  const { stationId } = useParams();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [favorites, setFavorites] = useLocalStorage<string[]>('sdr-global-hub:favorites', []);
  const [history, setHistory] = useLocalStorage<string[]>('sdr-global-hub:history', []);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStations() {
      try {
        setLoading(true);
        setError(null);

        const liveResponse = await fetch('/api/websdr-live', { cache: 'no-store' });

        if (liveResponse.ok) {
          try {
            const livePayload = normalizeWebsdrRecords((await liveResponse.json()) as Parameters<typeof normalizeWebsdrRecords>[0]);

            if (!cancelled) {
              setStations(livePayload);
            }

            return;
          } catch {
            // Fall through to the generated snapshot when the live proxy cannot be parsed.
          }
        }

        const response = await fetch('/data/websdr.generated.json', { cache: 'no-store' });

        if (!response.ok) {
          throw new Error(`Falha ao carregar dados reais do WebSDR (${response.status})`);
        }

        const payload = (await response.json()) as Station[];

        if (!cancelled) {
          setStations(payload);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Falha ao carregar dados reais do WebSDR');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadStations();

    return () => {
      cancelled = true;
    };
  }, []);

  const continents = useMemo(
    () => Array.from(new Set(stations.map((station) => station.continent))),
    [stations],
  );

  const antennaOptions = useMemo(
    () => Array.from(new Set(stations.map((station) => station.antenna))),
    [stations],
  );

  const filteredStations = useMemo(() => filterStations(stations, filters), [filters, stations]);

  const selectedStation = useMemo(() => {
    if (stationId) {
      return stations.find((station) => station.id === stationId) ?? filteredStations[0] ?? stations[0] ?? null;
    }

    return filteredStations[0] ?? stations[0] ?? null;
  }, [filteredStations, stationId, stations]);

  useEffect(() => {
    if (!selectedStation) {
      return;
    }

    if (stationId !== selectedStation.id) {
      navigate(buildStationPath(selectedStation.id), { replace: true });
    }
  }, [navigate, selectedStation, stationId]);

  useEffect(() => {
    if (!selectedStation) {
      return;
    }

    setHistory((currentHistory) =>
      [selectedStation.id, ...currentHistory.filter((value) => value !== selectedStation.id)].slice(0, 8),
    );
  }, [selectedStation, setHistory]);

  const favoriteStations = useMemo(
    () => stations.filter((station) => favorites.includes(station.id)),
    [favorites, stations],
  );

  const recentStations = useMemo(
    () => history.map((value) => stations.find((station) => station.id === value)).filter(Boolean) as Station[],
    [history, stations],
  );

  const handleSelectStation = (station: Station) => {
    navigate(buildStationPath(station.id));
  };

  const handleToggleFavorite = (station: Station) => {
    setFavorites((currentFavorites) =>
      currentFavorites.includes(station.id)
        ? currentFavorites.filter((value) => value !== station.id)
        : [station.id, ...currentFavorites],
    );
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-grid-radial px-6 text-center text-slate-300">
        <div className="max-w-md rounded-3xl border border-hub-border bg-hub-panel/90 p-6 shadow-glow">
          <p className="text-xs uppercase tracking-[0.35em] text-hub-muted">Carregando catálogo real</p>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Buscando a lista ativa de receptores WebSDR diretamente do catálogo oficial.
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-grid-radial px-6 text-center text-slate-300">
        <div className="max-w-lg rounded-3xl border border-red-500/30 bg-hub-panel/90 p-6 shadow-glow">
          <p className="text-xs uppercase tracking-[0.35em] text-red-300">Falha ao carregar dados reais</p>
          <p className="mt-3 text-sm leading-6 text-slate-300">{error}</p>
          <p className="mt-3 text-xs text-slate-500">Rode o sincronizador local para regenerar o snapshot.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-grid-radial text-hub-text">
      <div className="mx-auto flex min-h-screen max-w-[1800px] flex-col gap-6 p-4 lg:p-6">
        <header className="rounded-[2rem] border border-hub-border bg-hub-panel/85 px-5 py-5 shadow-glow backdrop-blur">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-hub-muted">SDR Global Hub</p>
              <h1 className="mt-3 font-display text-3xl text-hub-text sm:text-4xl">
                Descoberta global de WebSDR em dados reais
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
                Painel escuro, filtros em tempo real, mapa global e visualização embutida carregando a lista ativa
                do websdr.org sem catálogo mockado.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-2xl border border-hub-border bg-black/25 px-4 py-3">
                <span className="block text-xs text-hub-muted">Estações</span>
                <strong className="mt-1 block text-lg">{filteredStations.length}</strong>
              </div>
              <div className="rounded-2xl border border-hub-border bg-black/25 px-4 py-3">
                <span className="block text-xs text-hub-muted">Favoritos</span>
                <strong className="mt-1 block text-lg">{favoriteStations.length}</strong>
              </div>
              <div className="rounded-2xl border border-hub-border bg-black/25 px-4 py-3">
                <span className="block text-xs text-hub-muted">Camada</span>
                <strong className="mt-1 block text-lg">{selectedStation ? getBandIntensity(selectedStation) : 'HF'}</strong>
              </div>
            </div>
          </div>
        </header>

        <section className="grid flex-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <FilterSidebar
            band={filters.band}
            continent={filters.continent}
            country={filters.country}
            antenna={filters.antenna}
            sort={filters.sort}
            continents={continents}
            antennaOptions={antennaOptions}
            onBandChange={(band) => setFilters((currentFilters) => ({ ...currentFilters, band: band as Filters['band'] }))}
            onContinentChange={(continent) => setFilters((currentFilters) => ({ ...currentFilters, continent }))}
            onCountryChange={(country) => setFilters((currentFilters) => ({ ...currentFilters, country }))}
            onAntennaChange={(antenna) => setFilters((currentFilters) => ({ ...currentFilters, antenna }))}
            onSortChange={(sort) => setFilters((currentFilters) => ({ ...currentFilters, sort }))}
          />

          <div className="grid min-h-0 gap-6 xl:grid-rows-[minmax(0,360px)_minmax(0,1fr)]">
            <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
              <StationMap
                stations={filteredStations}
                selectedStationId={selectedStation?.id ?? null}
                onSelectStation={handleSelectStation}
              />

              <div className="rounded-3xl border border-hub-border bg-hub-panel/90 p-4 shadow-glow">
                <p className="text-xs uppercase tracking-[0.35em] text-hub-muted">Favoritos e histórico</p>

                <div className="mt-4 space-y-5 text-sm">
                  <div>
                    <h2 className="font-display text-lg text-hub-text">Favoritos</h2>
                    <div className="mt-3 space-y-2">
                      {favoriteStations.length === 0 ? (
                        <p className="text-slate-500">Nenhuma estação salva.</p>
                      ) : (
                        favoriteStations.map((station) => (
                          <button
                            key={station.id}
                            type="button"
                            onClick={() => handleSelectStation(station)}
                            className="block w-full rounded-2xl border border-hub-border bg-white/5 px-4 py-3 text-left transition hover:border-hub-cyan/60 hover:bg-white/10"
                          >
                            <span className="block font-medium text-hub-text">{station.name}</span>
                            <span className="mt-1 block text-xs text-slate-500">{station.location}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <h2 className="font-display text-lg text-hub-text">Recentes</h2>
                    <div className="mt-3 space-y-2">
                      {recentStations.length === 0 ? (
                        <p className="text-slate-500">Nenhum histórico ainda.</p>
                      ) : (
                        recentStations.map((station) => (
                          <button
                            key={station.id}
                            type="button"
                            onClick={() => handleSelectStation(station)}
                            className="block w-full rounded-2xl border border-hub-border bg-white/5 px-4 py-3 text-left transition hover:border-hub-amber/60 hover:bg-white/10"
                          >
                            <span className="block font-medium text-hub-text">{station.name}</span>
                            <span className="mt-1 block text-xs text-slate-500">{station.continent}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <StationViewer
              station={selectedStation}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={selectedStation ? favorites.includes(selectedStation.id) : false}
            />
          </div>
        </section>
      </div>
    </main>
  );
}