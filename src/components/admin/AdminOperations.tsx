import React, { useState } from 'react';
import { useShipment } from '../../context/ShipmentContext';
import {
  Shield,
  Truck,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  PackageCheck,
  Building2,
  Users,
  Settings,
  RefreshCw,
  BarChart3,
  MapPin,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Edit2,
  Target,
} from 'lucide-react';
import { LiveMap } from '../common/LiveMap';
import { Shipment, Courier, TransitHub, TariffRateConfig } from '../../types/shipment';

export const AdminOperations: React.FC = () => {
  const {
    shipments,
    couriers,
    hubs,
    tariffRates,
    reassignCourier,
    addHub,
    deleteHub,
    addCourier,
    deleteCourier,
    updateTariffRate,
  } = useShipment();

  // Active Admin Tab: 'LIVE_OPERATIONS' | 'MASTER_DATA' | 'MARKET_STRATEGY'
  const [adminTab, setAdminTab] = useState<'LIVE_OPERATIONS' | 'MASTER_DATA' | 'MARKET_STRATEGY'>(
    'LIVE_OPERATIONS'
  );

  // Master Data Subtab
  const [masterSubTab, setMasterSubTab] = useState<'USERS_COURIERS' | 'TARIFFS' | 'HUBS'>('USERS_COURIERS');

  // Override Manual Courier Reassignment Modal
  const [reassignModalShipment, setReassignModalShipment] = useState<Shipment | null>(null);
  const [selectedNewCourierId, setSelectedNewCourierId] = useState<string>(couriers[0]?.id || '');
  const [reassignReason, setReassignReason] = useState<string>('Optimalisasi rute penjemputan terdekat');

  // Master Data Form States
  const [newHubName, setNewHubName] = useState('');
  const [newHubCity, setNewHubCity] = useState('');
  const [newHubAddress, setNewHubAddress] = useState('');
  const [newHubCapacity, setNewHubCapacity] = useState(50);
  const [newHubLat, setNewHubLat] = useState(-7.95);
  const [newHubLng, setNewHubLng] = useState(112.6);

  const [newCourierName, setNewCourierName] = useState('');
  const [newCourierPlate, setNewCourierPlate] = useState('');
  const [newCourierVehicle, setNewCourierVehicle] = useState<'Sepeda Motor' | 'Blind Van' | 'Pick-up Box' | 'Truk CDD'>('Blind Van');
  const [newCourierPhone, setNewCourierPhone] = useState('+62 812-');

  // KPI Computations
  const totalShipments = shipments.length;
  const inTransitCount = shipments.filter(
    (s) => s.status === 'IN_TRANSIT' || s.status === 'OUT_FOR_DELIVERY' || s.status === 'ARRIVED_AT_HUB'
  ).length;
  const failedCount = shipments.filter((s) => s.status === 'DELIVERY_FAILED').length;
  const deliveredCount = shipments.filter((s) => s.status === 'DELIVERED').length;
  const totalRevenue = shipments.reduce(
    (acc, s) => acc + (s.paymentStatus === 'PAID' ? s.service.totalCost : 0),
    0
  );
  const successRate = totalShipments > 0 ? Math.round((deliveredCount / totalShipments) * 100) : 0;

  const handleExecuteReassignment = () => {
    if (!reassignModalShipment) return;
    reassignCourier(reassignModalShipment.id, selectedNewCourierId, reassignReason);
    setReassignModalShipment(null);
  };

  const handleCreateHub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHubName || !newHubCity) return;
    const hub: TransitHub = {
      id: `hub-${Date.now()}`,
      hubCode: `HUB-${newHubCity.slice(0, 3).toUpperCase()}-0${hubs.length + 1}`,
      name: newHubName,
      city: newHubCity,
      address: newHubAddress || 'Jl. Logistik Sentral',
      coordinates: { lat: newHubLat, lng: newHubLng },
      capacityTon: newHubCapacity,
      currentLoadTon: 0,
      managerName: 'Kepala Hub Baru',
      phone: '+62 811-0000-0000',
    };
    addHub(hub);
    setNewHubName('');
    setNewHubCity('');
    setNewHubAddress('');
  };

  const handleCreateCourier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourierName || !newCourierPlate) return;
    const courier: Courier = {
      id: `courier-${Date.now()}`,
      name: newCourierName,
      phone: newCourierPhone,
      plateNumber: newCourierPlate,
      vehicleType: newCourierVehicle,
      currentLocation: {
        lat: -7.9528,
        lng: 112.5938,
        address: 'Kawasan Sentra Bisnis Ijen, Malang',
      },
      assignedHubId: 'hub-mlg',
      isActive: true,
      activeTaskCount: 0,
      rating: 5.0,
    };
    addCourier(courier);
    setNewCourierName('');
    setNewCourierPlate('');
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      {/* Admin Operations Top Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600 rounded-2xl text-white shadow-lg shadow-red-600/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded border border-red-500/30">
                Aktor: Admin Operasional & Super Admin
              </span>
              <span className="text-xs text-slate-400">• Command Center Ekspedisi Darat</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black mt-0.5">
              Live Operations & Master Data Management
            </h1>
            <p className="text-xs text-slate-400">
              Monitoring KPI armada darat real-time, override penugasan kurir, dan master tarif zonasi
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1.5 rounded-xl border border-slate-700 text-xs font-bold">
          <button
            onClick={() => setAdminTab('LIVE_OPERATIONS')}
            className={`px-3 py-1.5 rounded-lg transition ${
              adminTab === 'LIVE_OPERATIONS'
                ? 'bg-red-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Operations
          </button>
          <button
            onClick={() => setAdminTab('MASTER_DATA')}
            className={`px-3 py-1.5 rounded-lg transition ${
              adminTab === 'MASTER_DATA'
                ? 'bg-red-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Master Data CRUD
          </button>
          <button
            onClick={() => setAdminTab('MARKET_STRATEGY')}
            className={`px-3 py-1.5 rounded-lg transition ${
              adminTab === 'MARKET_STRATEGY'
                ? 'bg-red-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Strategi Bisnis & Pasar
          </button>
        </div>
      </div>

      {/* VIEW 1: LIVE OPERATIONS DASHBOARD */}
      {adminTab === 'LIVE_OPERATIONS' && (
        <div className="space-y-6">
          {/* KPI CARDS (Total Pengiriman, Paket In-Transit, Gagal Antar, Pendapatan) */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Total Pengiriman</span>
                <Truck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalShipments}</div>
              <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +14% vs minggu lalu
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Paket In-Transit Darat</span>
                <RefreshCw className="w-4 h-4 text-orange-500 animate-spin" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-orange-600">{inTransitCount}</div>
              <div className="text-[10px] text-slate-500">Lintas Tol Trans Jawa</div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Gagal Antar</span>
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-red-600">{failedCount}</div>
              <div className="text-[10px] text-slate-500">Perlu re-attempt besok</div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Tingkat Sukses Delivery</span>
                <PackageCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600">{successRate}%</div>
              <div className="text-[10px] text-emerald-700 font-bold">Target SLA &gt;95%</div>
            </div>

            <div className="col-span-2 lg:col-span-1 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Total Omset (Lunas)</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                Rp {totalRevenue.toLocaleString('id-ID')}
              </div>
              <div className="text-[10px] text-slate-500">Non-COD Gateway</div>
            </div>
          </div>

          {/* INTERACTIVE LIVE MAP LOKASI KURIR & HUB (MAPS API) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Live Operations Geographic Information System (GIS)
                </h3>
                <p className="text-xs text-slate-500">
                  Pemetaan real-time pergerakan armada kurir darat, kapasitas muatan hub, dan koridor Tol Trans Jawa
                </p>
              </div>
              <span className="text-xs font-mono bg-orange-100 text-orange-800 font-bold px-3 py-1 rounded-full">
                {couriers.length} Kurir Aktif • {hubs.length} Hub Logistik
              </span>
            </div>

            <LiveMap hubs={hubs} couriers={couriers} shipments={shipments} height="420px" />
          </div>

          {/* TABEL MASTER PENGIRIMAN DENGAN OVERRIDE MANUAL [Tugaskan Ulang Kurir] */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Master Data Pengiriman & Penugasan Kurir
                </h3>
                <p className="text-xs text-slate-500">
                  Pantau seluruh status dan lakukan override manual penugasan kurir jika diperlukan
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">No. Resi</th>
                    <th className="p-3">Rute (Asal ➔ Tujuan)</th>
                    <th className="p-3">Layanan</th>
                    <th className="p-3">Status Saat Ini</th>
                    <th className="p-3">Kurir Ditugaskan</th>
                    <th className="p-3 text-right">Aksi Super Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shipments.map((shp) => (
                    <tr key={shp.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-900">{shp.resiNumber}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-800">
                          {shp.sender.city} ➔ {shp.receiver.city}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {shp.packageDetails.weightKg} Kg • {shp.packageDetails.itemCategory}
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-slate-700">{shp.service.serviceName}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            shp.status === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : shp.status === 'DELIVERY_FAILED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {shp.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {shp.assignedCourier ? (
                          <div>
                            <span className="font-bold text-slate-900">{shp.assignedCourier.name}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              {shp.assignedCourier.plateNumber}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Belum Ditugaskan</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setReassignModalShipment(shp);
                            setSelectedNewCourierId(couriers[0]?.id || '');
                          }}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-orange-600 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1 ml-auto"
                        >
                          <RefreshCw className="w-3 h-3" /> [Tugaskan Ulang Kurir]
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: MASTER DATA CRUD */}
      {adminTab === 'MASTER_DATA' && (
        <div className="space-y-6">
          {/* Subtabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setMasterSubTab('USERS_COURIERS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                masterSubTab === 'USERS_COURIERS'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Master Kurir & Armada ({couriers.length})
            </button>
            <button
              onClick={() => setMasterSubTab('HUBS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                masterSubTab === 'HUBS'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Master Hub Transit ({hubs.length})
            </button>
            <button
              onClick={() => setMasterSubTab('TARIFFS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                masterSubTab === 'TARIFFS'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Pengaturan Tarif & Zonasi Wilayah Darat ({tariffRates.length})
            </button>
          </div>

          {/* MASTER SUBTAB 1: COURIERS */}
          {masterSubTab === 'USERS_COURIERS' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Add Courier Form (4 Cols) */}
              <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-orange-600" /> Tambah Kurir Baru
                </h4>
                <form onSubmit={handleCreateCourier} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Nama Lengkap Kurir</label>
                    <input
                      type="text"
                      value={newCourierName}
                      onChange={(e) => setNewCourierName(e.target.value)}
                      placeholder="Contoh: Andi Pratama"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Nomor Plat Armada</label>
                    <input
                      type="text"
                      value={newCourierPlate}
                      onChange={(e) => setNewCourierPlate(e.target.value)}
                      placeholder="Contoh: N 5432 KL"
                      className="w-full font-mono uppercase px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Jenis Kendaraan</label>
                    <select
                      value={newCourierVehicle}
                      onChange={(e) => setNewCourierVehicle(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                    >
                      <option value="Blind Van">Blind Van (Shuttle Cepat)</option>
                      <option value="Pick-up Box">Pick-up Box (1 Ton)</option>
                      <option value="Truk CDD">Truk CDD Box (5 Ton)</option>
                      <option value="Sepeda Motor">Sepeda Motor (Dokumen)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">No. WhatsApp</label>
                    <input
                      type="text"
                      value={newCourierPhone}
                      onChange={(e) => setNewCourierPhone(e.target.value)}
                      className="w-full font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition"
                  >
                    Simpan Kurir
                  </button>
                </form>
              </div>

              {/* Courier Table (8 Cols) */}
              <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-sm text-slate-900">Daftar Kurir & Armada Aktif</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                      <tr>
                        <th className="p-3">Nama Kurir</th>
                        <th className="p-3">Armada & Plat</th>
                        <th className="p-3">Lokasi Terkini</th>
                        <th className="p-3">Tugas Aktif</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {couriers.map((c) => (
                        <tr key={c.id}>
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{c.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{c.phone}</div>
                          </td>
                          <td className="p-3">
                            <span className="font-mono font-bold text-slate-800">{c.plateNumber}</span>
                            <div className="text-[10px] text-slate-500">{c.vehicleType}</div>
                          </td>
                          <td className="p-3 text-slate-600">{c.currentLocation.address}</td>
                          <td className="p-3 font-bold text-blue-600">{c.activeTaskCount} Tugas</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => deleteCourier(c.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MASTER SUBTAB 2: HUBS */}
          {masterSubTab === 'HUBS' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Add Hub Form */}
              <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-orange-600" /> Tambah Hub Transit Baru
                </h4>
                <form onSubmit={handleCreateHub} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Nama Hub Transit</label>
                    <input
                      type="text"
                      value={newHubName}
                      onChange={(e) => setNewHubName(e.target.value)}
                      placeholder="Contoh: Hub Solo Manahan"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Kota</label>
                    <input
                      type="text"
                      value={newHubCity}
                      onChange={(e) => setNewHubCity(e.target.value)}
                      placeholder="Contoh: Solo"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Alamat Lengkap</label>
                    <input
                      type="text"
                      value={newHubAddress}
                      onChange={(e) => setNewHubAddress(e.target.value)}
                      placeholder="Jl. Slamet Riyadi No. 100"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Kapasitas (Ton)</label>
                    <input
                      type="number"
                      value={newHubCapacity}
                      onChange={(e) => setNewHubCapacity(parseInt(e.target.value) || 10)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition"
                  >
                    Simpan Hub
                  </button>
                </form>
              </div>

              {/* Hub Table */}
              <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-sm text-slate-900">Daftar Titik Hub Transit Ekspedisi</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                      <tr>
                        <th className="p-3">Kode & Nama Hub</th>
                        <th className="p-3">Kota & Alamat</th>
                        <th className="p-3">Kapasitas & Muatan</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {hubs.map((h) => (
                        <tr key={h.id}>
                          <td className="p-3">
                            <span className="font-mono font-bold text-orange-600">{h.hubCode}</span>
                            <div className="font-bold text-slate-900">{h.name}</div>
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-slate-800">{h.city}</span>
                            <div className="text-[10px] text-slate-400">{h.address}</div>
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-slate-900">
                              {h.currentLoadTon} / {h.capacityTon} Ton
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => deleteHub(h.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MASTER SUBTAB 3: TARIFFS */}
          {masterSubTab === 'TARIFFS' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-base text-slate-900">
                    Pengaturan Matriks Tarif Wilayah Darat (Jawa-Bali)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Konfigurasi dasar tarif per kilogram untuk Express, Reguler, dan Heavy Cargo
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                    <tr>
                      <th className="p-3">Rute Darat (Asal ➔ Tujuan)</th>
                      <th className="p-3">Express / Kg</th>
                      <th className="p-3">Reguler / Kg</th>
                      <th className="p-3">Cargo Darat / Kg (Min. 10 Kg)</th>
                      <th className="p-3">Estimasi Durasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {tariffRates.map((t) => (
                      <tr key={t.id}>
                        <td className="p-3 font-sans font-bold text-slate-900">
                          {t.originCity} ➔ {t.destinationCity}
                        </td>
                        <td className="p-3 text-orange-600 font-bold">
                          Rp {t.expressRatePerKg.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-slate-800">
                          Rp {t.regularRatePerKg.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-blue-600 font-bold">
                          Rp {t.cargoRatePerKg.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 font-sans text-slate-500">{t.estimatedHoursExpress}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: STRATEGI & PERENCANAAN PASAR BISNIS */}
      {adminTab === 'MARKET_STRATEGY' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
              Rencana Strategis E-Business & Ekspedisi Darat Enterprise
            </span>
            <h3 className="font-extrabold text-2xl text-slate-900">
              Strategi Pertumbuhan Pasar & Analisis Ekspedisi Darat e-Shipment
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Platform: e-Shipment Cloud Logistics | Model Bisnis: Hub-and-Spoke Freight & Automated Last-Mile
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="font-bold text-sm text-slate-900">Target Segmen Pasar (B2B & B2C)</h4>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                <li>
                  <strong>B2B FMCG & Manufaktur:</strong> Pengiriman muatan besar via Cargo Darat (Truk CDD/Fuso) koridor industri Surabaya-Semarang-Jakarta.
                </li>
                <li>
                  <strong>E-Commerce Sellers & UMKM:</strong> Pelaku usaha Malang & Jatim yang membutuhkan kecepatan Next-Day Tol Trans Jawa.
                </li>
                <li>
                  <strong>Perusahaan Farmasi & Perbankan:</strong> Pengiriman dokumen rahasia dengan proteksi 6-digit OTP verification.
                </li>
              </ul>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                2
              </div>
              <h4 className="font-bold text-sm text-slate-900">Keunggulan Bersaing "Send-Receive Automatic"</h4>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                <li>
                  <strong>Zero-Wait Dispatch:</strong> Algoritma penugasan otomatis kurir terdekat mengeliminasi bottleneck admin penugasan manual.
                </li>
                <li>
                  <strong>Verifikasi Anti-Fraud OTP:</strong> Perlindungan kepastian serah terima paket tanpa risiko paket hilang / salah penerima.
                </li>
                <li>
                  <strong>Integrasi Maps API Geolocation:</strong> Kalkulasi tarif presisi berdasarkan kilometer riil jalan tol darat, bukan radius udara kasar.
                </li>
              </ul>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                3
              </div>
              <h4 className="font-bold text-sm text-slate-900">Proyeksi Pendapatan & Unit Economics</h4>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                <li>
                  <strong>Gross Profit Margin:</strong> Ditargetkan mencapai 28% - 32% per shipment darat dengan optimasi kapasitas muatan truk transit.
                </li>
                <li>
                  <strong>SLA Performance:</strong> Tingkat ketepatan waktu pengiriman On-Time Delivery Rate &gt;96.5%.
                </li>
                <li>
                  <strong>Customer Acquisition Cost (CAC):</strong> Efisiensi biaya akuisisi via web portal mandiri (Guest to Customer funnel).
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* OVERRIDE REASSIGNMENT MODAL */}
      {reassignModalShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden space-y-4">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] text-orange-400 font-mono">Manual Override Dispatch</span>
                <h3 className="font-bold text-sm">Tugaskan Ulang Kurir Baru</h3>
              </div>
              <button
                onClick={() => setReassignModalShipment(null)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-slate-500 block">Nomor Resi Paket:</span>
                <span className="font-mono font-bold text-sm text-slate-900">
                  {reassignModalShipment.resiNumber}
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Pilih Kurir Baru Pengganti
                </label>
                <select
                  value={selectedNewCourierId}
                  onChange={(e) => setSelectedNewCourierId(e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  {couriers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.plateNumber} - {c.vehicleType}) • {c.activeTaskCount} Tugas
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Alasan Override Reassignment
                </label>
                <textarea
                  rows={2}
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  placeholder="Misal: Kurir sebelumnya mengalami kendala ban bocor..."
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setReassignModalShipment(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteReassignment}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow"
              >
                <CheckCircle2 className="w-4 h-4" /> [Simpan Penugasan Baru]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
