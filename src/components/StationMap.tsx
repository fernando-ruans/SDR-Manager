import { useMemo } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import type { Station } from '../types';

type StationMapProps = {
  stations: Station[];
  selectedStationId: string | null;
  onSelectStation: (station: Station) => void;
};

export function StationMap({ stations, selectedStationId, onSelectStation }: StationMapProps) {
  const center = useMemo<[number, number]>(() => {
    if (stations.length === 0) {
      return [20, 0];
    }

    return [stations[0].lat, stations[0].lon];
  }, [stations]);

  return (
    <div className="h-[420px] overflow-hidden rounded-3xl border border-hub-border bg-black/30 shadow-glow lg:h-full">
      <MapContainer center={center} zoom={2} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {stations.map((station) => {
          const selected = station.id === selectedStationId;

          return (
            <CircleMarker
              key={`station-${station.id}`}
              center={[station.lat, station.lon]}
              radius={selected ? 10 : 7}
              pathOptions={{
                color: selected ? '#22d3ee' : '#2dd4bf',
                fillColor: selected ? '#22d3ee' : '#2dd4bf',
                fillOpacity: 0.9,
                weight: 1.2,
              }}
              eventHandlers={{
                click: () => onSelectStation(station),
              }}
            >
              <Popup>
                <div className="space-y-3 text-slate-900">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{station.country}</p>
                    <h3 className="font-semibold">{station.name}</h3>
                  </div>
                  <p className="text-sm text-slate-700">{station.location}</p>
                  <p className="text-sm text-slate-700">{station.frequencyRange}</p>
                  <p className="text-sm text-slate-700">{station.usersOnline} users online</p>
                  <button
                    type="button"
                    onClick={() => onSelectStation(station)}
                    className="w-full rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                  >
                    Sintonizar agora
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}