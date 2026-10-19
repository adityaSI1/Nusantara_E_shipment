import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Check, X, Search } from 'lucide-react';

interface PinpointMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialLat?: number;
  initialLng?: number;
  onConfirm: (location: { lat: number; lng: number; address: string; city: string }) => void;
}

const PRESET_LOCATIONS = [
  { name: 'Sentra Bisnis Ijen & Dinoyo, Malang', city: 'Malang', lat: -7.9528, lng: 112.5938 },
  { name: 'Sentra Dinoyo MT Haryono, Malang', city: 'Malang', lat: -7.9482, lng: 112.6120 },
  { name: 'Alun-Alun Tugu, Kota Malang', city: 'Malang', lat: -7.9772, lng: 112.6341 },
  { name: 'Rungkut Industri, Surabaya', city: 'Surabaya', lat: -7.3242, lng: 112.7584 },
  { name: 'Mayjend Sungkono, Surabaya Barat', city: 'Surabaya', lat: -7.2915, lng: 112.7180 },
  { name: 'Cakung Logistics Park, Jakarta Timur', city: 'Jakarta', lat: -6.1834, lng: 106.9423 },
  { name: 'Kaligawe Raya, Semarang', city: 'Semarang', lat: -6.9625, lng: 110.4568 },
  { name: 'Gedebage Dryport, Bandung', city: 'Bandung', lat: -6.9536, lng: 107.6912 },
];

export const PinpointMapModal: React.FC<PinpointMapModalProps> = ({
  isOpen,
  onClose,
  title,
  initialLat = -7.9528,
  initialLng = 112.5938,
  onConfirm,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [currentCoord, setCurrentCoord] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });
  const [selectedCity, setSelectedCity] = useState<string>('Malang');
  const [addressInput, setAddressInput] = useState<string>('Sentra Bisnis Ijen No. 12, Klojen, Malang');

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        const customIcon = L.divIcon({
          className: 'custom-pinpoint-icon',
          html: `
            <div style="background-color: #f97316; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
              <div style="width: 10px; height: 10px; background: white; border-radius: 50%;"></div>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
        });

        const marker = L.marker([initialLat, initialLng], {
          icon: customIcon,
          draggable: true,
        }).addTo(map);

        marker.on('dragend', (e) => {
          const latlng = e.target.getLatLng();
          setCurrentCoord({ lat: latlng.lat, lng: latlng.lng });
          setAddressInput(`Koordinat: [${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}]`);
        });

        map.on('click', (e) => {
          marker.setLatLng(e.latlng);
          setCurrentCoord({ lat: e.latlng.lat, lng: e.latlng.lng });
          setAddressInput(`Koordinat: [${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}]`);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
      } else {
        mapInstanceRef.current.invalidateSize();
        mapInstanceRef.current.setView([initialLat, initialLng], 14);
        if (markerRef.current) {
          markerRef.current.setLatLng([initialLat, initialLng]);
        }
      }
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen, initialLat, initialLng]);

  const handleSelectPreset = (preset: (typeof PRESET_LOCATIONS)[0]) => {
    setCurrentCoord({ lat: preset.lat, lng: preset.lng });
    setSelectedCity(preset.city);
    setAddressInput(preset.name);

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([preset.lat, preset.lng], 15);
      markerRef.current.setLatLng([preset.lat, preset.lng]);
    }
  };

  const handleConfirm = () => {
    onConfirm({
      lat: currentCoord.lat,
      lng: currentCoord.lng,
      address: addressInput,
      city: selectedCity,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-500 rounded-lg text-white">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{title}</h3>
              <p className="text-xs text-slate-300">
                Pilih titik lokasi akurat untuk penjemputan/pengantaran ekspedisi darat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
          <span className="text-slate-500 font-medium shrink-0 flex items-center gap-1">
            <Search className="w-3.5 h-3.5" /> Titik Populer:
          </span>
          {PRESET_LOCATIONS.map((loc, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(loc)}
              className="px-2.5 py-1 bg-white hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 border border-slate-200 rounded-full shrink-0 transition"
            >
              {loc.name}
            </button>
          ))}
        </div>

        {/* Leaflet Map Canvas */}
        <div className="relative flex-1 min-h-[340px] bg-slate-100">
          <div ref={mapContainerRef} className="absolute inset-0 z-0 w-full h-full" />
          <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg shadow border border-slate-200 text-xs font-mono text-slate-700">
            Lat: {currentCoord.lat.toFixed(4)}, Lng: {currentCoord.lng.toFixed(4)}
          </div>
        </div>

        {/* Footer & Confirm */}
        <div className="p-4 sm:px-6 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:flex-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Alamat Terpilih
            </label>
            <input
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Contoh: Jl. Raya Ijen No. 45, Malang"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-sm font-semibold transition"
            >
              Batal
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition"
            >
              <Check className="w-4 h-4" /> Gunakan Titik Ini
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
