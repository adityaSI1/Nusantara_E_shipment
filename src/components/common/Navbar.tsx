import React from 'react';
import { useShipment } from '../../context/ShipmentContext';
import {
  Lock,
  LogOut,
  PlayCircle,
  Shield,
  Smartphone,
  Building2,
  Package,
  CheckCircle2,
  Code2,
  Globe,
  Mail,
  MapPin,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenDemoFlowModal: () => void;
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenDemoFlowModal,
  onOpenLogin,
}) => {
  const { currentUser, logout, setRole } = useShipment();

  const portals = [
    { id: 'GUEST', label: 'Home / Cek Tarif', icon: Globe },
    { id: 'CUSTOMER', label: 'Customer Portal', icon: Package },
    { id: 'COURIER', label: 'Courier Dispatch', icon: Smartphone },
    { id: 'HUB_STAFF', label: 'Hub Station', icon: Building2 },
    { id: 'ADMIN', label: 'Admin Operations', icon: Shield },
    { id: 'RECEIVER', label: 'Receiver (OTP)', icon: CheckCircle2 },
    { id: 'DOCS', label: 'API & Architecture', icon: Code2 },
  ];

  const handleSelectPortal = (portalId: string) => {
    setCurrentTab(portalId);
    if (['GUEST', 'CUSTOMER', 'COURIER', 'HUB_STAFF', 'ADMIN'].includes(portalId)) {
      setRole(portalId as any);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs">
      {/* Top Utility Bar (Modeled after eshipment.org) */}
      <div className="bg-slate-900 text-slate-300 text-[11px] px-4 sm:px-8 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-4 text-slate-300">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Jakarta & Surabaya Logistics Corridor</span>
          </span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-emerald-400" />
            <span>info@eshipment.org</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDemoFlowModal}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md text-[11px] shadow-xs transition"
          >
            <PlayCircle className="w-3.5 h-3.5 text-emerald-200" />
            <span>Simulasi Alur Pengiriman</span>
          </button>
          <div className="hidden sm:flex items-center gap-1 bg-slate-800 px-2 py-1 rounded text-[10px] text-slate-300">
            <Globe className="w-3 h-3 text-slate-400" />
            <span>ID / English</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand: e-shipment stylized logo matching eshipment.org */}
        <div
          onClick={() => handleSelectPortal('GUEST')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="flex flex-col">
            <div className="flex items-center gap-1 font-black text-xl tracking-tighter text-slate-900">
              {/* Green Speed Lines SVG like eshipment.org */}
              <div className="flex flex-col gap-[2px] mr-1">
                <div className="w-6 h-[3px] bg-emerald-500 rounded-full" />
                <div className="w-4 h-[3px] bg-emerald-600 rounded-full" />
                <div className="w-5 h-[3px] bg-emerald-700 rounded-full" />
              </div>
              <span>e-shipment</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 ml-1">
                .org
              </span>
            </div>
            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider -mt-0.5">
              Shipping Management System
            </span>
          </div>
        </div>

        {/* Separated Portals Ribbon (Clean & Professional) */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 overflow-x-auto">
          {portals.map((p) => {
            const Icon = p.icon;
            const isActive = currentTab === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPortal(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                  isActive
                    ? 'bg-white text-emerald-700 font-bold shadow-xs'
                    : 'hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* User Session & Login Button (Modeled after eshipment.org green login button) */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-300"
              />
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser.name.split('(')[0]}
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold font-mono">
                  {currentUser.role}
                </div>
              </div>
              <button
                onClick={logout}
                className="ml-2 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Keluar / Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                currentTab === 'LOGIN'
                  ? 'bg-emerald-900 text-white ring-2 ring-emerald-500'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Portal Selector Row */}
      <div className="lg:hidden px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center gap-1 overflow-x-auto text-xs no-scrollbar">
        {portals.map((p) => {
          const isActive = currentTab === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handleSelectPortal(p.id)}
              className={`px-2.5 py-1 rounded-lg shrink-0 font-bold ${
                isActive
                  ? 'bg-emerald-700 text-white'
                  : 'bg-white border border-slate-200 text-slate-700'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
