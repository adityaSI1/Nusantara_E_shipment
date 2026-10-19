import React, { useState, useEffect } from 'react';
import { useShipment } from '../../context/ShipmentContext';
import {
  Shipment,
  TariffCalculation,
  PaymentMethod,
  ShipmentStatus,
} from '../../types/shipment';
import {
  Package,
  PlusCircle,
  Clock,
  Printer,
  XCircle,
  Eye,
  CheckCircle2,
  MapPin,
  Shield,
  CreditCard,
  QrCode,
  ArrowRight,
  Truck,
  Sparkles,
  Zap,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { PinpointMapModal } from '../common/PinpointMapModal';
import { PrintableLabelModal } from '../common/PrintableLabelModal';

interface CustomerDashboardProps {
  prefilledOrder?: {
    originCity: string;
    destCity: string;
    weightKg: number;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
    selectedService: TariffCalculation;
  } | null;
  onClearPrefilledOrder?: () => void;
  onOpenDemoFlow?: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  prefilledOrder,
  onClearPrefilledOrder,
  onOpenDemoFlow,
}) => {
  const {
    shipments,
    calculateTariff,
    createShipment,
    payShipment,
    cancelShipment,
  } = useShipment();

  // Tab: 'FORM' | 'LIST'
  const [activeTab, setActiveTab] = useState<'FORM' | 'LIST'>(
    prefilledOrder ? 'FORM' : 'LIST'
  );

  // Status Filter
  const [filterStatus, setFilterStatus] = useState<'ALL' | ShipmentStatus>('ALL');

  // Form State: Sender & Receiver
  const [senderName, setSenderName] = useState('Hendra Gunawan (PT Nusantara Teknologi Mandiri)');
  const [senderPhone, setSenderPhone] = useState('+62 811-2233-4455');
  const [senderCity, setSenderCity] = useState(prefilledOrder?.originCity || 'Malang');
  const [senderAddress, setSenderAddress] = useState(
    'Kawasan Sentra Bisnis Terpadu Dinoyo Blok A No. 12, Malang'
  );
  const [senderLat, setSenderLat] = useState(-7.9528);
  const [senderLng, setSenderLng] = useState(112.5938);

  const [receiverName, setReceiverName] = useState('PT Mandiri Solusi Logistik (Ibu Melani)');
  const [receiverPhone, setReceiverPhone] = useState('+62 812-9988-7711');
  const [receiverCity, setReceiverCity] = useState(prefilledOrder?.destCity || 'Surabaya');
  const [receiverAddress, setReceiverAddress] = useState('Sentra Bisnis Mayjend Sungkono No. 45');
  const [receiverLat, setReceiverLat] = useState(-7.2575);
  const [receiverLng, setReceiverLng] = useState(112.7521);

  // Form State: Package Details
  const [itemCategory, setItemCategory] = useState<Shipment['packageDetails']['itemCategory']>('Elektronik');
  const [description, setDescription] = useState('Server Micro IoT & Perangkat Telemetri Darat');
  const [weightKg, setWeightKg] = useState<number>(prefilledOrder?.weightKg || 5);
  const [lengthCm, setLengthCm] = useState<number>(prefilledOrder?.lengthCm || 35);
  const [widthCm, setWidthCm] = useState<number>(prefilledOrder?.widthCm || 25);
  const [heightCm, setHeightCm] = useState<number>(prefilledOrder?.heightCm || 20);
  const [declaredValueRp, setDeclaredValueRp] = useState<number>(3500000);
  const [isInsured, setIsInsured] = useState<boolean>(true);

  // Available Calculated Services
  const [availableServices, setAvailableServices] = useState<TariffCalculation[]>([]);
  const [selectedService, setSelectedService] = useState<TariffCalculation | null>(
    prefilledOrder?.selectedService || null
  );

  // Modals
  const [pinpointTarget, setPinpointTarget] = useState<'SENDER' | 'RECEIVER' | null>(null);
  const [checkoutModalShipment, setCheckoutModalShipment] = useState<Shipment | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('BCA_VA');
  const [labelModalShipment, setLabelModalShipment] = useState<Shipment | null>(null);

  // Synchronize prefilled order from landing page
  useEffect(() => {
    if (prefilledOrder) {
      setActiveTab('FORM');
      setSenderCity(prefilledOrder.originCity);
      setReceiverCity(prefilledOrder.destCity);
      setWeightKg(prefilledOrder.weightKg);
      setLengthCm(prefilledOrder.lengthCm);
      setWidthCm(prefilledOrder.widthCm);
      setHeightCm(prefilledOrder.heightCm);
      setSelectedService(prefilledOrder.selectedService);
    }
  }, [prefilledOrder]);

  // Recalculate rates whenever inputs change
  useEffect(() => {
    const services = calculateTariff(
      senderCity,
      receiverCity,
      senderLat,
      senderLng,
      receiverLat,
      receiverLng,
      weightKg,
      lengthCm,
      widthCm,
      heightCm,
      declaredValueRp,
      isInsured
    );
    setAvailableServices(services);
    if (!selectedService || !services.some((s) => s.serviceType === selectedService.serviceType)) {
      setSelectedService(services[0]);
    }
  }, [senderCity, receiverCity, weightKg, lengthCm, widthCm, heightCm, declaredValueRp, isInsured]);

  const handleCreateAndSubmit = () => {
    if (!selectedService) return;

    const newShipment = createShipment({
      sender: {
        lat: senderLat,
        lng: senderLng,
        address: senderAddress,
        city: senderCity,
        contactName: senderName,
        contactPhone: senderPhone,
      },
      receiver: {
        lat: receiverLat,
        lng: receiverLng,
        address: receiverAddress,
        city: receiverCity,
        contactName: receiverName,
        contactPhone: receiverPhone,
      },
      packageDetails: {
        itemCategory,
        description,
        weightKg,
        lengthCm,
        widthCm,
        heightCm,
        declaredValueRp,
        isInsured,
        volumetricWeightKg: (lengthCm * widthCm * heightCm) / 5000,
      },
      service: selectedService,
    });

    if (onClearPrefilledOrder) onClearPrefilledOrder();
    setCheckoutModalShipment(newShipment);
  };

  const handleCompletePayment = () => {
    if (!checkoutModalShipment) return;
    payShipment(checkoutModalShipment.id, selectedPaymentMethod);
    setCheckoutModalShipment(null);
    setActiveTab('LIST');
  };

  const filteredShipments = shipments.filter((shp) => {
    if (filterStatus === 'ALL') return true;
    return shp.status === filterStatus;
  });

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-lg text-xs font-bold uppercase tracking-wider">
              Portal Pelanggan (Customer)
            </span>
            <span className="text-xs text-slate-500">• Ekspedisi Darat Mandiri</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Manajemen Pengiriman Paket & Resi
          </h2>
          <p className="text-xs text-slate-500">
            Form instan, auto-assign kurir terdekat, cetak label thermal ekspedisi, dan bayar online
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('LIST')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'LIST'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Package className="w-4 h-4" /> Daftar Paket ({shipments.length})
          </button>
          <button
            onClick={() => setActiveTab('FORM')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'FORM'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200'
            }`}
          >
            <PlusCircle className="w-4 h-4" /> [Kirim Paket Baru]
          </button>
        </div>
      </div>

      {/* VIEW 1: FORM BUAT PENGIRIMAN (2-COLUMN FLUID LAYOUT - TIDAK RIBET) */}
      {activeTab === 'FORM' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Input Sections (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Section 1: Alamat Pengirim & Penerima */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-600" /> 1. Data Pengirim & Penerima
                </span>
                <span className="text-[11px] text-slate-500">Integrasi Maps API</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Pengirim */}
                <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Asal Penjemputan
                    </span>
                    <button
                      type="button"
                      onClick={() => setPinpointTarget('SENDER')}
                      className="text-orange-600 hover:text-orange-700 text-[11px] font-bold flex items-center gap-0.5"
                    >
                      <MapPin className="w-3 h-3" /> Pinpoint
                    </button>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Nama Pengirim</label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">No. WhatsApp</label>
                    <input
                      type="text"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Kota Asal</label>
                    <input
                      type="text"
                      value={senderCity}
                      onChange={(e) => setSenderCity(e.target.value)}
                      className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Alamat Lengkap</label>
                    <textarea
                      rows={2}
                      value={senderAddress}
                      onChange={(e) => setSenderAddress(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                {/* Penerima */}
                <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Tujuan Pengantaran
                    </span>
                    <button
                      type="button"
                      onClick={() => setPinpointTarget('RECEIVER')}
                      className="text-emerald-600 hover:text-emerald-700 text-[11px] font-bold flex items-center gap-0.5"
                    >
                      <MapPin className="w-3 h-3" /> Pinpoint
                    </button>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Nama Penerima</label>
                    <input
                      type="text"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">No. WhatsApp Penerima</label>
                    <input
                      type="text"
                      value={receiverPhone}
                      onChange={(e) => setReceiverPhone(e.target.value)}
                      className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Kota Tujuan</label>
                    <input
                      type="text"
                      value={receiverCity}
                      onChange={(e) => setReceiverCity(e.target.value)}
                      className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Alamat Lengkap</label>
                    <textarea
                      rows={2}
                      value={receiverAddress}
                      onChange={(e) => setReceiverAddress(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Detail Barang */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Package className="w-4 h-4 text-orange-600" /> 2. Detail Spesifikasi Barang
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Kategori Barang
                  </label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value as any)}
                    className="w-full text-xs font-bold px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Elektronik">Elektronik & Alat Telemetri</option>
                    <option value="Dokumen">Dokumen & Berkas Penting</option>
                    <option value="Pakaian & Tekstil">Pakaian & Tekstil</option>
                    <option value="Makanan Kering">Makanan Olahan Kering</option>
                    <option value="Suku Cadang / Mesin">Suku Cadang & Mesin</option>
                    <option value="Lainnya">Keramik & Fragile</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Deskripsi Ringkas
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Weight & Dimensi */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Berat (Kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value) || 1)}
                    className="w-full text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Panjang (cm)</label>
                  <input
                    type="number"
                    value={lengthCm}
                    onChange={(e) => setLengthCm(parseInt(e.target.value) || 10)}
                    className="w-full text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Lebar (cm)</label>
                  <input
                    type="number"
                    value={widthCm}
                    onChange={(e) => setWidthCm(parseInt(e.target.value) || 10)}
                    className="w-full text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Tinggi (cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(parseInt(e.target.value) || 10)}
                    className="w-full text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Insurance */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-950">
                  <input
                    type="checkbox"
                    checked={isInsured}
                    onChange={(e) => setIsInsured(e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded"
                  />
                  Gunakan Asuransi Ekspedisi Darat
                </label>
                <span className="font-mono text-amber-900 font-bold">
                  Rp {(isInsured ? Math.max(5000, declaredValueRp * 0.002) : 0).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Section 3: Pilihan Layanan */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Truck className="w-4 h-4 text-orange-600" /> 3. Pilihan Layanan Ekspedisi Darat
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {availableServices.map((srv) => {
                  const isSelected = selectedService?.serviceType === srv.serviceType;
                  return (
                    <div
                      key={srv.serviceType}
                      onClick={() => setSelectedService(srv)}
                      className={`cursor-pointer rounded-xl p-4 border-2 transition ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-400 font-mono">
                          {srv.serviceType}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-600" />}
                      </div>
                      <h4 className="font-bold text-xs text-slate-900">{srv.serviceName}</h4>
                      <div className="text-[11px] text-slate-500 mt-1">{srv.estimatedDuration}</div>
                      <div className="font-black text-sm text-orange-600 mt-3 pt-2 border-t border-slate-200/60">
                        Rp {srv.totalCost.toLocaleString('id-ID')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Summary & Checkout CTA (4 Cols) */}
          <div className="lg:col-span-4 sticky top-20 space-y-4">
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg border border-slate-800 space-y-4">
              <h3 className="font-bold text-base text-slate-100 border-b border-slate-800 pb-3">
                Ringkasan Biaya Pengiriman
              </h3>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Rute Darat:</span>
                  <span className="font-bold text-white">{senderCity} &rarr; {receiverCity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Layanan:</span>
                  <span className="font-bold text-amber-400">{selectedService?.serviceName || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Berat Dikenakan:</span>
                  <span className="font-mono text-white">
                    {Math.max(weightKg, (lengthCm * widthCm * heightCm) / 5000).toFixed(1)} Kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Jarak Tol:</span>
                  <span className="font-mono text-white">{selectedService?.distanceKm || 0} Km</span>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                  <span className="font-bold text-sm text-slate-200">Total Tarif:</span>
                  <span className="font-black text-xl text-orange-400">
                    Rp {selectedService?.totalCost.toLocaleString('id-ID') || 0}
                  </span>
                </div>
              </div>

              {/* Automation highlight badge */}
              <div className="p-3 bg-slate-850 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
                <div className="font-bold text-orange-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> Send-Receive Automatic:
                </div>
                <p className="text-slate-400 text-[10px] leading-relaxed">
                  Menghasilkan Resi otomatis, menugaskan kurir terdekat via Maps API, & membuat 6-digit OTP penerima.
                </p>
              </div>

              <button
                onClick={handleCreateAndSubmit}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm rounded-xl shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 transition hover:scale-[1.02]"
              >
                <CreditCard className="w-4 h-4" /> [Bayar & Proses Otomatis]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: DAFTAR PENGIRIMAN SAYA */}
      {activeTab === 'LIST' && (
        <div className="space-y-4">
          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
            {[
              { id: 'ALL', label: 'Semua Status' },
              { id: 'UNPAID', label: 'Menunggu Bayar' },
              { id: 'READY_FOR_PICKUP', label: 'Dijemput Kurir' },
              { id: 'IN_TRANSIT', label: 'In-Transit Darat' },
              { id: 'OUT_FOR_DELIVERY', label: 'Sedang Diantar' },
              { id: 'DELIVERED', label: 'Selesai Terkirim' },
              { id: 'DELIVERY_FAILED', label: 'Gagal Antar' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setFilterStatus(st.id as any)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
                  filterStatus === st.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Shipment List */}
          <div className="space-y-3">
            {filteredShipments.map((shp) => {
              const isPaid = shp.paymentStatus === 'PAID';
              const isDelivered = shp.status === 'DELIVERED';
              const isFailed = shp.status === 'DELIVERY_FAILED';

              return (
                <div
                  key={shp.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-slate-300 transition space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-slate-900">
                            {shp.resiNumber}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {shp.service.serviceName}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {shp.sender.city} &rarr; {shp.receiver.city} ({shp.packageDetails.weightKg} Kg)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          isDelivered
                            ? 'bg-emerald-100 text-emerald-800'
                            : isFailed
                            ? 'bg-red-100 text-red-800'
                            : !isPaid
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {shp.status.replace(/_/g, ' ')}
                      </span>

                      {!isPaid && (
                        <button
                          onClick={() => setCheckoutModalShipment(shp)}
                          className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                        >
                          [Bayar Sekarang]
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="text-slate-500 text-[11px]">
                      Kurir Ditugaskan:{' '}
                      <strong className="text-slate-800">
                        {shp.assignedCourier?.name || 'Auto-Dispatch Terdekat'}
                      </strong>{' '}
                      • OTP Serah Terima:{' '}
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                        {shp.deliveryOtp}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setLabelModalShipment(shp)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                      >
                        <Printer className="w-3.5 h-3.5" /> Cetak Label Thermal
                      </button>

                      {shp.status === 'UNPAID' || shp.status === 'READY_FOR_PICKUP' ? (
                        <button
                          onClick={() => {
                            if (window.confirm(`Batalkan pengiriman resi ${shp.resiNumber}?`)) {
                              cancelShipment(shp.id, 'Dibatalkan oleh Pelanggan');
                            }
                          }}
                          className="px-2.5 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition"
                        >
                          Batalkan
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {checkoutModalShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-mono">Payment Gateway Simulator</span>
                <h3 className="font-bold text-base">Pelunasan Ekspedisi Darat</h3>
              </div>
              <button
                onClick={() => setCheckoutModalShipment(null)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between text-slate-500">
                  <span>No. Resi:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {checkoutModalShipment.resiNumber}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Rute:</span>
                  <span className="font-bold text-slate-800">
                    {checkoutModalShipment.sender.city} &rarr; {checkoutModalShipment.receiver.city}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm">
                  <span className="text-slate-900">Total Tagihan:</span>
                  <span className="text-orange-600">
                    Rp {checkoutModalShipment.service.totalCost.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-2">Pilih Metode Pembayaran</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'BCA_VA', label: 'BCA VA' },
                    { id: 'MANDIRI_VA', label: 'Mandiri VA' },
                    { id: 'QRIS', label: 'QRIS Instan' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(m.id as any)}
                      className={`p-2.5 rounded-xl border font-bold text-center transition ${
                        selectedPaymentMethod === m.id
                          ? 'border-orange-500 bg-orange-50 text-orange-950 ring-1 ring-orange-300'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-[11px] leading-relaxed">
                Setelah pembayaran terkonfirmasi, status langsung diperbarui ke{' '}
                <strong>READY_FOR_PICKUP</strong> dan kurir terdekat langsung dijadwalkan!
              </div>

              <button
                onClick={handleCompletePayment}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> [Konfirmasi Pembayaran Lunas (Simulasi)]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pinpoint Modal */}
      <PinpointMapModal
        isOpen={pinpointTarget !== null}
        onClose={() => setPinpointTarget(null)}
        title={
          pinpointTarget === 'SENDER'
            ? 'Pinpoint Lokasi Pengirim (Asal)'
            : 'Pinpoint Lokasi Penerima (Tujuan)'
        }
        initialLat={pinpointTarget === 'SENDER' ? senderLat : receiverLat}
        initialLng={pinpointTarget === 'SENDER' ? senderLng : receiverLng}
        onConfirm={(loc) => {
          if (pinpointTarget === 'SENDER') {
            setSenderAddress(loc.address);
            setSenderCity(loc.city);
            setSenderLat(loc.lat);
            setSenderLng(loc.lng);
          } else {
            setReceiverAddress(loc.address);
            setReceiverCity(loc.city);
            setReceiverLat(loc.lat);
            setReceiverLng(loc.lng);
          }
        }}
      />

      {/* Printable Thermal Label Modal */}
      <PrintableLabelModal
        shipment={labelModalShipment}
        isOpen={labelModalShipment !== null}
        onClose={() => setLabelModalShipment(null)}
      />
    </div>
  );
};
