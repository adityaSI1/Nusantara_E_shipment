import React from 'react';
import { X, Printer, ShieldCheck, Truck, Package, QrCode } from 'lucide-react';
import { Shipment } from '../../types/shipment';

interface PrintableLabelModalProps {
  shipment: Shipment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintableLabelModal: React.FC<PrintableLabelModalProps> = ({
  shipment,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !shipment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-8">
        {/* Modal Top Actions */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-400" />
            <span className="font-bold text-sm">Label Pengiriman Ekspedisi Darat</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" /> Cetak Thermal (A6)
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Physical Label Simulation (A6 Thermal Format) */}
        <div className="p-6 bg-slate-100 flex justify-center">
          <div
            id="shipping-label-thermal"
            className="w-full max-w-[390px] bg-white border-2 border-slate-900 rounded p-4 text-slate-900 font-sans shadow-md"
          >
            {/* Header: Logo & Routing Code */}
            <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1 font-black text-xl tracking-tight text-slate-900">
                  <Truck className="w-6 h-6 text-orange-600 inline" />
                  NUSANTARA CARGO
                </div>
                <div className="text-[10px] font-semibold text-slate-600 tracking-wider uppercase">
                  Ekspedisi Darat Door-To-Door
                </div>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 bg-slate-900 text-white font-mono font-bold text-sm rounded">
                  {shipment.service.serviceType === 'EXPRESS'
                    ? 'EXP-DARAT'
                    : shipment.service.serviceType === 'CARGO_DARAT'
                    ? 'CARGO-TRK'
                    : 'REG-DARAT'}
                </span>
                <div className="text-[10px] text-slate-500 mt-1 font-mono">
                  {shipment.sender.city.slice(0, 3).toUpperCase()}-
                  {shipment.receiver.city.slice(0, 3).toUpperCase()}-01
                </div>
              </div>
            </div>

            {/* Barcode & Resi */}
            <div className="py-3 border-b-2 border-slate-900 text-center">
              {/* Simulated High Density 1D Barcode */}
              <div className="h-12 flex justify-center items-stretch gap-[2px] px-4 py-1 bg-white">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div
                    key={i}
                    className={`bg-slate-900 ${
                      i % 7 === 0
                        ? 'w-[4px]'
                        : i % 4 === 0
                        ? 'w-[3px]'
                        : i % 2 === 0
                        ? 'w-[2px]'
                        : 'w-[1px]'
                    }`}
                  />
                ))}
              </div>
              <div className="font-mono font-black text-lg tracking-widest mt-1">
                {shipment.resiNumber}
              </div>
              <div className="text-[10px] text-slate-500">Scan Barcode / QR untuk Auto-Inbound Hub</div>
            </div>

            {/* Sender & Receiver Grid */}
            <div className="grid grid-cols-2 gap-3 py-3 border-b-2 border-slate-900 text-xs">
              <div className="border-r border-slate-300 pr-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                  Pengirim:
                </span>
                <p className="font-bold text-slate-900 line-clamp-1">{shipment.sender.contactName}</p>
                <p className="text-[11px] text-slate-700 font-mono">{shipment.sender.contactPhone}</p>
                <p className="text-[11px] text-slate-600 line-clamp-3 mt-1 leading-tight">
                  {shipment.sender.address}, {shipment.sender.city}
                </p>
              </div>

              <div className="pl-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                  Penerima:
                </span>
                <p className="font-bold text-slate-900 line-clamp-1">{shipment.receiver.contactName}</p>
                <p className="text-[11px] text-slate-700 font-mono">{shipment.receiver.contactPhone}</p>
                <p className="text-[11px] text-slate-600 line-clamp-3 mt-1 leading-tight">
                  {shipment.receiver.address}, {shipment.receiver.city}
                </p>
              </div>
            </div>

            {/* Package & Service Specs */}
            <div className="py-2.5 border-b-2 border-slate-900 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                <span className="text-[9px] text-slate-500 block">Berat Aktual</span>
                <span className="font-bold">{shipment.packageDetails.weightKg} Kg</span>
              </div>
              <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                <span className="text-[9px] text-slate-500 block">Dimensi</span>
                <span className="font-bold font-mono">
                  {shipment.packageDetails.lengthCm}x{shipment.packageDetails.widthCm}x{shipment.packageDetails.heightCm}
                </span>
              </div>
              <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                <span className="text-[9px] text-slate-500 block">Status Bayar</span>
                <span
                  className={`font-bold ${
                    shipment.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {shipment.paymentStatus === 'PAID' ? 'LUNAS (NON-COD)' : 'MENUNGGU BAYAR'}
                </span>
              </div>
            </div>

            {/* Security Notice: OTP Validation on Receive */}
            <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-orange-600 shrink-0" />
                <div>
                  <p className="font-bold text-orange-950 text-[11px]">
                    Keamanan Serah Terima (OTP Protected)
                  </p>
                  <p className="text-[10px] text-orange-800">
                    Wajib verifikasi OTP Penerima sebelum serah terima paket
                  </p>
                </div>
              </div>
              <div className="p-1 bg-white rounded border border-slate-300">
                <QrCode className="w-8 h-8 text-slate-800" />
              </div>
            </div>

            <div className="mt-2 text-[9px] text-slate-400 text-center font-mono">
              Dicetak via E-Shipment Nusantara Cargo • {new Date().toLocaleDateString('id-ID')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
