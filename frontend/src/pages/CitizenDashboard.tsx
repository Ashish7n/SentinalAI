import React, { useState, useEffect } from 'react';
import { SafetyMap } from '../components/SafetyMap';
import { AIExplanationModal } from '../components/AIExplanationModal';
import { citizenAPI } from '../services/api';
import { RiskScoreBreakdown, AIDecisionExplanation, RouteOption, Incident, InfrastructureTelemetry } from '../types';
import { ShieldCheck, Sparkles, Navigation, Clock, MapPin, ArrowRightLeft, Search } from 'lucide-react';

interface CityPlace {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
}

const POPULAR_CITY_PLACES: CityPlace[] = [
  { id: 'place-1', name: 'Secunderabad Junction & Metro Station', category: 'Transit Hub', lat: 17.4399, lng: 78.4983 },
  { id: 'place-2', name: 'HITEC City Cyber Towers & IT Hub', category: 'Tech District', lat: 17.4504, lng: 78.3808 },
  { id: 'place-3', name: 'Osmania University Campus, Tarnaka', category: 'Education', lat: 17.4131, lng: 78.5284 },
  { id: 'place-4', name: 'Osmania General Hospital, Afzal Gunj', category: 'Healthcare', lat: 17.3700, lng: 78.4795 },
  { id: 'place-5', name: 'Inorbit Mall & Durgam Cheruvu, Madhapur', category: 'Shopping & Leisure', lat: 17.4375, lng: 78.3813 },
  { id: 'place-6', name: 'Charminar & Laad Bazaar Heritage Zone', category: 'Cultural Heritage', lat: 17.3616, lng: 78.4747 },
  { id: 'place-7', name: 'Jubilee Hills Road #36 Metro Corridor', category: 'Commercial Hub', lat: 17.4319, lng: 78.4072 },
  { id: 'place-8', name: 'Cyberabad Police Commissionerate, Gachibowli', category: 'Public Safety HQ', lat: 17.4401, lng: 78.3489 }
];

export const CitizenDashboard: React.FC = () => {
  // Start Origin (Point A) State - Default: Secunderabad Station
  const [selectedOriginId, setSelectedOriginId] = useState<string>('place-1');
  const [originLat, setOriginLat] = useState<number>(17.4399);
  const [originLng, setOriginLng] = useState<number>(78.4983);
  const [originName, setOriginName] = useState<string>('Secunderabad Junction & Metro Station');

  // Destination Target (Point B) State - Default: HITEC City Cyber Towers
  const [selectedDestId, setSelectedDestId] = useState<string>('place-2');
  const [destLat, setDestLat] = useState<number>(17.4504);
  const [destLng, setDestLng] = useState<number>(78.3808);
  const [destName, setDestName] = useState<string>('HITEC City Cyber Towers & IT Hub');

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [infrastructure, setInfrastructure] = useState<InfrastructureTelemetry[]>([]);
  const [safetyScore, setSafetyScore] = useState<RiskScoreBreakdown | null>(null);
  const [aiExplanation, setAiExplanation] = useState<AIDecisionExplanation | null>(null);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [routeAiText, setRouteAiText] = useState<string>('');
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [loadingScore, setLoadingScore] = useState(false);
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [infra, incList] = await Promise.all([
        citizenAPI.getInfrastructure(),
        citizenAPI.getIncidents()
      ]);
      setInfrastructure(infra);
      setIncidents(incList);
      fetchScore(originLat, originLng);
    } catch (err) {
      console.error('Failed to load initial citizen dashboard telemetry:', err);
    }
  };

  const fetchScore = async (lat: number, lng: number) => {
    setLoadingScore(true);
    try {
      const data = await citizenAPI.getSafetyScore(lat, lng);
      setSafetyScore(data.breakdown);
      setAiExplanation(data.aiExplanation);
    } catch (err) {
      console.error('Failed to fetch safety score:', err);
    } finally {
      setLoadingScore(false);
    }
  };

  const handleOriginSelect = (placeId: string) => {
    setSelectedOriginId(placeId);
    if (placeId === 'custom') return;
    const place = POPULAR_CITY_PLACES.find(p => p.id === placeId);
    if (place) {
      setOriginLat(place.lat);
      setOriginLng(place.lng);
      setOriginName(place.name);
      fetchScore(place.lat, place.lng);
    }
  };

  const handleDestSelect = (placeId: string) => {
    setSelectedDestId(placeId);
    if (placeId === 'custom') return;
    const place = POPULAR_CITY_PLACES.find(p => p.id === placeId);
    if (place) {
      setDestLat(place.lat);
      setDestLng(place.lng);
      setDestName(place.name);
    }
  };

  const handleSwapPlaces = () => {
    const tempOriginId = selectedOriginId;
    const tempLat = originLat;
    const tempLng = originLng;
    const tempName = originName;

    setSelectedOriginId(selectedDestId);
    setOriginLat(destLat);
    setOriginLng(destLng);
    setOriginName(destName);

    setSelectedDestId(tempOriginId);
    setDestLat(tempLat);
    setDestLng(tempLng);
    setDestName(tempName);

    fetchScore(destLat, destLng);
  };

  const handleCalculateRoutes = async () => {
    setLoadingRoutes(true);
    try {
      const data = await citizenAPI.getSafeRoute(originLat, originLng, destLat, destLng);
      setRoutes(data.routes);
      setRouteAiText(data.aiExplanation);
    } catch (err) {
      console.error('Failed to calculate safe routes:', err);
    } finally {
      setLoadingRoutes(false);
    }
  };

  const getScoreBadgeStyle = (score: number) => {
    if (score >= 80) return 'text-emerald-700 border-emerald-300 bg-emerald-50';
    if (score >= 60) return 'text-blue-700 border-blue-300 bg-blue-50';
    if (score >= 40) return 'text-amber-700 border-amber-300 bg-amber-50';
    return 'text-rose-700 border-rose-300 bg-rose-50';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Headline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-blue-600" />
            <span>Citizen Safe Route & City Telemetry Map</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Specify Start & Destination points across the city to compute Google Maps paths enriched by SentinelAI decision scores.
          </p>
        </div>
        <button
          onClick={() => fetchScore(originLat, originLng)}
          className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-blue-600 hover:text-white font-bold text-xs transition-all flex items-center gap-2 shadow-sm"
        >
          <Clock className="w-4 h-4" />
          <span>Refresh Origin Score</span>
        </button>
      </div>

      {/* Main Grid: Control Panel + Google Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Route Planner & Safety Score */}
        <div className="space-y-6">
          
          {/* 1. Start & End Place Selector */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-emerald-600" />
                <span>Start & Destination Planner</span>
              </h3>
              <button
                onClick={handleSwapPlaces}
                title="Swap Start and Destination"
                className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all flex items-center gap-1 text-xs font-semibold"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" /> Swap
              </button>
            </div>

            {/* Start Origin Input (Point A) */}
            <div className="space-y-1.5 text-xs">
              <label className="text-emerald-700 font-bold flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-extrabold">A</span>
                <span>Start Origin Point</span>
              </label>
              <select
                value={selectedOriginId}
                onChange={(e) => handleOriginSelect(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 font-medium cursor-pointer"
              >
                {POPULAR_CITY_PLACES.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                ))}
                <option value="custom">📍 Custom Lat / Lng Coordinates</option>
              </select>

              {selectedOriginId === 'custom' && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <input
                    type="number"
                    step="0.0001"
                    value={originLat}
                    onChange={(e) => { setOriginLat(parseFloat(e.target.value)); setOriginName(`Custom (${e.target.value})`); }}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs"
                    placeholder="Lat"
                  />
                  <input
                    type="number"
                    step="0.0001"
                    value={originLng}
                    onChange={(e) => { setOriginLng(parseFloat(e.target.value)); setOriginName(`Custom (${e.target.value})`); }}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs"
                    placeholder="Lng"
                  />
                </div>
              )}
            </div>

            {/* Destination Target Input (Point B) */}
            <div className="space-y-1.5 text-xs">
              <label className="text-rose-700 font-bold flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-extrabold">B</span>
                <span>Destination Target</span>
              </label>
              <select
                value={selectedDestId}
                onChange={(e) => handleDestSelect(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 font-medium cursor-pointer"
              >
                {POPULAR_CITY_PLACES.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                ))}
                <option value="custom">📍 Custom Lat / Lng Coordinates</option>
              </select>

              {selectedDestId === 'custom' && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <input
                    type="number"
                    step="0.0001"
                    value={destLat}
                    onChange={(e) => { setDestLat(parseFloat(e.target.value)); setDestName(`Custom (${e.target.value})`); }}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs"
                    placeholder="Lat"
                  />
                  <input
                    type="number"
                    step="0.0001"
                    value={destLng}
                    onChange={(e) => { setDestLng(parseFloat(e.target.value)); setDestName(`Custom (${e.target.value})`); }}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs"
                    placeholder="Lng"
                  />
                </div>
              )}
            </div>

            {/* Action Button */}
            <button
              onClick={handleCalculateRoutes}
              disabled={loadingRoutes}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Navigation className="w-4 h-4" />
              <span>{loadingRoutes ? 'Computing Road Path Graph...' : 'Compute Safest vs Shortest Corridor'}</span>
            </button>

            {/* Route Breakdown */}
            {routes.length > 0 && (
              <div className="space-y-3 pt-2">
                {routes.map(r => (
                  <div key={r.id} className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${r.type === 'safest' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                    <div className="flex items-center justify-between font-bold">
                      <span>{r.name}</span>
                      <span className="px-2 py-0.5 rounded bg-white text-[10px] shadow-sm font-extrabold">Safety Score: {r.safetyScore}/100</span>
                    </div>
                    <div className="text-slate-700 font-medium">Distance: {r.distanceKm} km | Est Duration: {r.estimatedMinutes} mins</div>
                    <div className="text-[11px] text-slate-600">
                      {r.riskHighlights.join(' • ')}
                    </div>
                  </div>
                ))}

                {routeAiText && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                    <strong className="text-blue-700 flex items-center gap-1 font-bold">
                      <Sparkles className="w-4 h-4" /> Gemini Route Decision Context:
                    </strong>
                    <p className="leading-relaxed text-slate-600">{routeAiText}</p>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* 2. Real-Time Safety Score Card for Start Origin */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">Origin Point (A) Safety Score</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                800m Telemetry Cell
              </span>
            </div>

            {safetyScore ? (
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900">{safetyScore.score}</span>
                    <span className="text-sm text-slate-500">/ 100</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-600 mt-1">
                    Risk Assessment: <span className="uppercase font-extrabold text-blue-700">{safetyScore.riskLevel}</span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border ${getScoreBadgeStyle(safetyScore.score)} flex flex-col items-center justify-center shadow-sm`}>
                  <ShieldCheck className="w-7 h-7" />
                </div>
              </div>
            ) : (
              <div className="h-20 animate-pulse bg-slate-100 rounded-xl"></div>
            )}

            <button
              onClick={() => setShowAuditModal(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 border border-slate-200 hover:bg-blue-600 hover:text-white text-blue-700 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Why this Score? View AI Audit Breakdown</span>
            </button>
          </div>

        </div>

        {/* Right Column: Google Maps Tile Display */}
        <div className="lg:col-span-2 h-[650px]">
          <SafetyMap
            center={[originLat, originLng]}
            origin={[originLat, originLng]}
            destination={[destLat, destLng]}
            originName={originName}
            destinationName={destName}
            incidents={incidents}
            infrastructure={infrastructure}
            routes={routes}
          />
        </div>

      </div>

      {/* AI Audit Modal */}
      <AIExplanationModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        explanation={aiExplanation}
      />

    </div>
  );
};
