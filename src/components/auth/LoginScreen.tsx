import React, { useState } from 'react';
import { useShipment } from '../../context/ShipmentContext';
import { PRESET_ACCOUNTS, AuthUser } from '../../types/auth';
import { UserRole } from '../../types/shipment';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Building2,
  Shield,
  User,
  ArrowLeft,
  Truck,
  Layers,
  FileCheck,
} from 'lucide-react';

interface LoginScreenProps {
  onSuccessRedirect: (role: UserRole) => void;
  onCancelGuest: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onSuccessRedirect,
  onCancelGuest,
}) => {
  const { login } = useShipment();

  const [selectedRole, setSelectedRole] = useState<UserRole>('CUSTOMER');
  const [emailInput, setEmailInput] = useState<string>('hendra.gunawan@perusahaan.co.id');
  const [passwordInput, setPasswordInput] = useState<string>('password123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const roleConfigs = [
    {
      role: 'CUSTOMER' as UserRole,
      label: 'Pelanggan Bisnis',
      badge: 'B2B Shipper',
      icon: User,
      desc: 'Buat order pengiriman, cetak resi termal, & bayar invoice',
    },
    {
      role: 'COURIER' as UserRole,
      label: 'Kurir Lapangan',
      badge: 'Courier App',
      icon: Smartphone,
      desc: 'Terima tugas pickup, scan barcode, & serah terima OTP',
    },
    {
      role: 'HUB_STAFF' as UserRole,
      label: 'Petugas Hub',
      badge: 'Hub Console',
      icon: Building2,
      desc: 'Inbound scanner gun, sortir kargo, & rilis manifest',
    },
    {
      role: 'ADMIN' as UserRole,
      label: 'Administrator',
      badge: 'Admin Console',
      icon: Shield,
      desc: 'Live operations map, KPI dashboard, & master data',
    },
  ];

  const handleSelectRoleTab = (role: UserRole) => {
    setSelectedRole(role);
    const matchedAccount = PRESET_ACCOUNTS.find((a) => a.role === role);
    if (matchedAccount) {
      setEmailInput(matchedAccount.email);
      setPasswordInput('password123');
    }
    setErrorMessage(null);
  };

  const handleQuickLogin = (account: AuthUser) => {
    setSelectedRole(account.role);
    setEmailInput(account.email);
    setPasswordInput('password123');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      login(account);
      onSuccessRedirect(account.role);
    }, 400);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setErrorMessage('Mohon lengkapi email dan password Anda.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsLoading(false);
      const matched =
        PRESET_ACCOUNTS.find((a) => a.email.toLowerCase() === emailInput.toLowerCase()) ||
        PRESET_ACCOUNTS.find((a) => a.role === selectedRole) ||
        PRESET_ACCOUNTS[0];

      login(matched);
      onSuccessRedirect(matched.role);
    }, 500);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-2 sm:px-4 animate-fade-in">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Brand Visual & Features (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Speed Lines & Patterns like eshipment.org */}
          <div className="absolute -bottom-10 -left-10 w-80 h-80 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-60 h-60 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="flex flex-col gap-[3px] mr-1">
                <div className="w-7 h-[3px] bg-emerald-400 rounded-full" />
                <div className="w-5 h-[3px] bg-emerald-500 rounded-full" />
                <div className="w-6 h-[3px] bg-emerald-600 rounded-full" />
              </div>
              <div>
                <span className="font-black text-2xl tracking-tighter">e-shipment</span>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 ml-1.5">
                  .org
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                Cloud Shipping OS
              </span>
              <h2 className="text-2xl sm:text-3xl font-black leading-snug">
                Portal Akses Terintegrasi Logistik Ekspedisi Darat
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Platform terpusat untuk pelanggan bisnis, armada kurir, stasiun hub transit, dan monitoring operasional real-time.
              </p>
            </div>

            {/* Feature Checklist */}
            <div className="space-y-2.5 pt-2 text-xs text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Auto-Dispatching Kurir Terdekat & Routing Maps</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Barcode Gun & Pembuatan Manifest Antar-Hub</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Verifikasi OTP 6-Digit & Bukti Serah Terima (POD)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Label Termal Standar A6 Barcode Code-128 & QR</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>© 2026 e-shipment.org</span>
            <span className="font-mono text-emerald-400">v2.4 Enterprise</span>
          </div>
        </div>

        {/* Right Side: Login Form (7 Cols) */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Masuk ke Portal</h3>
                <p className="text-xs text-slate-500 mt-0.5">Pilih peran akun Anda atau gunakan akses instan demo</p>
              </div>
              <button
                type="button"
                onClick={onCancelGuest}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Beranda Publik
              </button>
            </div>

            {/* Role Selection Tabs */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Pilih Peran Akses Sistem:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {roleConfigs.map((cfg) => {
                  const Icon = cfg.icon;
                  const isSelected = selectedRole === cfg.role;
                  return (
                    <button
                      key={cfg.role}
                      type="button"
                      onClick={() => handleSelectRoleTab(cfg.role)}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between min-h-[72px] ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs ring-1 ring-emerald-500'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`} />
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-emerald-200/80 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                          {cfg.badge}
                        </span>
                      </div>
                      <span className="text-xs font-bold leading-tight mt-1">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick 1-Click Login Cards */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Masuk Cepat 1-Klik (Akun Uji Coba):
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Auto-fill & Auth</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {PRESET_ACCOUNTS.map((acc) => {
                  const isCurrentRole = acc.role === selectedRole;
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleQuickLogin(acc)}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2.5 ${
                        isCurrentRole
                          ? 'border-emerald-500 bg-white text-emerald-950 font-bold shadow-xs'
                          : 'border-slate-200 bg-white/70 hover:bg-white text-slate-700'
                      }`}
                    >
                      <img
                        src={acc.avatarUrl}
                        alt={acc.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs truncate font-bold leading-tight text-slate-900">
                          {acc.name.split('(')[0]}
                        </div>
                        <div className="text-[10px] text-emerald-700 truncate font-semibold">
                          {acc.role} • {acc.email}
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Standard Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Alamat Email / ID Pengguna
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="nama@eshipment.org"
                    className="w-full text-xs font-semibold pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Kata Sandi (Password)
                  </label>
                  <span className="text-[11px] text-emerald-700 hover:underline cursor-pointer">
                    Lupa Password?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs font-semibold pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-700/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <span>Mengautentikasi Kredensial JWT...</span>
                ) : (
                  <>
                    <span>Masuk ke Portal {selectedRole}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tidak perlu login untuk cek tarif atau lacak status resi.</span>
            <button
              type="button"
              onClick={onCancelGuest}
              className="font-bold text-emerald-700 hover:underline"
            >
              Lanjut sebagai Pengunjung &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
