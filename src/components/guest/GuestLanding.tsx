import React, { useState } from 'react';
import { useShipment } from '../../context/ShipmentContext';
import { TariffCalculation, Shipment } from '../../types/shipment';
import {
  Calculator,
  Search,
  Truck,
  ArrowRight,
  Shield,
  Clock,
  Package,
  MapPin,
  CheckCircle2,
  Sparkles,
  Zap,
  Boxes,
  HelpCircle,
  FileText,
  BarChart3,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { PinpointMapModal } from '../common/PinpointMapModal';

interface GuestLandingProps {
  onOrderNow: (prefill: {
    originCity: string;
    destCity: string;
    weightKg: number;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
    selectedService: TariffCalculation;
  }) => void;
  onOpenDemoFlow: () => void;
}

const INDONESIA_CITIES = [
  { city: 'Malang', address: 'Sentra Logistik Dinoyo & Karanglo, Malang', lat: -7.9528, lng: 112.5938 },
  { city: 'Surabaya', address: 'Sentra Bisnis Mayjend Sungkono, Surabaya', lat: -7.2575, lng: 112.7521 },
  { city: 'Semarang', address: 'Kawasan Kaligawe Raya, Semarang', lat: -6.9625, lng: 110.4568 },
  { city: 'Jakarta', address: 'Cakung Logistics Hub, Jakarta Timur', lat: -6.1834, lng: 106.9423 },
  { city: 'Bandung', address: 'Dryport Gedebage, Bandung', lat: -6.9536, lng: 107.6912 },
  { city: 'Yogyakarta', address: 'Ring Road Selatan, Yogyakarta', lat: -7.7956, lng: 110.3695 },
  { city: 'Solo', address: 'Kawasan Gilingan, Solo', lat: -7.5562, lng: 110.8317 },
  { city: 'Denpasar', address: 'Bypass Ngurah Rai, Denpasar Bali', lat: -8.6705, lng: 115.2126 },
];

export const GuestLanding: React.FC<GuestLandingProps> = ({ onOrderNow, onOpenDemoFlow }) => {
  const { calculateTariff, shipments } = useShipment();

  // Widget Tab: 'CEK_TARIF' | 'LACAK_RESI'
  const [activeWidgetTab, setActiveWidgetTab] = useState<'CEK_TARIF' | 'LACAK_RESI'>('CEK_TARIF');

  // Cek Tarif State
  const [originCity, setOriginCity] = useState('Malang');
  const [destCity, setDestCity] = useState('Surabaya');
  const [weightKg, setWeightKg] = useState<number>(5);
  const [lengthCm, setLengthCm] = useState<number>(35);
  const [widthCm, setWidthCm] = useState<number>(25);
  const [heightCm, setHeightCm] = useState<number>(20);
  const [isInsured, setIsInsured] = useState<boolean>(true);
  const [declaredValue, setDeclaredValue] = useState<number>(2500000);
  const [tariffResults, setTariffResults] = useState<TariffCalculation[] | null>(() => {
    return calculateTariff('Malang', 'Surabaya', -7.9528, 112.5938, -7.2575, 112.7521, 5, 35, 25, 20, 2500000, true);
  });

  // Lacak Resi State
  const [inputResi, setInputResi] = useState('NC-202610-84920');
  const [trackedShipment, setTrackedShipment] = useState<Shipment | null>(() => {
    return shipments.find((s) => s.resiNumber === 'NC-202610-84920') || shipments[0] || null;
  });
  const [trackingError, setTrackingError] = useState<string | null>(null);

  // Pinpoint Modals
  const [mapPickerTarget, setMapPickerTarget] = useState<'ORIGIN' | 'DEST' | null>(null);

  const handleCalculate = () => {
    const orig = INDONESIA_CITIES.find((c) => c.city.toLowerCase() === originCity.toLowerCase()) || {
      city: originCity,
      lat: -7.9528,
      lng: 112.5938,
    };
    const dest = INDONESIA_CITIES.find((c) => c.city.toLowerCase() === destCity.toLowerCase()) || {
      city: destCity,
      lat: -7.2575,
      lng: 112.7521,
    };

    const results = calculateTariff(
      orig.city,
      dest.city,
      orig.lat,
      orig.lng,
      dest.lat,
      dest.lng,
      weightKg,
      lengthCm,
      widthCm,
      heightCm,
      declaredValue,
      isInsured
    );
    setTariffResults(results);
  };

  const handleTrack = (resiToFind?: string) => {
    const resi = (resiToFind || inputResi).trim().toUpperCase();
    if (!resi) {
      setTrackingError('Silakan masukkan nomor resi yang valid.');
      return;
    }
    const found = shipments.find((s) => s.resiNumber.toUpperCase() === resi);
    if (found) {
      setTrackedShipment(found);
      setTrackingError(null);
    } else {
      setTrackedShipment(null);
      setTrackingError(`Nomor resi "${resi}" tidak ditemukan dalam sistem.`);
    }
  };

  return (
    <div className="space-y-12 pb-16 animate-fade-in">
      {/* Hero Section Modeled After eshipment.org */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 border border-slate-200/80 rounded-3xl p-8 sm:p-14 shadow-sm">
        {/* Subtle Decorative Speed Lines (matching eshipment.org) */}
        <div className="absolute -bottom-8 -left-8 w-96 h-28 border-b-8 border-t-8 border-emerald-500/20 rounded-full rotate-6 pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-96 h-28 border-b-8 border-emerald-600/10 rounded-full rotate-6 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>e-shipment Cloud Logistics Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              From scattered files to{' '}
              <span className="text-emerald-700 underline decoration-emerald-400 decoration-4 underline-offset-4">
                one connected
              </span>{' '}
              shipping system.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Cloud software for freight, clearance, and land trade—operations and finance in one place
              with automated dispatch, live rate calculators, and secure OTP verification.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  const element = document.getElementById('rate-calculator-card');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-emerald-700/20 transition"
              >
                <span>Cek Tarif & Lacak Resi</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenDemoFlow}
                className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-xs transition"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Simulasi Alur Otomatis</span>
              </button>
            </div>
          </div>

          {/* Right Hero Graphic: Modeled after eshipment.org floating UI preview */}
          <div className="lg:col-span-5 relative">
            <div className="bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-800 text-white space-y-4 transform lg:rotate-1 hover:rotate-0 transition duration-300">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  e-shipment.org Live Console
                </span>
              </div>

              {/* Stat Cards Row */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-semibold">Truk In-Transit Tol</span>
                  <span className="text-xl font-black text-emerald-400">12 Armada</span>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-semibold">SLA Delivery Rate</span>
                  <span className="text-xl font-black text-white">99.2%</span>
                </div>
              </div>

              {/* Progress Bar & Status */}
              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700 space-y-2 text-xs">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-300">#NC-202610-84920</span>
                  <span className="text-emerald-400 font-bold">OUT_FOR_DELIVERY</span>
                </div>
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-4/5 rounded-full" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Malang &rarr; Surabaya</span>
                  <span>OTP: 749201</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Unified Interactive Card Widget */}
      <section id="rate-calculator-card" className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Widget Top Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-3">
          <button
            onClick={() => setActiveWidgetTab('CEK_TARIF')}
            className={`flex items-center gap-2 pb-3.5 px-4 font-bold text-xs transition border-b-2 -mb-[2px] ${
              activeWidgetTab === 'CEK_TARIF'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calculator className="w-4 h-4 text-emerald-600" /> Cek Tarif Ekspedisi Darat
          </button>

          <button
            onClick={() => setActiveWidgetTab('LACAK_RESI')}
            className={`flex items-center gap-2 pb-3.5 px-4 font-bold text-xs transition border-b-2 -mb-[2px] ${
              activeWidgetTab === 'LACAK_RESI'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Search className="w-4 h-4 text-emerald-600" /> Lacak Resi Publik
          </button>
        </div>

        {/* TAB 1: CEK TARIF */}
        {activeWidgetTab === 'CEK_TARIF' && (
          <div className="p-6 sm:p-8 space-y-6">
            {/* Input Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Origin */}
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Kota Asal Pengirim
                  </span>
                  <button
                    type="button"
                    onClick={() => setMapPickerTarget('ORIGIN')}
                    className="text-emerald-700 hover:underline text-[11px] font-semibold"
                  >
                    Peta
                  </button>
                </label>
                <select
                  value={originCity}
                  onChange={(e) => setOriginCity(e.target.value)}
                  className="w-full text-xs font-bold px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {INDONESIA_CITIES.map((c) => (
                    <option key={c.city} value={c.city}>
                      {c.city} - {c.address}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination */}
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Kota Tujuan Penerima
                  </span>
                  <button
                    type="button"
                    onClick={() => setMapPickerTarget('DEST')}
                    className="text-emerald-700 hover:underline text-[11px] font-semibold"
                  >
                    Peta
                  </button>
                </label>
                <select
                  value={destCity}
                  onChange={(e) => setDestCity(e.target.value)}
                  className="w-full text-xs font-bold px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {INDONESIA_CITIES.map((c) => (
                    <option key={c.city} value={c.city}>
                      {c.city} - {c.address}
                    </option>
                  ))}
                </select>
              </div>

              {/* Weight */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Berat Aktual (Kg)
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 1)}
                  className="w-full text-xs font-bold px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Dimensi */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Dimensi P × L × T (cm)
                </label>
                <div className="grid grid-cols-3 gap-1">
                  <input
                    type="number"
                    value={lengthCm}
                    onChange={(e) => setLengthCm(parseInt(e.target.value) || 10)}
                    className="w-full text-center text-xs font-bold px-1.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                    placeholder="P"
                  />
                  <input
                    type="number"
                    value={widthCm}
                    onChange={(e) => setWidthCm(parseInt(e.target.value) || 10)}
                    className="w-full text-center text-xs font-bold px-1.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                    placeholder="L"
                  />
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(parseInt(e.target.value) || 10)}
                    className="w-full text-center text-xs font-bold px-1.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                    placeholder="T"
                  />
                </div>
              </div>
            </div>

            {/* Volumetric Info & Insurance Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div className="flex items-center gap-2 text-slate-600 font-mono text-[11px]">
                <Package className="w-4 h-4 text-slate-400" />
                <span>
                  Hitungan Volumetrik Darat: ({lengthCm}×{widthCm}×{heightCm})/5000 ={' '}
                  <strong className="text-slate-900">
                    {((lengthCm * widthCm * heightCm) / 5000).toFixed(2)} Kg
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={isInsured}
                    onChange={(e) => setIsInsured(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Asuransi Ekspedisi (0.2%)</span>
                </label>
                <button
                  type="button"
                  onClick={handleCalculate}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                >
                  <Calculator className="w-3.5 h-3.5" /> [Hitung Tarif]
                </button>
              </div>
            </div>

            {/* Results Cards: Express, Reguler, Cargo Darat */}
            {tariffResults && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                    Pilihan Layanan Ekspedisi Darat ({originCity} &rarr; {destCity})
                  </h3>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Jarak: {tariffResults[0].distanceKm} Km via Tol
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {tariffResults.map((service) => {
                    const isExp = service.serviceType === 'EXPRESS';
                    const isCargo = service.serviceType === 'CARGO_DARAT';

                    return (
                      <div
                        key={service.serviceType}
                        className={`rounded-2xl p-5 border-2 flex flex-col justify-between transition-all hover:shadow-md ${
                          isExp
                            ? 'border-emerald-500 bg-gradient-to-b from-emerald-50/40 to-white'
                            : isCargo
                            ? 'border-blue-300 bg-gradient-to-b from-blue-50/30 to-white'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                isExp
                                  ? 'bg-emerald-700 text-white'
                                  : isCargo
                                  ? 'bg-blue-700 text-white'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {isExp ? 'Express Darat' : isCargo ? 'Heavy Cargo' : 'Reguler'}
                            </span>
                            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> {service.estimatedDuration}
                            </span>
                          </div>

                          <h4 className="font-black text-base text-slate-900">
                            {service.serviceName}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {service.description}
                          </p>

                          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs">
                            <div className="flex justify-between text-slate-500">
                              <span>Tarif Dasar & Berat:</span>
                              <span>Rp {(service.baseRate + service.weightCost).toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                              <span>Jarak Tempuh ({service.distanceKm} km):</span>
                              <span>Rp {service.distanceCost.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="pt-2 flex justify-between font-black text-base text-emerald-700 border-t border-slate-100">
                              <span>Total Ongkir:</span>
                              <span>Rp {service.totalCost.toLocaleString('id-ID')}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            onOrderNow({
                              originCity,
                              destCity,
                              weightKg,
                              lengthCm,
                              widthCm,
                              heightCm,
                              selectedService: service,
                            })
                          }
                          className="mt-5 w-full py-2.5 bg-slate-900 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
                        >
                          [Pesan Pengiriman] <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LACAK RESI */}
        {activeWidgetTab === 'LACAK_RESI' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputResi}
                  onChange={(e) => setInputResi(e.target.value)}
                  placeholder="Masukkan Nomor Resi (misal: NC-202610-84920)"
                  className="flex-1 font-mono font-bold text-xs uppercase px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 tracking-wider"
                />
                <button
                  onClick={() => handleTrack()}
                  className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-xs"
                >
                  <Search className="w-4 h-4" /> [Lacak]
                </button>
              </div>

              {/* Sample Quick Resi Links */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold">Resi Pengiriman Aktif:</span>
                {['NC-202610-84920', 'NC-202610-19284', 'NC-202610-55112'].map((resi) => (
                  <button
                    key={resi}
                    onClick={() => {
                      setInputResi(resi);
                      handleTrack(resi);
                    }}
                    className="font-mono text-emerald-700 hover:underline bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                  >
                    {resi}
                  </button>
                ))}
              </div>

              {trackingError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {trackingError}
                </div>
              )}
            </div>

            {/* Vertical Stepper Timeline Display */}
            {trackedShipment && (
              <div className="max-w-3xl mx-auto bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      NOMOR RESI DARAT
                    </span>
                    <span className="font-mono font-black text-base text-slate-900">
                      {trackedShipment.resiNumber}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        trackedShipment.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : trackedShipment.status === 'OUT_FOR_DELIVERY'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {trackedShipment.status.replace(/_/g, ' ')}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {trackedShipment.sender.city} &rarr; {trackedShipment.receiver.city}
                    </div>
                  </div>
                </div>

                {/* Timeline Stepper */}
                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-300">
                  {trackedShipment.trackingTimeline.map((step, idx) => {
                    const isLatest = idx === trackedShipment.trackingTimeline.length - 1;

                    return (
                      <div key={idx} className="relative">
                        <div
                          className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                            isLatest ? 'bg-emerald-600 ring-4 ring-emerald-100' : 'bg-slate-700'
                          }`}
                        >
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        </div>

                        <div className="text-xs space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{step.title}</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {step.timestamp}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            {step.description}
                          </p>
                          <div className="text-[10px] text-slate-400 pt-0.5">
                            Lokasi: {step.locationName} • Oleh: {step.actorName}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Pinpoint Modal */}
      <PinpointMapModal
        isOpen={mapPickerTarget !== null}
        onClose={() => setMapPickerTarget(null)}
        title={
          mapPickerTarget === 'ORIGIN'
            ? 'Pilih Titik Lokasi Asal Pengirim'
            : 'Pilih Titik Lokasi Tujuan Penerima'
        }
        onConfirm={(loc) => {
          if (mapPickerTarget === 'ORIGIN') {
            setOriginCity(loc.city);
          } else {
            setDestCity(loc.city);
          }
        }}
      />
    </div>
  );
};
