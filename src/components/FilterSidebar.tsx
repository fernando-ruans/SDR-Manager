import type { Continent } from '../types';
import { BAND_OPTIONS } from '../lib/catalog';

type FilterSidebarProps = {
  band: string;
  continent: 'all' | Continent;
  country: string;
  antenna: string;
  sort: 'popular' | 'quiet' | 'alphabetical';
  continents: Continent[];
  antennaOptions: string[];
  onBandChange: (band: string) => void;
  onContinentChange: (continent: 'all' | Continent) => void;
  onCountryChange: (country: string) => void;
  onAntennaChange: (antenna: string) => void;
  onSortChange: (sort: 'popular' | 'quiet' | 'alphabetical') => void;
};

export function FilterSidebar({
  band,
  continent,
  country,
  antenna,
  sort,
  continents,
  antennaOptions,
  onBandChange,
  onContinentChange,
  onCountryChange,
  onAntennaChange,
  onSortChange,
}: FilterSidebarProps) {
  return (
    <aside className="flex h-full flex-col gap-5 rounded-3xl border border-hub-border bg-hub-panel/90 p-4 shadow-glow backdrop-blur xl:p-5">
      <section className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-hub-muted">Descoberta rápida</p>
          <h2 className="mt-2 font-display text-xl text-hub-text">Filtros ativos</h2>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-2">
          {BAND_OPTIONS.map((option) => {
            const active = band === option.value;

            return (
              <button
                key={`band-${option.value}`}
                type="button"
                onClick={() => onBandChange(option.value)}
                className={`rounded-2xl border px-3 py-2 text-sm transition ${
                  active
                    ? 'border-hub-cyan bg-hub-cyan/15 text-hub-text shadow-[0_0_24px_rgba(34,211,238,0.15)]'
                    : 'border-hub-border bg-white/5 text-slate-300 hover:border-hub-cyan/60 hover:bg-white/10'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <label className="block text-sm text-slate-300">
          País
          <input
            value={country}
            onChange={(event) => onCountryChange(event.target.value)}
            placeholder="Buscar país"
            className="mt-2 w-full rounded-2xl border border-hub-border bg-black/30 px-4 py-3 text-hub-text outline-none transition placeholder:text-slate-500 focus:border-hub-cyan"
          />
        </label>

        <label className="block text-sm text-slate-300">
          Antena
          <select
            value={antenna}
            onChange={(event) => onAntennaChange(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-hub-border bg-black/30 px-4 py-3 text-hub-text outline-none transition focus:border-hub-cyan"
          >
            <option value="">Todas</option>
            {antennaOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm text-slate-300">
          Continente
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onContinentChange('all')}
              className={`rounded-2xl border px-3 py-2 text-sm transition ${
                continent === 'all'
                  ? 'border-hub-amber bg-hub-amber/15 text-hub-text'
                  : 'border-hub-border bg-white/5 text-slate-300 hover:border-hub-amber/60'
              }`}
            >
              Todos
            </button>
            {continents.map((value) => (
              <button
                key={`continent-${value}`}
                type="button"
                onClick={() => onContinentChange(value)}
                className={`rounded-2xl border px-3 py-2 text-sm transition ${
                  continent === value
                    ? 'border-hub-amber bg-hub-amber/15 text-hub-text'
                    : 'border-hub-border bg-white/5 text-slate-300 hover:border-hub-amber/60'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </label>

        <label className="block text-sm text-slate-300">
          Ordenar
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as 'popular' | 'quiet' | 'alphabetical')}
            className="mt-2 w-full rounded-2xl border border-hub-border bg-black/30 px-4 py-3 text-hub-text outline-none transition focus:border-hub-cyan"
          >
            <option value="popular">Mais populares</option>
            <option value="quiet">Mais vazios</option>
            <option value="alphabetical">Alfabético</option>
          </select>
        </label>
      </section>

      <section className="rounded-3xl border border-hub-border bg-black/20 p-4">
        <p className="text-xs uppercase tracking-[0.35em] text-hub-muted">Leituras rápidas</p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-300">
          <div className="rounded-2xl bg-white/5 p-3">
            <span className="block text-xs text-hub-muted">Filtro HF</span>
            <span className="mt-1 block text-lg font-semibold text-hub-text">Ativo</span>
          </div>
          <div className="rounded-2xl bg-white/5 p-3">
            <span className="block text-xs text-hub-muted">Mapa</span>
            <span className="mt-1 block text-lg font-semibold text-hub-text">Global</span>
          </div>
        </div>
      </section>
    </aside>
  );
}