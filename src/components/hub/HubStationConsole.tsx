import React, { useState } from 'react';
import { useShipment } from '../../context/ShipmentContext';
import {
  Building2,
  Scan,
  Package,
  ArrowRight,
  Truck,
  CheckCircle2,
  FileSpreadsheet,
  Send,
  Boxes,
  Plus,
  Trash2,
  Barcode,
} from 'lucide-react';

export const HubStationConsole: React.FC = () => {
  const {
    hubs,
    shipments,
    manifests,
    processHubInbound,
    createOutboundManifest,
  } = useShipment();

  // Active Hub
  const [selectedHubId, setSelectedHubId] = useState<string>('hub-mlg');
  const currentHub = hubs.find((h) => h.id === selectedHubId) || hubs[0];

  // Active Module Tab: 'INBOUND' | 'OUTBOUND' | 'MANIFEST_LIST'
  const [hubTab, setHubTab] = useState<'INBOUND' | 'OUTBOUND' | 'MANIFEST_LIST'>('INBOUND');

  // INBOUND MODULE STATE
  const [inboundScanInput, setInboundScanInput] = useState<string>('');
  const [scannedInboundResis, setScannedInboundResis] = useState<string[]>([]);
  const [staffName, setStaffName] = useState<string>('Guntur Wibowo (Petugas Inbound)');

  // OUTBOUND MODULE STATE
  const [destinationHubId, setDestinationHubId] = useState<string>('hub-sub');
  const [outboundVehiclePlate, setOutboundVehiclePlate] = useState<string>('N 8920 EF (Truk CDD Box)');
  const [driverName, setDriverName] = useState<string>('Slamet Riyadi');
  const [selectedOutboundResis, setSelectedOutboundResis] = useState<string[]>([]);
  const [outboundScanInput, setOutboundScanInput] = useState<string>('');

  // INBOUND ACTIONS
  const handleAddInboundResi = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inboundScanInput.trim().toUpperCase();
    if (!clean) return;

    if (!scannedInboundResis.includes(clean)) {
      setScannedInboundResis((prev) => [...prev, clean]);
    }
    setInboundScanInput('');
  };

  const handleConfirmInbound = () => {
    if (scannedInboundResis.length === 0) return;
    processHubInbound(scannedInboundResis, selectedHubId, staffName);
    setScannedInboundResis([]);
  };

  // OUTBOUND ACTIONS
  const handleAddOutboundResi = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = outboundScanInput.trim().toUpperCase();
    if (!clean) return;

    if (!selectedOutboundResis.includes(clean)) {
      setSelectedOutboundResis((prev) => [...prev, clean]);
    }
    setOutboundScanInput('');
  };

  const handleReleaseManifest = () => {
    if (selectedOutboundResis.length === 0) return;
    createOutboundManifest(
      selectedHubId,
      destinationHubId,
      selectedOutboundResis,
      outboundVehiclePlate,
      driverName
    );
    setSelectedOutboundResis([]);
    setHubTab('MANIFEST_LIST');
  };

  // Packages eligible for Inbound: PICKED_UP or in-transit to this hub
  const eligibleForInbound = shipments.filter(
    (s) => s.status === 'PICKED_UP' || s.status === 'READY_FOR_PICKUP'
  );

  // Packages currently in this Hub (ready for Outbound manifest)
  const packagesInHub = shipments.filter(
    (s) => s.status === 'ARRIVED_AT_HUB' && s.currentHubId === selectedHubId
  );

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      {/* Station Console Top Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-600 rounded-2xl text-white shadow-lg shadow-orange-600/30">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-orange-500/20 text-orange-400 font-bold px-2 py-0.5 rounded border border-orange-500/30">
                Aktor: Petugas Hub (Hub Staff Console)
              </span>
              <span className="text-xs text-slate-400">• Warehouse Inbound/Outbound</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black mt-0.5">
              Konsol Stasiun Hub Transit Logistik
            </h1>
            <p className="text-xs text-slate-400">
              Pengelolaan barcode gun inbound, konsolidasi manifest darat, dan dispatch armada
            </p>
          </div>
        </div>

        {/* Hub Selector */}
        <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 w-full md:w-auto">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Lokasi Hub Aktif Anda:
          </label>
          <select
            value={selectedHubId}
            onChange={(e) => setSelectedHubId(e.target.value)}
            className="w-full md:w-64 bg-slate-900 border border-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {hubs.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.city})
              </option>
            ))}
          </select>
          <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
            <span>Muatan: {currentHub.currentLoadTon} Ton</span>
            <span>Kapasitas: {currentHub.capacityTon} Ton</span>
          </div>
        </div>
      </div>

      {/* Module Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setHubTab('INBOUND')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            hubTab === 'INBOUND'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Scan className="w-4 h-4 text-orange-500" /> Modul Inbound (Scan Masuk Hub)
          {scannedInboundResis.length > 0 && (
            <span className="px-1.5 py-0.2 bg-orange-600 text-white rounded-full text-[10px]">
              {scannedInboundResis.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setHubTab('OUTBOUND')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            hubTab === 'OUTBOUND'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Truck className="w-4 h-4 text-blue-500" /> Modul Outbound (Buat Manifest Darat)
          {packagesInHub.length > 0 && (
            <span className="px-1.5 py-0.2 bg-blue-600 text-white rounded-full text-[10px]">
              {packagesInHub.length} Siap
            </span>
          )}
        </button>

        <button
          onClick={() => setHubTab('MANIFEST_LIST')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            hubTab === 'MANIFEST_LIST'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Riwayat Manifest ({manifests.length})
        </button>
      </div>

      {/* MODUL 1: INBOUND (Barcode scanner gun, tabel draf paket masuk hub, tombol [Konfirmasi Masuk Hub]) */}
      {hubTab === 'INBOUND' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Scanner Gun Simulation Console (4 Cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Barcode className="w-5 h-5 text-orange-600" /> Barcode Gun Simulator
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Scan barcode resi fisik yang dibawa oleh kurir atau truk drop-off. Setiap scan akan
              menambahkan nomor resi ke daftar draf paket masuk.
            </p>

            <form onSubmit={handleAddInboundResi} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nomor Resi Paket (Scanner Gun)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inboundScanInput}
                    onChange={(e) => setInboundScanInput(e.target.value)}
                    placeholder="NC-202610-XXXXX"
                    className="flex-1 font-mono font-bold text-xs uppercase px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-slate-900 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition"
                  >
                    Scan
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Petugas Hub yang Melakukan Scan
                </label>
                <input
                  type="text"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </form>

            {/* Quick Helper for Demo */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                Pilih Cepat Resi dari Kurir:
              </span>
              <div className="space-y-1.5">
                {eligibleForInbound.slice(0, 3).map((shp) => (
                  <button
                    key={shp.id}
                    type="button"
                    onClick={() => {
                      if (!scannedInboundResis.includes(shp.resiNumber)) {
                        setScannedInboundResis((prev) => [...prev, shp.resiNumber]);
                      }
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-orange-50 hover:border-orange-200 border border-slate-200 text-xs transition flex items-center justify-between"
                  >
                    <span className="font-mono font-bold text-slate-800">{shp.resiNumber}</span>
                    <span className="text-[10px] text-orange-600 font-bold">+ Tambah Scan</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tabel Draf Paket Masuk Hub & Konfirmasi (8 Cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Draf Paket Masuk ({currentHub.name})
                </h3>
                <p className="text-xs text-slate-500">
                  {scannedInboundResis.length} resi telah di-scan siap dimasukkan ke gudang sortir
                </p>
              </div>

              <button
                disabled={scannedInboundResis.length === 0}
                onClick={handleConfirmInbound}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition"
              >
                <CheckCircle2 className="w-4 h-4" /> [Konfirmasi Masuk Hub]
              </button>
            </div>

            {scannedInboundResis.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-400 text-xs space-y-2">
                <Boxes className="w-10 h-10 text-slate-300 mx-auto" />
                <p>Belum ada paket yang di-scan.</p>
                <p className="text-[11px] text-slate-400">
                  Gunakan Barcode Gun simulator di sebelah kiri untuk memasukkan resi.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">No. Resi</th>
                      <th className="p-3">Pengirim & Asal</th>
                      <th className="p-3">Penerima & Tujuan</th>
                      <th className="p-3">Kategori / Berat</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {scannedInboundResis.map((resi) => {
                      const shp = shipments.find((s) => s.resiNumber === resi);
                      return (
                        <tr key={resi} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-slate-900">{resi}</td>
                          <td className="p-3">
                            <div className="font-semibold">{shp?.sender.contactName || 'Pengirim'}</div>
                            <div className="text-[10px] text-slate-400">{shp?.sender.city}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold">{shp?.receiver.contactName || 'Penerima'}</div>
                            <div className="text-[10px] text-slate-400">{shp?.receiver.city}</div>
                          </td>
                          <td className="p-3 font-mono">
                            {shp?.packageDetails.weightKg || 5} Kg • {shp?.packageDetails.itemCategory}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() =>
                                setScannedInboundResis((prev) => prev.filter((r) => r !== resi))
                              }
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODUL 2: OUTBOUND (Pembuatan manifest darat antar-hub) */}
      {hubTab === 'OUTBOUND' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-lg text-slate-900">
              Pembuatan Manifest Pengiriman Antar-Hub Darat
            </h3>
            <p className="text-xs text-slate-500">
              Kelompokkan paket muatan satu rute koridor darat, tetapkan armada truk box / fuso, dan
              berangkatkan manifest transit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Hub Transit Tujuan
              </label>
              <select
                value={destinationHubId}
                onChange={(e) => setDestinationHubId(e.target.value)}
                className="w-full text-xs font-bold px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              >
                {hubs
                  .filter((h) => h.id !== selectedHubId)
                  .map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.city})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Armada Darat (Truk / Van)
              </label>
              <select
                value={outboundVehiclePlate}
                onChange={(e) => setOutboundVehiclePlate(e.target.value)}
                className="w-full text-xs font-bold px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              >
                <option value="N 8920 EF (Truk CDD Box)">N 8920 EF (Truk Colt Diesel Box)</option>
                <option value="L 2940 OP (Truk Fuso Wingbox)">L 2940 OP (Truk Fuso Wingbox - 15 Ton)</option>
                <option value="B 9182 VZ (Blind Van High Roof)">B 9182 VZ (Blind Van High Roof)</option>
                <option value="H 4412 AA (Truk Tronton Darat)">H 4412 AA (Truk Tronton Darat - 24 Ton)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Nama Driver Armada
              </label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full text-xs font-bold px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          {/* Package Selection for Manifest */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">
                Pilih Paket di Hub {currentHub.name} ({packagesInHub.length} Tersedia)
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {selectedOutboundResis.length} Resi Dipilih
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto">
              {packagesInHub.map((shp) => {
                const isChecked = selectedOutboundResis.includes(shp.resiNumber);
                return (
                  <div
                    key={shp.id}
                    onClick={() => {
                      if (isChecked) {
                        setSelectedOutboundResis((prev) => prev.filter((r) => r !== shp.resiNumber));
                      } else {
                        setSelectedOutboundResis((prev) => [...prev, shp.resiNumber]);
                      }
                    }}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                      isChecked
                        ? 'bg-blue-50/60 border-blue-400 ring-1 ring-blue-300'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-mono font-bold text-slate-900">{shp.resiNumber}</div>
                      <div className="text-[11px] text-slate-500">
                        {shp.sender.city} ➔ {shp.receiver.city} ({shp.packageDetails.weightKg} Kg)
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold">{shp.service.serviceName}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      readOnly
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </div>
                );
              })}

              {packagesInHub.length === 0 && (
                <div className="col-span-2 p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  Tidak ada paket berstatus ARRIVED_AT_HUB di hub ini saat ini. Lakukan proses Inbound
                  terlebih dahulu untuk memasukkan paket.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button
              disabled={selectedOutboundResis.length === 0}
              onClick={handleReleaseManifest}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md shadow-blue-600/30 transition"
            >
              <Truck className="w-4 h-4" /> [Rilis Manifest Outbound & Kirim Notifikasi]
            </button>
          </div>
        </div>
      )}

      {/* MODUL 3: MANIFEST LIST */}
      {hubTab === 'MANIFEST_LIST' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900">
            Daftar Manifest Perjalanan Antar-Hub Aktif
          </h3>

          {manifests.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
              Belum ada manifest rilis outbound yang dibuat dalam sesi ini.
            </div>
          ) : (
            <div className="space-y-3">
              {manifests.map((mnf) => {
                const orig = hubs.find((h) => h.id === mnf.originHubId)?.city || 'Asal';
                const dest = hubs.find((h) => h.id === mnf.destinationHubId)?.city || 'Tujuan';

                return (
                  <div
                    key={mnf.manifestId}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-slate-900">
                          {mnf.manifestId}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">
                          {mnf.status}
                        </span>
                      </div>
                      <div className="text-slate-600 mt-1">
                        Rute: <strong>{orig}</strong> ➔ <strong>{dest}</strong> via Tol Trans Jawa
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Armada: {mnf.vehiclePlate} • Driver: {mnf.driverName}
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="font-bold text-slate-900">
                        {mnf.totalPackages} Koli ({mnf.totalWeightKg} Kg)
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Diberangkatkan: {new Date(mnf.dispatchedAt).toLocaleTimeString('id-ID')} WIB
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
