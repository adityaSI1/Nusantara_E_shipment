import React, { useState } from 'react';
import { useShipment } from '../../context/ShipmentContext';
import { Bell, CheckCircle2, MessageSquare, Send, X, ExternalLink } from 'lucide-react';

export const NotificationToastStream: React.FC = () => {
  const { notifications, latestNotification, clearLatestNotification, setRole } = useShipment();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      {/* Floating Real-Time Toast for Async Notification Trigger */}
      {latestNotification && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-white rounded-2xl shadow-2xl border-2 border-emerald-500 overflow-hidden animate-bounce-short">
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              <span>Notifikasi Otomatis Terkirim ({latestNotification.channel})</span>
            </div>
            <button
              onClick={clearLatestNotification}
              className="text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-500 text-[11px]">
              <span className="font-semibold text-emerald-800">
                Penerima: {latestNotification.recipientType} ({latestNotification.recipientContact})
              </span>
              <span>{latestNotification.timestamp}</span>
            </div>
            <div className="font-bold text-slate-900">{latestNotification.subject}</div>
            <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] leading-relaxed font-mono">
              {latestNotification.message}
            </p>
            {latestNotification.message.includes('verify') && (
              <button
                onClick={() => {
                  setRole('GUEST'); // can navigate or switch to receiver portal
                  clearLatestNotification();
                }}
                className="w-full mt-2 py-1.5 px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-semibold text-center text-xs flex items-center justify-center gap-1 transition"
              >
                Buka Link Penerima <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Bell Trigger for Notification Log */}
      <div className="fixed bottom-4 left-4 z-30">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="relative bg-slate-900/90 hover:bg-slate-900 text-white px-3.5 py-2 rounded-full shadow-lg flex items-center gap-2 border border-slate-700/80 group transition text-xs font-semibold backdrop-blur-xs"
          title="Buka Event Log Notifikasi Async"
        >
          <Bell className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition" />
          <span className="hidden md:inline">Event Queue</span>
          {notifications.length > 0 && (
            <span className="bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {notifications.length}
            </span>
          )}
        </button>
      </div>

      {/* Notification Drawer Modal */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-slide-left">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm">Async Event Notification Log</h3>
                  <p className="text-[10px] text-slate-400">
                    Implementasi &lt;&lt;include&gt;&gt; Kirim Notifikasi via Event Worker (WhatsApp/SMS)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Belum ada log notifikasi yang terkirim.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-emerald-300 transition shadow-sm space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold font-mono text-[10px]">
                        {notif.channel} • {notif.recipientType}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{notif.timestamp}</span>
                    </div>
                    <div className="font-bold text-slate-900 text-xs">{notif.subject}</div>
                    <div className="text-slate-600 bg-white p-2.5 rounded border border-slate-200 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                      {notif.message}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                      <span>No. Resi: <strong className="font-mono text-slate-800">{notif.shipmentResi}</strong></span>
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Terkirim ke Worker
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-100 border-t border-slate-200 text-center text-[11px] text-slate-500">
              Event Worker Queue: Redis BullMQ / Cloud PubSub Architecture
            </div>
          </div>
        </div>
      )}
    </>
  );
};
