import React, { useState } from 'react';
import { useShipment } from '../../context/ShipmentContext';
import {
  ShieldCheck,
  CheckCircle2,
  Package,
  Star,
  Camera,
  Truck,
  MapPin,
  Clock,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const ReceiverPortal: React.FC = () => {
  const { shipments, verifyReceiverOtp } = useShipment();

  // Find a default active out_for_delivery or picked_up shipment to verify
  const [selectedResi, setSelectedResi] = useState<string>(() => {
    const active = shipments.find(
      (s) => s.status === 'OUT_FOR_DELIVERY' || s.status === 'IN_TRANSIT' || s.status === 'PICKED_UP'
    );
    return active ? active.resiNumber : (shipments[0]?.resiNumber || 'NC-202610-84920');
  });

  const activeShipment = shipments.find(
    (s) => s.resiNumber.trim().toUpperCase() === selectedResi.trim().toUpperCase()
  );

  // OTP Form State
  const [otpInput, setOtpInput] = useState<string>('');
  const [receivedBy, setReceivedBy] = useState<string>(activeShipment?.receiver.contactName || 'Penerima');
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Review & POD Modal / Form State
  const [rating, setRating] = useState<number>(5);
  const [review, setReview] = useState<string>('Pelayanan ekspedisi darat sangat cepat dan aman. Kurir ramah!');
  const [podPhotoUrl, setPodPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=60'
  );
  const [isPhotoUploaded, setIsPhotoUploaded] = useState<boolean>(true);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput || otpInput.length < 6) {
      setVerificationResult({
        success: false,
        message: 'Mohon masukkan 6-digit kode OTP lengkap.',
      });
      return;
    }

    const result = verifyReceiverOtp(
      selectedResi,
      otpInput,
      receivedBy,
      podPhotoUrl,
      rating,
      review
    );
    setVerificationResult(result);
  };

  const handleQuickFillOtp = () => {
    if (activeShipment) {
      setOtpInput(activeShipment.deliveryOtp);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16 animate-fade-in">
      {/* Portal Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" /> Aktor: Penerima (Receiver Verification Portal)
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">
          Portal Konfirmasi Penerimaan Paket
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-xl">
          Tautan aman serah terima paket ekspedisi darat. Lindungi pengiriman dengan verifikasi kode
          OTP 6-digit sebelum kurir menyerahkan barang.
        </p>

        {/* Resi Switcher for Demo */}
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-emerald-200">Pilih Paket Uji:</span>
          {shipments.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedResi(s.resiNumber);
                setOtpInput('');
                setVerificationResult(null);
                setReceivedBy(s.receiver.contactName);
              }}
              className={`px-3 py-1 rounded-lg font-mono font-bold transition ${
                selectedResi === s.resiNumber
                  ? 'bg-emerald-400 text-slate-950 shadow'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {s.resiNumber} ({s.status})
            </button>
          ))}
        </div>
      </div>

      {activeShipment ? (
        <div className="space-y-6">
          {/* Card Summary Paket */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-600" />
                <span className="font-mono font-black text-slate-900 text-base">
                  {activeShipment.resiNumber}
                </span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  activeShipment.status === 'DELIVERED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-orange-100 text-orange-800'
                }`}
              >
                Status: {activeShipment.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">PENGIRIM</span>
                <div className="font-bold text-slate-900">{activeShipment.sender.contactName}</div>
                <div className="text-slate-600">{activeShipment.sender.city}</div>
                <div className="text-slate-500 text-[11px] line-clamp-1">{activeShipment.sender.address}</div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">PENERIMA (ANDA)</span>
                <div className="font-bold text-slate-900">{activeShipment.receiver.contactName}</div>
                <div className="text-slate-600">{activeShipment.receiver.city}</div>
                <div className="text-slate-500 text-[11px] line-clamp-1">{activeShipment.receiver.address}</div>
              </div>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <span>
                  Kurir Ditugaskan:{' '}
                  <strong>{activeShipment.assignedCourier?.name || 'Petugas Shuttle'}</strong> (
                  {activeShipment.assignedCourier?.plateNumber || 'Armada Box'})
                </span>
              </div>
              <span className="font-bold text-blue-700">{activeShipment.service.serviceName}</span>
            </div>
          </div>

          {/* Form Input OTP 6-Digit */}
          {activeShipment.status !== 'DELIVERED' ? (
            <div className="bg-white rounded-2xl border-2 border-emerald-500/80 p-6 sm:p-8 shadow-md space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="font-black text-xl text-slate-900">
                  Verifikasi Kode OTP Serah Terima
                </h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Masukkan 6-digit kode OTP rahasia yang telah dikirimkan ke WhatsApp/SMS nomor{' '}
                  <strong className="text-slate-700">{activeShipment.receiver.contactPhone}</strong>.
                </p>

                {/* Demo Helper Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleQuickFillOtp}
                    className="text-[11px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 font-bold px-3 py-1 rounded-full transition inline-flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> [Simulasi Auto-Fill OTP Demo: {activeShipment.deliveryOtp}]
                  </button>
                </div>
              </div>

              <form onSubmit={handleVerify} className="space-y-6 max-w-md mx-auto">
                <div>
                  <label className="text-xs font-bold text-slate-700 text-center block mb-2 uppercase tracking-wider">
                    6-Digit Kode OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full text-center font-mono font-black text-2xl tracking-[0.5em] py-3.5 bg-slate-50 border-2 border-slate-300 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nama Penerima / Yang Menerima
                  </label>
                  <input
                    type="text"
                    value={receivedBy}
                    onChange={(e) => setReceivedBy(e.target.value)}
                    className="w-full text-xs font-medium px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Contoh: Diterima oleh Satpam / Sendiri"
                  />
                </div>

                {/* Rating & Ulasan Section */}
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <label className="text-xs font-bold text-slate-700 block">
                    Rating Pelayanan Kurir & Ekspedisi
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2 font-mono">
                      {rating} / 5 Bintang
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      Ulasan / Catatan Penerimaan
                    </label>
                    <textarea
                      rows={2}
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                      placeholder="Tulis ulasan Anda mengenai kecepatan & kondisi barang..."
                    />
                  </div>

                  {/* Foto Bukti Serah Terima (Proof of Delivery / POD) */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-slate-500" /> Foto Bukti Serah Terima (POD)
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold">Tersimpan</span>
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <img
                        src={podPhotoUrl}
                        alt="Bukti Serah Terima"
                        className="w-16 h-16 object-cover rounded-lg border border-slate-300 shadow-sm"
                      />
                      <div className="text-xs text-slate-500">
                        <p className="font-semibold text-slate-800">Foto Bukti Penerimaan Barang</p>
                        <p className="text-[10px] text-slate-400">Geotagged & Timestamped otomatis</p>
                      </div>
                    </div>
                  </div>
                </div>

                {verificationResult && (
                  <div
                    className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
                      verificationResult.success
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : 'bg-red-50 text-red-800 border border-red-300'
                    }`}
                  >
                    {verificationResult.success ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                    )}
                    <span>{verificationResult.message}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition hover:scale-[1.02]"
                >
                  <CheckCircle2 className="w-5 h-5" /> [Verifikasi & Konfirmasi Penerimaan Terdekat]
                </button>
              </form>
            </div>
          ) : (
            /* Sudah Diterima Banner */
            <div className="bg-emerald-50 rounded-2xl border-2 border-emerald-400 p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-emerald-950">
                Paket Resmi Diterima & Terverifikasi!
              </h2>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                Status pengiriman telah diubah menjadi <strong>DELIVERED</strong>. Notifikasi berhasil
                dikirimkan secara asinkron kepada pihak Pengirim.
              </p>

              {activeShipment.proofOfDelivery && (
                <div className="bg-white p-5 rounded-xl border border-emerald-200 text-xs text-left max-w-md mx-auto space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Diterima oleh:</span>
                    <strong className="text-slate-900">
                      {activeShipment.proofOfDelivery.receivedBy}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Waktu Verifikasi:</span>
                    <span className="font-mono text-slate-700">
                      {activeShipment.proofOfDelivery.verifiedAt}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Rating Diberikan:</span>
                    <span className="text-amber-500 font-bold flex items-center gap-0.5">
                      ★ {activeShipment.proofOfDelivery.rating} / 5
                    </span>
                  </div>
                  {activeShipment.proofOfDelivery.review && (
                    <div className="pt-2 border-t border-slate-100 text-slate-600 italic">
                      "{activeShipment.proofOfDelivery.review}"
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
          Pilih salah satu nomor resi di atas untuk membuka portal verifikasi OTP penerima.
        </div>
      )}
    </div>
  );
};
