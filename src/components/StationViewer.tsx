import type { Station } from '../types';

type StationViewerProps = {
  station: Station | null;
  onToggleFavorite: (station: Station) => void;
  isFavorite: boolean;
};

export function StationViewer({ station, onToggleFavorite, isFavorite }: StationViewerProps) {
  if (!station) {
    return (
      <section className="flex h-full min-h-[420px] items-center justify-center rounded-3xl border border-hub-border bg-hub-panel/90 p-6 text-center text-slate-400 shadow-glow">
        Selecione uma estação no mapa ou na lista para abrir o rádio embutido.
      </section>
    );
  }

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-3xl border border-hub-border bg-hub-panel/90 shadow-glow">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-hub-border px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-hub-muted">Visualização SDR</p>
          <h2 className="mt-2 font-display text-2xl text-hub-text">{station.name}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {station.location} · {station.frequencyRange} · {station.usersOnline} usuários online
          </p>
        </div>

        <button
          type="button"
          onClick={() => onToggleFavorite(station)}
          className={`rounded-2xl border px-4 py-2 text-sm transition ${
            isFavorite
              ? 'border-hub-amber bg-hub-amber/20 text-hub-text'
              : 'border-hub-border bg-white/5 text-slate-300 hover:border-hub-amber/60'
          }`}
        >
          {isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        </button>
      </div>

      <div className="grid flex-1 gap-4 p-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-3xl border border-hub-border bg-black/40">
          <iframe
            title={station.name}
            src={station.iframeUrl}
            className="h-[420px] w-full bg-black lg:h-full"
            allow="microphone; autoplay; fullscreen"
            loading="lazy"
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-3xl border border-hub-border bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.35em] text-hub-muted">Resumo técnico</p>
            <dl className="mt-4 space-y-3 text-sm text-slate-300">
              <div className="flex items-start justify-between gap-3">
                <dt className="text-slate-500">Bandas</dt>
                <dd className="text-right text-hub-text">{station.bands.join(', ')}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-slate-500">QTH</dt>
                <dd className="text-right text-hub-text">{station.qth}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-slate-500">Antena</dt>
                <dd className="text-right text-hub-text">{station.antenna}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-slate-500">Continente</dt>
                <dd className="text-right text-hub-text">{station.continent}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-slate-500">Coordenadas</dt>
                <dd className="text-right text-hub-text">
                  {station.lat.toFixed(2)}, {station.lon.toFixed(2)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-hub-border bg-gradient-to-br from-hub-cyan/10 to-hub-amber/10 p-4 text-sm text-slate-300">
            <p className="text-xs uppercase tracking-[0.35em] text-hub-muted">Observação</p>
            <p className="mt-3 leading-6">
              O iframe é carregado diretamente da estação selecionada. Se algum host bloquear incorporação,
              esta área servirá como base para um player alternativo ou view modal.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}