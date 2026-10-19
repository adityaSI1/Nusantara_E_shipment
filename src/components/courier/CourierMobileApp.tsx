import React, { useState } from 'react';
import { useShipment } from '../../context/ShipmentContext';
import { Shipment, Courier } from '../../types/shipment';
import {
  Smartphone,
  Navigation,
  CheckCircle,
  XCircle,
  Scan,
  Package,
  MapPin,
  Phone,
  Clock,
  Camera,
  AlertTriangle,
  ArrowRight,
  Maximize2,
  Minimize2,
  Send,
  Truck,
} from 'lucide-react';

export const CourierMobileApp: React.FC = () => {
  const {
    shipments,
    couriers,
    updateCourierStatus,
    reportCourierFailure,
  } = useShipment();

  // Active courier profile (default to Dimas Wicaksono)
  const [selectedCourierId, setSelectedCourierId] = useState<string>('courier-01');
  const activeCourier = couriers.find((c) => c.id === selectedCourierId) || couriers[0];

  // Mobile Simulator layout toggle
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);

  // Active Mobile Tab: 'NEW_TASKS' | 'ACTIVE_EXECUTION' | 'HISTORY'
  const [courierTab, setCourierTab] = useState<'NEW_TASKS' | 'ACTIVE_EXECUTION' | 'HISTORY'>('NEW_TASKS');

  // Currently focused shipment in execution screen
  const [activeTaskShipment, setActiveTaskShipment] = useState<Shipment | null>(() => {
    return (
      shipments.find(
        (s) =>
          (s.assignedCourierId === 'courier-01' || !s.assignedCourierId) &&
          (s.status === 'READY_FOR_PICKUP' || s.status === 'OUT_FOR_DELIVERY')
      ) || shipments[0]
    );
  });

  // Modal Gagal Antar state
  const [isFailModalOpen, setIsFailModalOpen] = useState<boolean>(false);
  const [failReason, setFailReason] = useState<string>('Rumah Kosong / Penerima Tidak di Tempat');
  const [failPhotoUrl, setFailPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=500&auto=format&fit=crop&q=60'
  );
  const [failNotes, setFailNotes] = useState<string>('Sudah dihubungi telepon 3x tidak diangkat, pagar terkunci.');

  // Simulated Barcode Scanner Camera State
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanInput, setScanInput] = useState<string>('');

  // Assigned shipments for this courier
  const courierShipments = shipments.filter(
    (s) => s.assignedCourierId === activeCourier.id || !s.assignedCourierId
  );

  const pendingPickupShipments = courierShipments.filter(
    (s) => s.status === 'READY_FOR_PICKUP'
  );

  const inProgressShipments = courierShipments.filter(
    (s) => s.status === 'PICKED_UP' || s.status === 'OUT_FOR_DELIVERY' || s.status === 'ARRIVED_AT_HUB'
  );

  const completedShipments = courierShipments.filter(
    (s) => s.status === 'DELIVERED' || s.status === 'DELIVERY_FAILED'
  );

  // Actions
  const handleAcceptTask = (shipment: Shipment) => {
    setActiveTaskShipment(shipment);
    setCourierTab('ACTIVE_EXECUTION');
  };

  const handleUpdateStatus = (newStatus: Shipment['status'], notes?: string) => {
    if (!activeTaskShipment) return;
    updateCourierStatus(activeTaskShipment.id, newStatus, notes);
  };

  const handleOpenGoogleMapsRoute = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  const handleSubmitFailure = () => {
    if (!activeTaskShipment) return;
    reportCourierFailure(activeTaskShipment.id, failReason, failPhotoUrl, failNotes);
    setIsFailModalOpen(false);
  };

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      if (activeTaskShipment) {
        setScanInput(activeTaskShipment.resiNumber);
      }
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Controller Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-orange-100 text-orange-800 rounded-lg text-xs font-bold uppercase tracking-wider">
              Aktor: Kurir (Courier)
            </span>
            <span className="text-xs text-slate-500">• Tampilan Mobile Smartphone</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            Nusantara Courier App (Dispatch & Execution)
          </h2>
          <p className="text-xs text-slate-500">
            Penugasan otomatis &lt;&lt;include&gt;&gt; Tugaskan Kurir Otomatis, navigasi rute Maps API,
            dan scanner resi
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Switch Kurir */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-semibold">Login Sebagai:</span>
            <select
              value={selectedCourierId}
              onChange={(e) => setSelectedCourierId(e.target.value)}
              className="px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold"
            >
              {couriers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.vehicleType} - {c.plateNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Phone Frame */}
          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
          >
            {isPhoneFrame ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            {isPhoneFrame ? 'Mode Lebar (Desktop)' : 'Mode Smartphone (Frame)'}
          </button>
        </div>
      </div>

      {/* Main View Container */}
      <div className={`mx-auto transition-all duration-300 ${isPhoneFrame ? 'max-w-[420px]' : 'max-w-4xl'}`}>
        {/* Smartphone Shell Frame */}
        <div
          className={`bg-slate-950 text-slate-100 overflow-hidden shadow-2xl border-4 border-slate-800 ${
            isPhoneFrame ? 'rounded-[44px] p-3' : 'rounded-2xl p-0'
          }`}
        >
          {/* Phone Speaker Notch */}
          {isPhoneFrame && (
            <div className="w-36 h-4 bg-slate-900 rounded-full mx-auto mb-3 flex items-center justify-center">
              <div className="w-10 h-1 bg-slate-700 rounded-full" />
            </div>
          )}

          {/* Inner Mobile Screen */}
          <div className="bg-slate-900 rounded-[32px] overflow-hidden flex flex-col min-h-[640px] border border-slate-800 text-slate-100">
            {/* Top Courier Status Bar */}
            <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-xs shadow">
                  {activeCourier.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-xs text-white">{activeCourier.name}</div>
                  <div className="text-[10px] text-orange-400 font-mono">
                    {activeCourier.plateNumber} • {activeCourier.vehicleType}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Online Siap Tugas
                </span>
                <div className="text-[10px] text-slate-400 mt-0.5">Rating: ★ {activeCourier.rating}</div>
              </div>
            </div>

            {/* Mobile Tab Navigation */}
            <div className="grid grid-cols-3 bg-slate-950 border-b border-slate-800 text-xs font-bold text-center">
              <button
                onClick={() => setCourierTab('NEW_TASKS')}
                className={`py-3 relative transition ${
                  courierTab === 'NEW_TASKS'
                    ? 'text-orange-400 border-b-2 border-orange-500 bg-orange-500/10'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tugas Baru
                {pendingPickupShipments.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-orange-600 text-white text-[9px] rounded-full">
                    {pendingPickupShipments.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setCourierTab('ACTIVE_EXECUTION')}
                className={`py-3 relative transition ${
                  courierTab === 'ACTIVE_EXECUTION'
                    ? 'text-orange-400 border-b-2 border-orange-500 bg-orange-500/10'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Halaman Eksekusi
              </button>
              <button
                onClick={() => setCourierTab('HISTORY')}
                className={`py-3 relative transition ${
                  courierTab === 'HISTORY'
                    ? 'text-orange-400 border-b-2 border-orange-500 bg-orange-500/10'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Riwayat Selesai ({completedShipments.length})
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {/* TAB 1: TUGAS BARU (Card tugas otomatis hasil Tugaskan Kurir Otomatis) */}
              {courierTab === 'NEW_TASKS' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Penugasan Auto-Dispatch Masuk</span>
                    <span className="text-orange-400 font-bold">{pendingPickupShipments.length} Penjemputan</span>
                  </div>

                  {pendingPickupShipments.length === 0 ? (
                    <div className="p-8 text-center bg-slate-850 rounded-2xl border border-dashed border-slate-800 space-y-2">
                      <Truck className="w-10 h-10 text-slate-600 mx-auto" />
                      <p className="text-xs text-slate-400">Tidak ada tugas penjemputan baru saat ini.</p>
                      <p className="text-[10px] text-slate-500">
                        Buat pesanan baru di tab <strong>Pelanggan</strong> untuk melihat auto-dispatch berjalan.
                      </p>
                    </div>
                  ) : (
                    pendingPickupShipments.map((shp) => (
                      <div
                        key={shp.id}
                        className="bg-slate-850 rounded-2xl p-4 border border-slate-800 hover:border-orange-500/50 transition space-y-3 shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-[10px] font-bold rounded">
                            TUGAS PICKUP OTOMATIS
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-300">
                            {shp.resiNumber}
                          </span>
                        </div>

                        <div>
                          <div className="font-bold text-sm text-white">{shp.sender.contactName}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-500" /> {shp.sender.contactPhone}
                          </div>
                          <div className="text-xs text-slate-300 flex items-start gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                            <span>{shp.sender.address}, {shp.sender.city}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                          <div>
                            <span className="text-slate-500 block">Muatan:</span>
                            <span className="font-bold text-slate-200">
                              {shp.packageDetails.weightKg} Kg • {shp.packageDetails.itemCategory}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Estimasi Jarak:</span>
                            <span className="font-bold text-orange-400 font-mono">
                              ± 2.4 Km (6 Menit)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleOpenGoogleMapsRoute(shp.sender.lat, shp.sender.lng)}
                            className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1 border border-slate-700 transition"
                          >
                            <Navigation className="w-3.5 h-3.5 text-blue-400" /> Rute Maps
                          </button>
                          <button
                            onClick={() => handleAcceptTask(shp)}
                            className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-1 shadow-md shadow-orange-600/30 transition"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> [Terima Tugas]
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 2: HALAMAN EKSEKUSI TUGAS */}
              {courierTab === 'ACTIVE_EXECUTION' && (
                <div className="space-y-4">
                  {/* Active Selected Task Card */}
                  {activeTaskShipment ? (
                    <div className="bg-slate-850 rounded-2xl p-4 border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-orange-400">
                          {activeTaskShipment.resiNumber}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-bold rounded">
                          Status: {activeTaskShipment.status}
                        </span>
                      </div>

                      {/* Barcode/QR Scanner Section */}
                      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-center space-y-2">
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-300">
                          <Scan className="w-4 h-4 text-orange-500" /> Scanner Barcode / QR Resi
                        </div>

                        {isScanning ? (
                          <div className="h-28 bg-slate-950 rounded-lg border-2 border-orange-500 relative flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-x-0 h-0.5 bg-orange-500 animate-pulse shadow-lg" />
                            <span className="text-xs text-orange-400 font-mono animate-pulse">
                              [Scanning Camera Live...]
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={scanInput}
                              onChange={(e) => setScanInput(e.target.value)}
                              placeholder="Ketik / Scan No. Resi..."
                              className="flex-1 text-xs font-mono px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white uppercase"
                            />
                            <button
                              type="button"
                              onClick={handleSimulateScan}
                              className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                            >
                              <Scan className="w-3.5 h-3.5" /> Scan
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Destination Details & Routing */}
                      <div className="space-y-2 text-xs">
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                          <div className="text-[10px] text-slate-500 uppercase font-bold">
                            {activeTaskShipment.status === 'READY_FOR_PICKUP'
                              ? 'LOKASI PENJEMPUTAN (PENGIRIM)'
                              : 'LOKASI PENGANTARAN (PENERIMA)'}
                          </div>
                          <div className="font-bold text-white text-sm">
                            {activeTaskShipment.status === 'READY_FOR_PICKUP'
                              ? activeTaskShipment.sender.contactName
                              : activeTaskShipment.receiver.contactName}
                          </div>
                          <div className="text-slate-400">
                            {activeTaskShipment.status === 'READY_FOR_PICKUP'
                              ? activeTaskShipment.sender.address
                              : activeTaskShipment.receiver.address}
                          </div>
                          <div className="pt-1 flex items-center gap-2 text-orange-400 font-mono text-[11px]">
                            <Phone className="w-3 h-3" />
                            {activeTaskShipment.status === 'READY_FOR_PICKUP'
                              ? activeTaskShipment.sender.contactPhone
                              : activeTaskShipment.receiver.contactPhone}
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            handleOpenGoogleMapsRoute(
                              activeTaskShipment.status === 'READY_FOR_PICKUP'
                                ? activeTaskShipment.sender.lat
                                : activeTaskShipment.receiver.lat,
                              activeTaskShipment.status === 'READY_FOR_PICKUP'
                                ? activeTaskShipment.sender.lng
                                : activeTaskShipment.receiver.lng
                            )
                          }
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition"
                        >
                          <Navigation className="w-4 h-4" /> Buka Navigasi Rute Maps
                        </button>
                      </div>

                      {/* Tombol Update Status Eksekusi */}
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Aksi Update Status Pengiriman:
                        </div>

                        {activeTaskShipment.status === 'READY_FOR_PICKUP' && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(
                                'PICKED_UP',
                                `Paket berhasil diambil oleh kurir ${activeCourier.name}`
                              )
                            }
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition"
                          >
                            <CheckCircle className="w-4 h-4" /> [Paket Berhasil Di-pickup]
                          </button>
                        )}

                        {activeTaskShipment.status === 'PICKED_UP' && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(
                                'ARRIVED_AT_HUB',
                                `Kurir menyerahkan paket ke Hub Transit ${activeCourier.assignedHubId}`
                              )
                            }
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 transition"
                          >
                            <Truck className="w-4 h-4" /> Serahkan ke Hub Transit
                          </button>
                        )}

                        {(activeTaskShipment.status === 'IN_TRANSIT' ||
                          activeTaskShipment.status === 'ARRIVED_AT_HUB') && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(
                                'OUT_FOR_DELIVERY',
                                `Kurir ${activeCourier.name} membawa paket untuk pengantaran ke penerima`
                              )
                            }
                            className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 transition"
                          >
                            <Truck className="w-4 h-4" /> [Mulai Antar ke Penerima (Out for Delivery)]
                          </button>
                        )}

                        {activeTaskShipment.status === 'OUT_FOR_DELIVERY' && (
                          <div className="space-y-2">
                            <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-[11px] text-slate-300">
                              Minta 6-digit kode OTP dari penerima saat serah terima, atau minta penerima
                              membuka portal konfirmasi.
                            </div>
                            <button
                              onClick={() => {
                                alert(
                                  `Serah terima paket membutuhkan verifikasi OTP! Silakan minta penerima membuka Tab "3. Penerima" dengan OTP: ${activeTaskShipment.deliveryOtp}`
                                );
                              }}
                              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 transition shadow"
                            >
                              <CheckCircle className="w-4 h-4" /> [Selesaikan Pengantaran (Via OTP)]
                            </button>
                          </div>
                        )}

                        {/* Modal Gagal Antar (Extend dari Update Status) */}
                        <button
                          onClick={() => setIsFailModalOpen(true)}
                          className="w-full py-2.5 bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
                        >
                          <AlertTriangle className="w-4 h-4" /> [Lapor Gagal Antar]
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8 text-xs text-slate-500">
                      Pilih salah satu tugas di tab "Tugas Baru" untuk dieksekusi.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: RIWAYAT SELESAI */}
              {courierTab === 'HISTORY' && (
                <div className="space-y-3">
                  {completedShipments.length === 0 ? (
                    <div className="text-center p-8 text-xs text-slate-500">
                      Belum ada riwayat pengiriman yang selesai.
                    </div>
                  ) : (
                    completedShipments.map((shp) => (
                      <div
                        key={shp.id}
                        className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-300">{shp.resiNumber}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              shp.status === 'DELIVERED'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {shp.status}
                          </span>
                        </div>
                        <div className="text-slate-400">
                          {shp.receiver.contactName} ({shp.receiver.city})
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {shp.trackingTimeline[shp.trackingTimeline.length - 1]?.timestamp}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL GAGAL ANTAR (EXTEND DARI UPDATE STATUS) */}
      {isFailModalOpen && activeTaskShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-red-500/40 w-full max-w-md overflow-hidden space-y-4">
            <div className="p-4 bg-red-950/80 border-b border-red-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-sm">Laporan Gagal Antar Paket</h3>
              </div>
              <button
                onClick={() => setIsFailModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono">No. Resi Paket</span>
                <div className="font-mono font-bold text-base text-slate-200">
                  {activeTaskShipment.resiNumber}
                </div>
              </div>

              {/* Dropdown Alasan Gagal Antar */}
              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Alasan Kegagalan Pengantaran
                </label>
                <select
                  value={failReason}
                  onChange={(e) => setFailReason(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                >
                  <option value="Rumah Kosong / Penerima Tidak di Tempat">
                    Rumah Kosong / Penerima Tidak di Tempat
                  </option>
                  <option value="Alamat Tidak Ditemukan / Tidak Lengkap">
                    Alamat Tidak Ditemukan / Tidak Lengkap
                  </option>
                  <option value="Penerima Menolak Menerima Paket">
                    Penerima Menolak Menerima Paket
                  </option>
                  <option value="Akses Jalan Terputus / Banjir / Bencana">
                    Akses Jalan Terputus / Banjir / Bencana
                  </option>
                  <option value="Penerima Meminta Dijadwalkan Ulang">
                    Penerima Meminta Dijadwalkan Ulang
                  </option>
                </select>
              </div>

              {/* Form Upload Foto Bukti Lokasi (Geotagged) */}
              <div>
                <label className="font-bold text-slate-300 block mb-1 flex items-center gap-1">
                  <Camera className="w-4 h-4 text-orange-400" /> Foto Bukti Lokasi / Rumah
                </label>
                <div className="flex items-center gap-3 p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <img
                    src={failPhotoUrl}
                    alt="Bukti Gagal Antar"
                    className="w-16 h-16 object-cover rounded-lg border border-slate-600"
                  />
                  <div className="text-slate-400 text-[11px] space-y-1">
                    <p className="font-semibold text-slate-200">Foto Geotagged Otomatis</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      GPS: [{activeCourier.currentLocation.lat.toFixed(4)}, {activeCourier.currentLocation.lng.toFixed(4)}]
                    </p>
                  </div>
                </div>
              </div>

              {/* Catatan Kurir */}
              <div>
                <label className="font-bold text-slate-300 block mb-1">Catatan Tambahan Kurir</label>
                <textarea
                  rows={2}
                  value={failNotes}
                  onChange={(e) => setFailNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  placeholder="Deskripsikan kondisi di lapangan..."
                />
              </div>

              <div className="p-3 bg-red-950/40 rounded-xl border border-red-900/50 text-[11px] text-red-300">
                Peringatan: Aksi ini akan mencatat status <strong>DELIVERY_FAILED</strong> di timeline
                dan memicu pengiriman notifikasi otomatis kepada pengirim & penerima.
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setIsFailModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleSubmitFailure}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-red-600/30 transition"
              >
                <CheckCircle className="w-4 h-4" /> [Simpan Status Gagal Antar]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
