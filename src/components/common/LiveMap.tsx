import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { TransitHub, Courier, Shipment } from '../../types/shipment';
import { Warehouse, Truck, Layers, Navigation } from 'lucide-react';

interface LiveMapProps {
  hubs: TransitHub[];
  couriers: Courier[];
  shipments?: Shipment[];
  height?: string;
  focusCoord?: { lat: number; lng: number };
}

export const LiveMap: React.FC<LiveMapProps> = ({
  hubs,
  couriers,
  shipments = [],
  height = '420px',
  focusCoord,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'COURIERS' | 'HUBS'>('ALL');

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center roughly around East/Central Java (Malang/Surabaya corridor)
      const map = L.map(mapContainerRef.current, {
        center: [-7.6, 111.5],
        zoom: 7,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | Nusantara Cargo GIS',
        maxZoom: 18,
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = layerGroup;
      mapInstanceRef.current = map;
    }
  }, []);

  // Update markers when hubs, couriers, or filter changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();

    // 1. Plot Hubs
    if (filterType === 'ALL' || filterType === 'HUBS') {
      hubs.forEach((hub) => {
        const hubIcon = L.divIcon({
          className: 'custom-hub-icon',
          html: `
            <div style="background-color: #1e293b; color: white; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 2px solid #f97316; box-shadow: 0 4px 10px rgba(0,0,0,0.35);">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker([hub.coordinates.lat, hub.coordinates.lng], { icon: hubIcon });
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; min-width: 200px;">
            <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-bottom: 4px;">${hub.name}</div>
            <div style="color: #64748b; margin-bottom: 6px;">${hub.address}</div>
            <div style="display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 6px;">
              <span>Kapasitas Muatan:</span>
              <strong>${hub.currentLoadTon} / ${hub.capacityTon} Ton</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 2px;">
              <span>Hub Manager:</span>
              <strong>${hub.managerName}</strong>
            </div>
          </div>
        `);
        layer.addLayer(marker);
      });
    }

    // 2. Plot Couriers
    if (filterType === 'ALL' || filterType === 'COURIERS') {
      couriers.forEach((courier) => {
        const courierIcon = L.divIcon({
          className: 'custom-courier-icon',
          html: `
            <div style="background-color: #f97316; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.3);">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
                <path d="M15 18H9"/>
                <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
                <circle cx="17" cy="18" r="2"/>
                <circle cx="7" cy="18" r="2"/>
              </svg>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([courier.currentLocation.lat, courier.currentLocation.lng], {
          icon: courierIcon,
        });

        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; min-width: 190px;">
            <div style="font-weight: 800; font-size: 13px; color: #c2410c;">${courier.name}</div>
            <div style="color: #475569; font-weight: 600;">${courier.plateNumber} (${courier.vehicleType})</div>
            <div style="margin-top: 4px; color: #64748b;">Lokasi: ${courier.currentLocation.address}</div>
            <div style="margin-top: 6px; padding: 4px 8px; background: #f8fafc; border-radius: 6px; display: flex; justify-content: space-between;">
              <span>Tugas Aktif:</span>
              <span style="font-weight: bold; color: #0284c7;">${courier.activeTaskCount} Tugas</span>
            </div>
            <div style="margin-top: 4px; display: flex; justify-content: space-between; font-size: 11px;">
              <span>Rating:</span>
              <span style="color: #f59e0b; font-weight: bold;">★ ${courier.rating}</span>
            </div>
          </div>
        `);
        layer.addLayer(marker);
      });
    }

    // 3. Connect Hubs with Highway Trunk Line (Tol Trans Jawa simulator)
    if (filterType === 'ALL' || filterType === 'HUBS') {
      const highwayCoords: [number, number][] = [
        [-6.1834, 106.9423], // Jakarta
        [-6.9536, 107.6912], // Bandung
        [-6.9625, 110.4568], // Semarang
        [-7.3242, 112.7584], // Surabaya
        [-7.9528, 112.5938], // Malang
      ];

      const polyline = L.polyline(highwayCoords, {
        color: '#f97316',
        weight: 3,
        opacity: 0.6,
        dashArray: '6, 8',
      });
      layer.addLayer(polyline);
    }
  }, [hubs, couriers, filterType]);

  // Focus effect if requested
  useEffect(() => {
    if (focusCoord && mapInstanceRef.current) {
      mapInstanceRef.current.setView([focusCoord.lat, focusCoord.lng], 13);
    }
  }, [focusCoord]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      {/* Controls Bar */}
      <div className="absolute top-3 left-3 z-[400] flex items-center gap-1.5 bg-white/95 backdrop-blur px-2.5 py-1.5 rounded-xl shadow-md border border-slate-200 text-xs font-semibold">
        <Layers className="w-4 h-4 text-slate-500" />
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-2.5 py-1 rounded-lg transition ${
            filterType === 'ALL'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Semua ({couriers.length + hubs.length})
        </button>
        <button
          onClick={() => setFilterType('COURIERS')}
          className={`px-2.5 py-1 rounded-lg transition ${
            filterType === 'COURIERS'
              ? 'bg-orange-500 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Kurir ({couriers.length})
        </button>
        <button
          onClick={() => setFilterType('HUBS')}
          className={`px-2.5 py-1 rounded-lg transition ${
            filterType === 'HUBS'
              ? 'bg-slate-800 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Hub Logistik ({hubs.length})
        </button>
      </div>

      <div className="absolute bottom-3 right-3 z-[400] bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg shadow border border-slate-200 text-[11px] flex items-center gap-3 text-slate-600">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
          Kurir Aktif
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-slate-900 inline-block"></span>
          Hub Transit
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-0.5 border-b border-dashed border-orange-500 inline-block"></span>
          Koridor Darat Tol Trans Jawa
        </span>
      </div>

      {/* Map DOM */}
      <div ref={mapContainerRef} style={{ height }} className="w-full bg-slate-100 z-0" />
    </div>
  );
};
