import React, { useState, useEffect } from 'react';
import { citizenAPI } from '../services/api';
import { Incident, InfrastructureTelemetry } from '../types';
import { SafetyMap } from '../components/SafetyMap';
import { AlertTriangle, ShieldCheck, MapPin, CheckCircle2, Lock, Users, Clock, Compass, Navigation, Map as MapIcon } from 'lucide-react';

interface CityPlace {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

const HYDERABAD_LANDMARKS: CityPlace[] = [
  { id: 'place-1', name: 'Secunderabad Junction & Metro Station', lat: 17.4399, lng: 78.4983 },
  { id: 'place-2', name: 'HITEC City Cyber Towers & IT Hub', lat: 17.4504, lng: 78.3808 },
  { id: 'place-3', name: 'Osmania University Campus, Tarnaka', lat: 17.4131, lng: 78.5284 },
  { id: 'place-4', name: 'Osmania General Hospital, Afzal Gunj', lat: 17.3700, lng: 78.4795 },
  { id: 'place-5', name: 'Inorbit Mall & Durgam Cheruvu, Madhapur', lat: 17.4375, lng: 78.3813 },
  { id: 'place-6', name: 'Charminar & Laad Bazaar Heritage Zone', lat: 17.3616, lng: 78.4747 },
  { id: 'place-7', name: 'Jubilee Hills Road #36 Metro Corridor', lat: 17.4319, lng: 78.4072 },
  { id: 'place-8', name: 'Cyberabad Police Commissionerate, Gachibowli', lat: 17.4401, lng: 78.3489 },
  { id: 'place-9', name: 'Begumpet Flyover & Metro Junction', lat: 17.4360, lng: 78.4685 },
  { id: 'place-10', name: 'Kukatpally KPHB Colony Station', lat: 17.4840, lng: 78.4100 }
];

export const CrimeReportPage: React.FC = () => {
  const [categoryId, setCategoryId] = useState('THEFT');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  
  // Location States
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('place-1');
  const [locationName, setLocationName] = useState<string>('Secunderabad Junction & Metro Station');
  const [latitude, setLatitude] = useState<number>(17.4399);
  const [longitude, setLongitude] = useState<number>(78.4983);
  const [geoDetecting, setGeoDetecting] = useState<boolean>(false);

  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [piiFlagged, setPiiFlagged] = useState<boolean>(false);
  
  const [communityIncidents, setCommunityIncidents] = useState<Incident[]>([]);
  const [infrastructure, setInfrastructure] = useState<InfrastructureTelemetry[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [incList, infraList] = await Promise.all([
        citizenAPI.getIncidents(),
        citizenAPI.getInfrastructure()
      ]);
      setCommunityIncidents(incList);
      setInfrastructure(infraList);
    } catch (err) {
      console.error('Failed to load community data:', err);
    }
  };

  // 1. Live Browser GPS Location Detection
  const handleDetectLiveLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGeoDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        setLocationName(`Detected Live Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        setSelectedPlaceId('live');
        setGeoDetecting(false);
      },
      (error) => {
        console.warn('Geolocation failed, falling back to default position:', error.message);
        setLatitude(17.4399);
        setLongitude(78.4983);
        setLocationName('Secunderabad Junction (Default Live Position)');
        setGeoDetecting(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // 2. Preset Landmark Selection
  const handleLandmarkSelect = (placeId: string) => {
    setSelectedPlaceId(placeId);
    if (placeId === 'live') return;
    const place = HYDERABAD_LANDMARKS.find(p => p.id === placeId);
    if (place) {
      setLatitude(place.lat);
      setLongitude(place.lng);
      setLocationName(place.name);
    }
  };

  // 3. Map Point Pick Listener
  const handleMapLocationSelect = (clickedLat: number, clickedLng: number) => {
    setLatitude(clickedLat);
    setLongitude(clickedLng);
    setLocationName(`Selected Map Point (${clickedLat.toFixed(4)}, ${clickedLng.toFixed(4)})`);
    setSelectedPlaceId('map_selected');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    setSuccessMsg(null);
    try {
      const res = await citizenAPI.submitReport({
        categoryId,
        latitude,
        longitude,
        description: `[Location: ${locationName}] ${description}`,
        severity
      });

      setSuccessMsg(`Incident report submitted! Record ID: ${res.incident.id}`);
      setPiiFlagged(res.piiScrubbed);
      setDescription('');
      
      fetchData();
    } catch (err) {
      console.error('Failed to submit report:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Low-Friction Incident & Hazard Reporting</h1>
            <p className="text-xs text-slate-500 font-medium">Post community observations using Live GPS, Landmark Search, or Interactive Map Click.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs mt-2 font-medium">
          <Lock className="w-4 h-4 shrink-0 text-blue-600" />
          <span><strong>Strict Privacy Shield Enabled:</strong> Express backend automatically scrubs PII (names, phone numbers, email addresses) before saving records.</span>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          {piiFlagged && (
            <span className="px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300 font-bold text-[10px] text-emerald-800">
              PII Redacted by Guardrails
            </span>
          )}
        </div>
      )}

      {/* Form & Map Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Form & Location Controls */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 text-xs">
          
          {/* 1. Location Picker Controls */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-blue-200">
            <div className="flex items-center justify-between">
              <label className="text-blue-700 font-extrabold flex items-center gap-1.5 text-xs">
                <MapPin className="w-4 h-4" />
                <span>Incident Location Selection</span>
              </label>
              
              <button
                type="button"
                onClick={handleDetectLiveLocation}
                disabled={geoDetecting}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Compass className={`w-3.5 h-3.5 ${geoDetecting ? 'animate-spin' : ''}`} />
                <span>{geoDetecting ? 'Detecting GPS...' : 'Detect Live Location'}</span>
              </button>
            </div>

            <div>
              <label className="text-slate-600 font-semibold block mb-1">Select Hyderabad Landmark / Place Name</label>
              <select
                value={selectedPlaceId}
                onChange={(e) => handleLandmarkSelect(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 font-medium cursor-pointer"
              >
                {HYDERABAD_LANDMARKS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
                <option value="live">🎯 Live GPS Location</option>
                <option value="map_selected">🗺️ Selected Point on Map</option>
              </select>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] flex items-center gap-2 text-slate-700 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span><strong>Active Location:</strong> {locationName}</span>
            </div>
          </div>

          {/* Incident Category */}
          <div>
            <label className="text-slate-700 font-bold block mb-1.5">Hazard / Incident Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 font-medium cursor-pointer"
            >
              <option value="THEFT">Street Robbery / Snatch Theft</option>
              <option value="ASSAULT">Physical Conflict / Assault</option>
              <option value="LIGHTING_FAULT">Streetlamp Outage / Dark Corridor</option>
              <option value="VANDALISM">Vehicle / Property Vandalism</option>
              <option value="HARASSMENT">Suspicious Loitering / Harassment</option>
            </select>
          </div>

          {/* Severity Picker */}
          <div>
            <label className="text-slate-700 font-bold block mb-1.5">Observed Severity Weight</label>
            <div className="grid grid-cols-4 gap-2">
              {(['low', 'medium', 'high', 'critical'] as const).map((sev) => (
                <button
                  type="button"
                  key={sev}
                  onClick={() => setSeverity(sev)}
                  className={`py-2 rounded-xl uppercase font-extrabold text-[11px] transition-all border ${
                    severity === sev
                      ? sev === 'critical' ? 'bg-rose-600 text-white border-rose-600' :
                        sev === 'high' ? 'bg-amber-600 text-white border-amber-600' :
                        'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-slate-700 font-bold block mb-1.5">Description & Observations</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you observed (e.g. Unlit streetlight near metro exit; snatch theft reported)."
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 placeholder-slate-400 leading-relaxed font-medium"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !description.trim()}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs transition-all shadow-sm"
          >
            {loading ? 'Scrubbing PII & Registering Telemetry...' : 'Publish Public Incident Report'}
          </button>

        </form>

        {/* Right Column: Interactive Location Picker Map */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col">
          <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <MapIcon className="w-4 h-4 text-emerald-600" /> Click Map to Set Location Pin
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Click anywhere on the map</span>
          </div>

          <div className="flex-1 min-h-[380px] rounded-xl overflow-hidden border border-slate-200">
            <SafetyMap
              center={[latitude, longitude]}
              origin={[latitude, longitude]}
              originName={locationName}
              incidents={communityIncidents}
              infrastructure={infrastructure}
              onLocationSelect={handleMapLocationSelect}
            />
          </div>
        </div>

      </div>

      {/* Live Community Feed Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Live Community Reported Issues Feed</span>
          </h3>
          <span className="text-xs text-slate-500 font-semibold">{communityIncidents.length} Telemetry Reports</span>
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {communityIncidents.map((inc) => (
            <div key={inc.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{inc.categoryName}</span>
                  <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded ${
                    inc.severity === 'critical' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                    inc.severity === 'high' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                    'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}>
                    {inc.severity}
                  </span>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 font-bold uppercase shadow-sm">
                  Status: {inc.status}
                </span>
              </div>

              <p className="text-slate-700 text-xs leading-relaxed font-medium">{inc.description}</p>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3 h-3 text-blue-600" /> GPS: {inc.latitude.toFixed(4)}, {inc.longitude.toFixed(4)}
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3 h-3 text-slate-400" /> Posted: {new Date(inc.occurredAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
