import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';

// Fix standard marker icon in Leaflet webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function CollegeMap({ collegeName, address, latitude, longitude }) {
  const lat = latitude || 13.3289;
  const lng = longitude || 77.1265;
  const position = [lat, lng];

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-base">Campus Location & Geographic Map</h3>
        </div>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors border border-indigo-200"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Get Directions</span>
        </a>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed">
        <strong className="text-slate-800">Address:</strong> {address}
      </p>

      {/* Map View Canvas */}
      <div className="h-72 w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner">
        <MapContainer center={position} zoom={14} scrollWheelZoom={false} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>
              <div className="p-1">
                <p className="font-bold text-xs text-slate-900">{collegeName}</p>
                <p className="text-[11px] text-slate-600 mt-0.5">{address}</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
      
      <div className="text-[11px] text-slate-400 text-center">
        Powered by OpenStreetMap & Leaflet GIS Engine
      </div>
    </div>
  );
}
