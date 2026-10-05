import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Incident, InfrastructureTelemetry, RouteOption } from '../types';
import { Layers, MapPin, Navigation } from 'lucide-react';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom colored SVG markers
const createCustomIcon = (color: string, label?: string) => {
  if (label) {
    return L.divIcon({
      className: 'custom-pin-icon',
      html: `<div style="background-color: ${color}; color: white; width: 26px; height: 26px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 12px ${color}; display: flex; items-center; justify-content: center; font-weight: 800; font-size: 12px; font-family: sans-serif;">${label}</div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });
  }
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

interface SafetyMapProps {
  center: [number, number];
  origin?: [number, number];
  destination?: [number, number];
  originName?: string;
  destinationName?: string;
  incidents: Incident[];
  infrastructure: InfrastructureTelemetry[];
  routes?: RouteOption[];
  onLocationSelect?: (lat: number, lng: number) => void;
  pickMode?: 'origin' | 'destination' | null;
}

function MapEventsHandler({ onLocationSelect }: { onLocationSelect?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e: any) {
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
}

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
}

export const SafetyMap: React.FC<SafetyMapProps> = ({
  center,
  origin,
  destination,
  originName = 'Start Origin (A)',
  destinationName = 'Target Destination (B)',
  incidents,
  infrastructure,
  routes = [],
  onLocationSelect,
  pickMode = null
}) => {
  const [mapTileStyle, setMapTileStyle] = useState<'google_map' | 'google_satellite' | 'sentinel_dark'>('google_map');

  const tileUrls = {
    google_map: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    google_satellite: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    sentinel_dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
  };

  const startCoords = origin || center;
  const endCoords = destination || (routes.length > 0 ? routes[0].coordinates[routes[0].coordinates.length - 1] : undefined);

  return (
    <div className="w-full h-full min-h-[500px] rounded-2xl overflow-hidden border border-gray-800 relative z-0 shadow-2xl">
      
      {/* Pick Mode Overlay Banner */}
      {pickMode && (
        <div className={`absolute top-4 left-4 z-[400] px-4 py-2.5 rounded-xl border shadow-lg text-xs font-bold flex items-center gap-2 animate-pulse ${
          pickMode === 'origin' ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-rose-600 border-rose-400 text-white'
        }`}>
          <MapPin className="w-4 h-4" />
          <span>Click anywhere on the map to set {pickMode === 'origin' ? 'Start Origin (Point A)' : 'Destination Target (Point B)'}</span>
        </div>
      )}

      {/* Google Maps Layer Switcher Control */}
      <div className="absolute top-4 right-4 z-[400] glass-card p-1.5 rounded-xl border border-gray-700/80 flex items-center gap-1 text-xs">
        <Layers className="w-4 h-4 text-blue-400 ml-1.5" />
        <button
          onClick={() => setMapTileStyle('google_map')}
          className={`px-2.5 py-1 rounded-lg transition-all font-semibold ${mapTileStyle === 'google_map' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
        >
          Google Map
        </button>
        <button
          onClick={() => setMapTileStyle('google_satellite')}
          className={`px-2.5 py-1 rounded-lg transition-all font-semibold ${mapTileStyle === 'google_satellite' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
        >
          Satellite
        </button>
        <button
          onClick={() => setMapTileStyle('sentinel_dark')}
          className={`px-2.5 py-1 rounded-lg transition-all font-semibold ${mapTileStyle === 'sentinel_dark' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
        >
          Dark Mode
        </button>
      </div>

      <MapContainer
        center={startCoords}
        zoom={15}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <MapRecenter center={startCoords} />
        <MapEventsHandler onLocationSelect={onLocationSelect} />
        
        {/* Dynamic Tile Layer (Google Maps vs Satellite vs Sentinel Dark) */}
        <TileLayer
          attribution='&copy; Google Maps Telemetry &copy; OpenStreetMap'
          url={tileUrls[mapTileStyle]}
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
        />

        {/* Start Pin (A) */}
        {startCoords && (
          <Marker position={startCoords} icon={createCustomIcon('#10B981', 'A')}>
            <Popup>
              <div className="text-xs space-y-1">
                <strong className="text-emerald-400 flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5" /> Start Origin Point (A)
                </strong>
                <p className="font-semibold text-gray-200">{originName}</p>
                <p className="text-gray-400 text-[10px]">GPS: {startCoords[0].toFixed(4)}, {startCoords[1].toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* End Pin (B) */}
        {endCoords && (
          <Marker position={endCoords} icon={createCustomIcon('#EF4444', 'B')}>
            <Popup>
              <div className="text-xs space-y-1">
                <strong className="text-rose-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Destination Target (B)
                </strong>
                <p className="font-semibold text-gray-200">{destinationName}</p>
                <p className="text-gray-400 text-[10px]">GPS: {endCoords[0].toFixed(4)}, {endCoords[1].toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        )}

        <Circle center={startCoords} radius={300} pathOptions={{ color: '#10B981', fillColor: '#10B981', fillOpacity: 0.08 }} />

        {/* Render Incident Markers */}
        {incidents.map((inc) => {
          let color = '#F59E0B';
          if (inc.severity === 'critical' || inc.severity === 'high') color = '#F43F5E';
          if (inc.severity === 'low') color = '#10B981';

          return (
            <Marker key={inc.id} position={[inc.latitude, inc.longitude]} icon={createCustomIcon(color)}>
              <Popup>
                <div className="text-xs space-y-1">
                  <div className="font-bold text-gray-100 flex items-center justify-between gap-2">
                    <span>{inc.categoryName}</span>
                    <span className="uppercase text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">{inc.severity}</span>
                  </div>
                  <p className="text-gray-300">{inc.description}</p>
                  <p className="text-gray-400 text-[10px]">Status: {inc.status}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Render Infrastructure Markers */}
        {infrastructure.map((inf) => {
          let color = '#06B6D4';
          if (inf.telemetryType === 'police_station') color = '#3B82F6';
          if (inf.telemetryType === 'hospital') color = '#10B981';
          if (inf.telemetryType === 'streetlight' && inf.statusScore < 0.5) color = '#EF4444';

          return (
            <Marker key={inf.id} position={[inf.latitude, inf.longitude]} icon={createCustomIcon(color)}>
              <Popup>
                <div className="text-xs space-y-1">
                  <strong className="text-cyan-400 uppercase text-[10px]">{inf.telemetryType}</strong>
                  <p className="font-semibold">{inf.name}</p>
                  <p className="text-gray-400 text-[10px]">Status Rating: {(inf.statusScore * 100).toFixed(0)}%</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Render Route Polylines */}
        {routes.map((route) => {
          const isSafest = route.type === 'safest';
          const color = isSafest ? '#10B981' : '#F59E0B';
          const dashArray = isSafest ? undefined : '8, 8';

          return (
            <Polyline
              key={route.id}
              positions={route.coordinates}
              pathOptions={{ color, weight: isSafest ? 6 : 4, dashArray, opacity: 0.9 }}
            >
              <Popup>
                <div className="text-xs space-y-1">
                  <strong className={isSafest ? 'text-emerald-400' : 'text-amber-400'}>{route.name}</strong>
                  <p>Distance: {route.distanceKm} km | Duration: {route.estimatedMinutes} mins</p>
                  <p>Safety Score: <strong>{route.safetyScore}/100</strong></p>
                </div>
              </Popup>
            </Polyline>
          );
        })}

      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[400] glass-card p-3 rounded-xl border border-gray-800 text-[11px] space-y-1.5 pointer-events-auto">
        <div className="font-semibold text-gray-300 text-xs mb-1">Map Telemetry Layer</div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] font-bold text-white">A</span>
          <span>Start Origin (Point A)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 flex items-center justify-center text-[8px] font-bold text-white">B</span>
          <span>Target Destination (Point B)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-sm"></span>
          <span>High Risk Incident</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block shadow-sm"></span>
          <span>Police Hub / Station</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm"></span>
          <span>Recommended Safe Corridor</span>
        </div>
      </div>
    </div>
  );
};
