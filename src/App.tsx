/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShipmentProvider, useShipment } from './context/ShipmentContext';
import { Navbar } from './components/common/Navbar';
import { GuestLanding } from './components/guest/GuestLanding';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { ReceiverPortal } from './components/receiver/ReceiverPortal';
import { CourierMobileApp } from './components/courier/CourierMobileApp';
import { HubStationConsole } from './components/hub/HubStationConsole';
import { AdminOperations } from './components/admin/AdminOperations';
import { BackendArchitectureDocs } from './components/docs/BackendArchitectureDocs';
import { LoginScreen } from './components/auth/LoginScreen';
import { NotificationToastStream } from './components/common/NotificationToastStream';
import { DemoFlowModal } from './components/common/DemoFlowModal';
import { TariffCalculation, UserRole } from './types/shipment';
import {
  Truck,
  ArrowRight,
  Shield,
  Smartphone,
  Building2,
  Package,
  CheckCircle2,
  Code2,
  Mail,
  MapPin,
  Phone,
  Globe,
  ExternalLink,
  ChevronRight,
  LogOut,
  User,
} from 'lucide-react';

function AppContent() {
  const { role, setRole, currentUser, logout } = useShipment();
  const [currentTab, setCurrentTab] = useState<string>('GUEST');
  const [isDemoFlowModalOpen, setIsDemoFlowModalOpen] = useState<boolean>(false);

  // Pre-filled state when guest clicks [Pesan Pengiriman] on result card
  const [prefilledOrder, setPrefilledOrder] = useState<{
    originCity: string;
    destCity: string;
    weightKg: number;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
    selectedService: TariffCalculation;
  } | null>(null);

  const handleOrderFromGuest = (prefill: {
    originCity: string;
    destCity: string;
    weightKg: number;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
    selectedService: TariffCalculation;
  }) => {
    setPrefilledOrder(prefill);
    setCurrentTab('CUSTOMER');
    setRole('CUSTOMER');
  };

  const handleSwitchActor = (actorId: string) => {
    setCurrentTab(actorId);
    if (['GUEST', 'CUSTOMER', 'COURIER', 'HUB_STAFF', 'ADMIN'].includes(actorId)) {
      setRole(actorId as any);
    }
  };

  const handleLoginSuccess = (userRole: UserRole) => {
    if (userRole === 'COURIER') {
      setCurrentTab('COURIER');
    } else if (userRole === 'HUB_STAFF') {
      setCurrentTab('HUB_STAFF');
    } else if (userRole === 'ADMIN') {
      setCurrentTab('ADMIN');
    } else {
      setCurrentTab('CUSTOMER');
    }
  };

  const handleOpenLogin = () => {
    setCurrentTab('LOGIN');
  };

  const handleLogoutToGuest = () => {
    logout();
    setCurrentTab('GUEST');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Universal Top Navigation Header with Separated Portals */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenDemoFlowModal={() => setIsDemoFlowModalOpen(true)}
        onOpenLogin={handleOpenLogin}
      />

      {/* Portal Status Ribbon when inside an authenticated workspace */}
      {currentTab !== 'GUEST' && currentTab !== 'LOGIN' && currentTab !== 'DOCS' && (
        <div className="bg-slate-900 text-white border-b border-slate-800 text-xs py-2 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">Workspace Aktif:</span>
              <span className="font-bold text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                {currentTab === 'CUSTOMER' && '🏢 Portal Pelanggan / Shipper'}
                {currentTab === 'COURIER' && '🚚 Aplikasi Mobile Kurir'}
                {currentTab === 'HUB_STAFF' && '🏭 Stasiun Hub Transit'}
                {currentTab === 'ADMIN' && '🛡️ Pusat Operasional Admin'}
                {currentTab === 'RECEIVER' && '📦 Portal Konfirmasi Penerima (OTP)'}
              </span>
              {currentUser && (
                <span className="hidden sm:inline text-slate-300">
                  • Masuk sebagai: <strong className="text-emerald-400">{currentUser.name.split('(')[0]}</strong>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentTab('GUEST')}
                className="text-slate-300 hover:text-white hover:underline text-[11px] font-semibold"
              >
                &larr; Beranda Publik
              </button>
              <span className="text-slate-600">|</span>
              <button
                onClick={handleOpenLogin}
                className="text-emerald-400 hover:text-emerald-300 text-[11px] font-bold"
              >
                Ganti Akun / Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace: Completely Separated Screens per Portal */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-6">
        {currentTab === 'LOGIN' && (
          <LoginScreen
            onSuccessRedirect={handleLoginSuccess}
            onCancelGuest={() => setCurrentTab('GUEST')}
          />
        )}
        {currentTab === 'GUEST' && (
          <GuestLanding
            onOrderNow={handleOrderFromGuest}
            onOpenDemoFlow={() => setIsDemoFlowModalOpen(true)}
          />
        )}
        {currentTab === 'CUSTOMER' && (
          <CustomerDashboard
            prefilledOrder={prefilledOrder}
            onClearPrefilledOrder={() => setPrefilledOrder(null)}
            onOpenDemoFlow={() => setIsDemoFlowModalOpen(true)}
          />
        )}
        {currentTab === 'COURIER' && <CourierMobileApp />}
        {currentTab === 'HUB_STAFF' && <HubStationConsole />}
        {currentTab === 'ADMIN' && <AdminOperations />}
        {currentTab === 'RECEIVER' && <ReceiverPortal />}
        {currentTab === 'DOCS' && <BackendArchitectureDocs />}
      </main>

      {/* Real-Time Async Notification Toasts & Bell Queue */}
      <NotificationToastStream />

      {/* Interactive 1-Click End-to-End Demo Flow Modal */}
      <DemoFlowModal
        isOpen={isDemoFlowModalOpen}
        onClose={() => setIsDemoFlowModalOpen(false)}
        onSwitchActor={handleSwitchActor}
      />

      {/* Enterprise Corporate Footer Modeled After eshipment.org */}
      <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 pt-12 pb-8 px-4 sm:px-8 mt-20">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Column 1: Brand & Identity */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-[3px] mr-1">
                  <div className="w-6 h-[3px] bg-emerald-400 rounded-full" />
                  <div className="w-4 h-[3px] bg-emerald-500 rounded-full" />
                  <div className="w-5 h-[3px] bg-emerald-600 rounded-full" />
                </div>
                <span className="font-black text-2xl tracking-tighter text-white">e-shipment</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                  .org
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                Sistem operasi manajemen pengiriman dan ekspedisi darat berbasis cloud. Menghubungkan pesanan pelanggan,
                auto-dispatch armada, konsol hub transit, hingga konfirmasi penerimaan aman ber-OTP.
              </p>
              <div className="flex items-center gap-3 text-slate-300 text-xs font-mono">
                <span className="inline-flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Sistem Aktif 99.98%
                </span>
                <span>•</span>
                <span>Jakarta - Surabaya Corridor</span>
              </div>
            </div>

            {/* Column 2: Layanan & Solusi */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Layanan Ekspedisi</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button onClick={() => setCurrentTab('GUEST')} className="hover:text-emerald-400 transition">
                    Cek Tarif Ekspedisi Darat
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab('GUEST')} className="hover:text-emerald-400 transition">
                    Lacak Resi Real-Time
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab('CUSTOMER')} className="hover:text-emerald-400 transition">
                    Nusantara Express (Next Day)
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab('CUSTOMER')} className="hover:text-emerald-400 transition">
                    Cargo Truk FTL & LTL
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab('RECEIVER')} className="hover:text-emerald-400 transition">
                    Verifikasi OTP Penerima
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Portal & Aktor */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Akses Portal</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button onClick={() => setCurrentTab('CUSTOMER')} className="hover:text-emerald-400 transition">
                    Portal Pelanggan Bisnis
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab('COURIER')} className="hover:text-emerald-400 transition">
                    Aplikasi Mobile Kurir
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab('HUB_STAFF')} className="hover:text-emerald-400 transition">
                    Konsol Stasiun Hub
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab('ADMIN')} className="hover:text-emerald-400 transition">
                    Pusat Operasional Admin
                  </button>
                </li>
                <li>
                  <button onClick={handleOpenLogin} className="hover:text-emerald-400 transition font-bold text-emerald-400">
                    Masuk ke Akun Demo &rarr;
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Pengembang & Kontak */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Teknologi & API</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button onClick={() => setCurrentTab('DOCS')} className="hover:text-emerald-400 transition flex items-center gap-1">
                    <span>Dokumentasi RESTful API</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab('DOCS')} className="hover:text-emerald-400 transition">
                    Algoritma Auto-Dispatch
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab('DOCS')} className="hover:text-emerald-400 transition">
                    Event Queue Worker
                  </button>
                </li>
                <li>
                  <span className="text-slate-500">Integrasi Google Maps Platform</span>
                </li>
                <li>
                  <span className="text-slate-500">ISO 27001 & Data Protection</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright Row */}
          <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              © 2026 <strong>e-shipment.org</strong>. Hak Cipta Dilindungi Undang-Undang.
            </div>
            <div className="flex items-center gap-4">
              <span>Ketentuan Layanan</span>
              <span>•</span>
              <span>Kebijakan Privasi</span>
              <span>•</span>
              <span>SLA Pengiriman Darat</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ShipmentProvider>
      <AppContent />
    </ShipmentProvider>
  );
}
