import React, { useState } from 'react';
import { useShipment } from '../../context/ShipmentContext';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Play,
  RotateCcw,
  X,
  Truck,
  CreditCard,
  Building2,
  ShieldCheck,
  Package,
  Layers,
  Smartphone,
  ExternalLink,
} from 'lucide-react';

interface DemoFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchActor: (actorId: string) => void;
}

export const DemoFlowModal: React.FC<DemoFlowModalProps> = ({
  isOpen,
  onClose,
  onSwitchActor,
}) => {
  const {
    shipments,
    createShipment,
    payShipment,
    updateCourierStatus,
    processHubInbound,
    createOutboundManifest,
    verifyReceiverOtp,
    calculateTariff,
  } = useShipment();

  const [simulatedResi, setSimulatedResi] = useState<string>('NC-202610-84920');
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [isRunningAuto, setIsRunningAuto] = useState<boolean>(false);
  const [logMessages, setLogMessages] = useState<string[]>([
    'Sistem e-shipment Cloud Logistics siap dijalankan.',
  ]);

  if (!isOpen) return null;

  const currentShipment =
    shipments.find((s) => s.resiNumber === simulatedResi) || shipments[0];

  const steps = [
    {
      num: 1,
      title: '1. Pembuatan Order & Hitung Tarif',
      actor: 'CUSTOMER',
      actorLabel: 'Pelanggan (Customer)',
      desc: 'Form multi-field memanggil <<include>> Hitung Tarif, menghasilkan No. Resi unik, dan menjadwalkan penugasan.',
      actionLabel: 'Buat Paket Baru Otomatis',
      runAction: () => {
        const rates = calculateTariff(
          'Malang',
          'Surabaya',
          -7.9528,
          112.5938,
          -7.2575,
          112.7521,
          7.5,
          35,
          25,
          20,
          3000000,
          true
        );
        const newShp = createShipment({
          sender: {
            lat: -7.9528,
            lng: 112.5938,
            city: 'Malang',
            address: 'Kawasan Sentra Bisnis Terpadu Dinoyo Blok A No. 12',
            contactName: 'PT Nusantara Teknologi Mandiri',
            contactPhone: '+62 811-2233-4455',
          },
          receiver: {
            lat: -7.2575,
            lng: 112.7521,
            city: 'Surabaya',
            address: 'Sentra Bisnis Mayjend Sungkono No. 45',
            contactName: 'PT Mandiri Solusi Logistik',
            contactPhone: '+62 812-9988-7711',
          },
          packageDetails: {
            itemCategory: 'Elektronik',
            description: 'Perangkat Sensor Telemetri Ekspedisi Darat',
            weightKg: 7.5,
            lengthCm: 35,
            widthCm: 25,
            heightCm: 20,
            declaredValueRp: 3000000,
            isInsured: true,
            volumetricWeightKg: (35 * 25 * 20) / 5000,
          },
          service: rates[0],
        });
        setSimulatedResi(newShp.resiNumber);
        setLogMessages((prev) => [
          `[STEP 1] Resi ${newShp.resiNumber} berhasil digenerate. Status: UNPAID`,
          ...prev,
        ]);
        setActiveStepIdx(1);
      },
    },
    {
      num: 2,
      title: '2. Pembayaran & Auto-Dispatch Kurir',
      actor: 'CUSTOMER',
      actorLabel: 'Pelanggan / Payment Gateway',
      desc: 'Pelanggan melunasi via Virtual Account/QRIS. Status berubah menjadi READY_FOR_PICKUP, dan algoritma Send-Receive Auto-Dispatch langsung menetapkan kurir terdekat.',
      actionLabel: 'Konfirmasi Pembayaran Lunas',
      runAction: () => {
        if (!currentShipment) return;
        payShipment(currentShipment.id, 'BCA_VA');
        setLogMessages((prev) => [
          `[STEP 2] Pembayaran VA LUNAS! Kurir ${
            currentShipment.assignedCourier?.name || 'Dimas'
          } ditugaskan otomatis via Haversine distance scoring.`,
          ...prev,
        ]);
        setActiveStepIdx(2);
      },
    },
    {
      num: 3,
      title: '3. Penjemputan Paket oleh Kurir',
      actor: 'COURIER',
      actorLabel: 'Kurir (Courier Mobile)',
      desc: 'Kurir menerima tugas di smartphone, menuju alamat pengirim dengan navigasi Maps, dan melakukan scan barcode pickup.',
      actionLabel: 'Kurir Ambil Paket (Pickup Sukses)',
      runAction: () => {
        if (!currentShipment) return;
        updateCourierStatus(
          currentShipment.id,
          'PICKED_UP',
          'Kurir telah mengambil paket di Sentra Bisnis Ijen Malang'
        );
        setLogMessages((prev) => [
          `[STEP 3] Kurir menekan [Paket Berhasil Di-pickup]. Notifikasi WhatsApp otomatis terkirim ke Pengirim.`,
          ...prev,
        ]);
        setActiveStepIdx(3);
      },
    },
    {
      num: 4,
      title: '4. Sortir Inbound & Outbound Hub Transit',
      actor: 'HUB_STAFF',
      actorLabel: 'Petugas Hub (Station Console)',
      desc: 'Paket tiba di Hub Malang, di-scan Barcode Gun inbound, lalu dimasukkan ke Manifest Truk Darat menuju Hub Surabaya.',
      actionLabel: 'Proses Hub & Rilis Manifest Darat',
      runAction: () => {
        if (!currentShipment) return;
        processHubInbound([currentShipment.resiNumber], 'hub-mlg', 'Petugas Sortir Malang');
        createOutboundManifest(
          'hub-mlg',
          'hub-sub',
          [currentShipment.resiNumber],
          'N 8920 EF (Truk CDD Box)',
          'Slamet Riyadi'
        );
        setLogMessages((prev) => [
          `[STEP 4] Manifest MNF Darat dirilis. Paket berstatus IN_TRANSIT melintasi Tol Trans Jawa.`,
          ...prev,
        ]);
        setActiveStepIdx(4);
      },
    },
    {
      num: 5,
      title: '5. Pengantaran Terakhir ke Penerima',
      actor: 'COURIER',
      actorLabel: 'Kurir Terakhir (Last Mile)',
      desc: 'Tiba di kota tujuan. Kurir membawa paket menuju alamat penerima (Out for Delivery). Kode OTP 6-Digit di-broadcast ke WhatsApp penerima.',
      actionLabel: 'Mulai Antar (Out for Delivery + OTP)',
      runAction: () => {
        if (!currentShipment) return;
        updateCourierStatus(
          currentShipment.id,
          'OUT_FOR_DELIVERY',
          'Kurir membawa paket untuk pengantaran langsung ke penerima'
        );
        setLogMessages((prev) => [
          `[STEP 5] Status OUT_FOR_DELIVERY aktif. Kode OTP rahasia (${currentShipment.deliveryOtp}) dikirimkan ke WhatsApp penerima.`,
          ...prev,
        ]);
        setActiveStepIdx(5);
      },
    },
    {
      num: 6,
      title: '6. Verifikasi OTP 6-Digit & Selesai',
      actor: 'RECEIVER',
      actorLabel: 'Penerima (Receiver Portal)',
      desc: 'Penerima memasukkan kode OTP 6-digit di portal serah terima. Status berganti menjadi DELIVERED dengan rating & bukti foto serah terima.',
      actionLabel: 'Verifikasi OTP & Selesaikan Pengiriman',
      runAction: () => {
        if (!currentShipment) return;
        verifyReceiverOtp(
          currentShipment.resiNumber,
          currentShipment.deliveryOtp,
          currentShipment.receiver.contactName,
          'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=60',
          5,
          'Pengiriman sangat cepat dan aman via Tol Trans Jawa. Terima kasih!'
        );
        setLogMessages((prev) => [
          `[STEP 6] OTP VALID! Paket DELIVERED resmi diserahterimakan. Seluruh siklus Send-Receive Automatic selesai sukses 100%!`,
          ...prev,
        ]);
        setActiveStepIdx(6);
      },
    },
  ];

  const handleRunFullAuto = () => {
    setIsRunningAuto(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        steps[i].runAction();
        i++;
      } else {
        clearInterval(interval);
        setIsRunningAuto(false);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:px-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                Simulasi Otomatis: Alur End-to-End E-Shipment
              </h3>
              <p className="text-xs text-slate-400">
                Uji langsung fitur unggulan <strong>Send-Receive Automatic</strong> tanpa kerumitan input manual
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Resi Monitor Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Resi Simulasi:</span>
            <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
              {simulatedResi}
            </span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">
              {currentShipment?.status || 'UNPAID'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={isRunningAuto}
              onClick={handleRunFullAuto}
              className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <Play className="w-3.5 h-3.5" />
              {isRunningAuto ? 'Menjalankan Simulasi...' : 'Jalankan Semua Otomatis (1-Klik)'}
            </button>
          </div>
        </div>

        {/* Steps List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {steps.map((st, idx) => {
            const isCompleted = activeStepIdx > idx;
            const isCurrent = activeStepIdx === idx;

            return (
              <div
                key={st.num}
                className={`p-4 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-orange-50/60 border-orange-400 shadow-sm ring-1 ring-orange-300'
                    : isCompleted
                    ? 'bg-slate-50/80 border-slate-200 opacity-90'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-orange-600 text-white animate-pulse'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : st.num}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{st.title}</h4>
                        <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {st.actorLabel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{st.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => {
                        onSwitchActor(st.actor);
                        onClose();
                      }}
                      className="px-2.5 py-1 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1 hover:underline"
                    >
                      Buka UI Aktor <ExternalLink className="w-3 h-3" />
                    </button>
                    <button
                      disabled={isRunningAuto}
                      onClick={st.runAction}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                        isCurrent
                          ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {st.actionLabel}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Execution Logs */}
        <div className="p-4 bg-slate-950 text-slate-300 border-t border-slate-800 text-[11px] font-mono space-y-1 max-h-32 overflow-y-auto">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Log Real-Time Event Worker:
          </div>
          {logMessages.map((msg, idx) => (
            <div key={idx} className="flex items-start gap-1.5 leading-snug">
              <span className="text-emerald-400">&gt;</span>
              <span>{msg}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Siklus Lengkap: <strong>Send-Receive Automatic</strong> & <strong>Smart Dispatching</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
          >
            Tutup Simulasi
          </button>
        </div>
      </div>
    </div>
  );
};
