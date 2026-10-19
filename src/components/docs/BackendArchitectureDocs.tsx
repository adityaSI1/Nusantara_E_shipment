import React, { useState } from 'react';
import { useShipment } from '../../context/ShipmentContext';
import {
  Code2,
  Server,
  FileCode,
  Terminal,
  Database,
  Shield,
  Layers,
  ArrowRight,
  CheckCircle2,
  Send,
  Zap,
  Play,
  Copy,
  Check,
  BookOpen,
} from 'lucide-react';

export const BackendArchitectureDocs: React.FC = () => {
  const { shipments, couriers } = useShipment();
  const [activeDocTab, setActiveDocTab] = useState<'ARCHITECTURE' | 'ENDPOINTS_DTO' | 'ALGORITHMS' | 'LIVE_TESTER'>('ARCHITECTURE');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Interactive Live API Tester State
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('POST_CALCULATE_TARIFF');
  const [apiRequestBody, setApiRequestBody] = useState<string>(
    JSON.stringify(
      {
        origin: { city: 'Malang', lat: -7.9528, lng: 112.5938 },
        destination: { city: 'Surabaya', lat: -7.2575, lng: 112.7521 },
        package: {
          weightKg: 5.0,
          dimensions: { lengthCm: 35, widthCm: 25, heightCm: 20 },
          declaredValueRp: 2500000,
          isInsured: true,
        },
      },
      null,
      2
    )
  );
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [apiLoading, setApiLoading] = useState<boolean>(false);

  const handleCopyCode = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunApiTest = () => {
    setApiLoading(true);
    setTimeout(() => {
      setApiLoading(false);

      if (selectedEndpoint === 'POST_CALCULATE_TARIFF') {
        setApiResponse(
          JSON.stringify(
            {
              statusCode: 200,
              message: 'Kalkulasi tarif darat berhasil dihitung via Maps API',
              data: {
                distanceKm: 94,
                chargeableWeightKg: 5.0,
                volumetricWeightKg: 3.5,
                services: [
                  {
                    serviceCode: 'EXP_DARAT',
                    name: 'Nusantara Kilat Darat (Express)',
                    estimatedHours: '6 - 12 Jam',
                    baseRate: 18000,
                    distanceCost: 61100,
                    weightCost: 70000,
                    insuranceCost: 5000,
                    adminFee: 2500,
                    totalTariffRp: 156600,
                  },
                  {
                    serviceCode: 'REG_DARAT',
                    name: 'Nusantara Reguler Darat',
                    estimatedHours: '1 - 2 Hari',
                    baseRate: 10000,
                    distanceCost: 37600,
                    weightCost: 45000,
                    insuranceCost: 5000,
                    adminFee: 1500,
                    totalTariffRp: 99100,
                  },
                ],
              },
            },
            null,
            2
          )
        );
      } else if (selectedEndpoint === 'POST_CREATE_SHIPMENT') {
        setApiResponse(
          JSON.stringify(
            {
              statusCode: 201,
              message: 'Shipment created, auto-assigned courier, and resi generated',
              data: {
                resiNumber: 'NC-202610-84920',
                status: 'UNPAID',
                assignedCourier: {
                  id: 'courier-01',
                  name: 'Dimas Wicaksono',
                  plateNumber: 'N 4821 AC (Blind Van)',
                  distanceToPickupKm: 2.1,
                },
                paymentDetails: {
                  amountRp: 156600,
                  virtualAccount: '88092-8492099',
                  expiresAt: '2026-10-18T20:30:00.000Z',
                },
                receiverOtpGenerated: true,
                eventsTriggered: ['NOTIFICATION_SENT_WHATSAPP', 'AUTO_DISPATCH_SCHEDULED'],
              },
            },
            null,
            2
          )
        );
      } else if (selectedEndpoint === 'POST_VERIFY_OTP') {
        setApiResponse(
          JSON.stringify(
            {
              statusCode: 200,
              message: 'Verifikasi OTP berhasil. Paket resmi diserahterimakan.',
              data: {
                resiNumber: 'NC-202610-84920',
                status: 'DELIVERED',
                receivedBy: 'PT Mandiri Solusi Logistik',
                verifiedAt: new Date().toISOString(),
                proofOfDeliverySaved: true,
                ratingSaved: 5,
              },
            },
            null,
            2
          )
        );
      } else {
        setApiResponse(
          JSON.stringify(
            {
              statusCode: 200,
              message: 'Endpoint test simulation executed successfully',
              timestamp: new Date().toISOString(),
            },
            null,
            2
          )
        );
      }
    }, 400);
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      {/* Banner Arsitektur Enterprise e-Shipment */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
            Dokumentasi Teknis Platform • e-shipment.org
          </span>
          <span className="text-xs text-slate-400">Arsitektur Ekspedisi Darat Enterprise</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">
          Arsitektur Backend, RESTful API, & Business Logic Services
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
          Dokumentasi teknis formal arsitektur sistem E-Shipment ekspedisi darat dengan fitur utama{' '}
          <strong className="text-emerald-400">Send-Receive Automatic</strong>, integrasi Google Maps Platform,
          algoritma penugasan kurir terdekat otomatis, dan event-driven notification queue.
        </p>

        {/* Navigation Subtabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-bold">
          {[
            { id: 'ARCHITECTURE', label: '1. Arsitektur & Service Layer', icon: Layers },
            { id: 'ENDPOINTS_DTO', label: '2. REST API & Skema DTO', icon: Server },
            { id: 'ALGORITHMS', label: '3. Pseudocode Algoritma Otomatisasi', icon: FileCode },
            { id: 'LIVE_TESTER', label: '4. Interactive API Playground', icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeDocTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveDocTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: ARSITEKTUR & SERVICE LAYER */}
      {activeDocTab === 'ARCHITECTURE' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* RBAC & Middleware Guard */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Shield className="w-5 h-5 text-indigo-600" />
                <span>1. Autentikasi & Otorisasi RBAC (Role-Based Access Control)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Setiap endpoint dilindungi oleh JWT (JSON Web Token) bearer authorization header dengan
                middleware Role Guard bertingkat:
              </p>
              <div className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-slate-200 space-y-1">
                <div><span className="text-blue-400">const</span> Roles = &#123;</div>
                <div className="pl-4">GUEST: <span className="text-emerald-400">'GUEST'</span>, <span className="text-slate-500">// Cek Tarif, Lacak Resi Publik</span></div>
                <div className="pl-4">CUSTOMER: <span className="text-emerald-400">'CUSTOMER'</span>, <span className="text-slate-500">// Buat Shipment, Bayar, Cetak Label</span></div>
                <div className="pl-4">COURIER: <span className="text-emerald-400">'COURIER'</span>, <span className="text-slate-500">// Terima Task, Update Pickup, Gagal Antar</span></div>
                <div className="pl-4">HUB_STAFF: <span className="text-emerald-400">'HUB_STAFF'</span>, <span className="text-slate-500">// Inbound Gun Scan, Outbound Manifest</span></div>
                <div className="pl-4">ADMIN: <span className="text-emerald-400">'ADMIN'</span>, <span className="text-slate-500">// Override Kurir, Master CRUD, GIS</span></div>
                <div>&#125;;</div>
              </div>
            </div>

            {/* Service Layer Architecture */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Server className="w-5 h-5 text-orange-600" />
                <span>2. Core Services & Domain Layer</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>AutoDispatchService:</strong> Menghitung matriks jarak kurir terdekat menggunakan formula Haversine + bobot antrean tugas kurir aktif.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>TariffCalculationService:</strong> Integrasi Maps API Distance Matrix untuk rute jalan darat x tarif per-kg dan aturan volumetrik darat (P x L x T) / 5000.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>NotificationQueueWorker:</strong> Event-driven asynchronous worker berbasis Redis/BullMQ untuk pengiriman notifikasi WhatsApp & SMS instan.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Boilerplate Code Block Express / NestJS */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-mono text-orange-400 font-bold">
                <FileCode className="w-4 h-4" /> server/routes/shipment.controller.ts (Express / NestJS Standard)
              </div>
              <button
                onClick={() =>
                  handleCopyCode(
                    `// Controller Snippet for Core Send-Receive Automatic\nrouter.post('/shipments', authenticateJwt, roleGuard(['CUSTOMER']), shipmentController.create);`,
                    'controller_code'
                  )
                }
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono"
              >
                {copiedKey === 'controller_code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Salin Boilerplate
              </button>
            </div>
            <pre className="text-xs font-mono text-slate-300 overflow-x-auto p-2 leading-relaxed">
{`import { Router, Request, Response } from 'express';
import { authenticateJwt, roleGuard } from '../middlewares/auth.middleware';
import { ShipmentService } from '../services/shipment.service';
import { AutoDispatchService } from '../services/auto-dispatch.service';
import { NotificationEventWorker } from '../workers/notification.worker';

const router = Router();

// POST /api/v1/shipments: Core Send-Receive Automatic
router.post('/shipments', authenticateJwt, roleGuard(['CUSTOMER']), async (req: Request, res: Response) => {
  try {
    // 1. <<include>> Hitung Tarif
    const tariff = await ShipmentService.calculateRate(req.body);

    // 2. <<include>> Generate Resi Unik Otomatis
    const resiNumber = ShipmentService.generateResi();

    // 3. Simpan data pengiriman ke database
    const shipment = await ShipmentService.create({ ...req.body, resiNumber, tariff });

    // 4. <<include>> Tugaskan Kurir Otomatis (Background Job / Auto-Dispatch)
    const assignedCourier = await AutoDispatchService.assignNearestCourier(shipment.id);

    // 5. <<include>> Kirim Notifikasi Async Event via Queue
    await NotificationEventWorker.enqueue({
      eventType: 'ORDER_CREATED',
      resiNumber,
      recipient: shipment.sender.phone,
      channel: 'WHATSAPP'
    });

    return res.status(201).json({ success: true, data: { shipment, assignedCourier } });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;`}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 2: REST API ENDPOINTS & SKEMA DTO */}
      {activeDocTab === 'ENDPOINTS_DTO' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Katalog Endpoint RESTful API v1 (E-Shipment Ekspedisi Darat)
            </h3>

            <div className="space-y-4 text-xs">
              {[
                {
                  method: 'POST',
                  path: '/api/v1/tariffs/calculate',
                  desc: 'Kalkulasi tarif darat (Maps API jarak km x berat kg + volumetrik)',
                  role: 'PUBLIC (Guest & Customer)',
                  dtoRequest: `{ "originCity": "Malang", "destinationCity": "Surabaya", "weightKg": 5.0, "dimensions": { "l": 35, "w": 25, "h": 20 }, "isInsured": true }`,
                  dtoResponse: `{ "distanceKm": 94, "rates": [{ "service": "EXPRESS", "totalCost": 156600 }, { "service": "REGULER", "totalCost": 99100 }] }`,
                },
                {
                  method: 'POST',
                  path: '/api/v1/shipments',
                  desc: 'Buat pengiriman baru (memanggil <<include>> Generate Resi, <<include>> Tugaskan Kurir Otomatis)',
                  role: 'CUSTOMER',
                  dtoRequest: `{ "sender": { "name": "...", "lat": -7.952, "lng": 112.593 }, "receiver": { "name": "...", "phone": "..." }, "serviceType": "EXPRESS" }`,
                  dtoResponse: `{ "resiNumber": "NC-202610-84920", "status": "UNPAID", "assignedCourier": "courier-01", "payment": { "amount": 156600 } }`,
                },
                {
                  method: 'GET',
                  path: '/api/v1/shipments/track/:resi',
                  desc: 'Pelacakan publik status paket & vertical stepper timeline',
                  role: 'PUBLIC (Guest, Receiver, Sender)',
                  dtoRequest: `No body (URL Param :resi = NC-202610-84920)`,
                  dtoResponse: `{ "resi": "NC-202610-84920", "status": "OUT_FOR_DELIVERY", "timeline": [ { "status": "READY_FOR_PICKUP", "timestamp": "..." } ] }`,
                },
                {
                  method: 'POST',
                  path: '/api/v1/payments/webhook',
                  desc: 'Callback Payment Gateway (transisi status UNPAID -> READY_FOR_PICKUP)',
                  role: 'PAYMENT_GATEWAY_WEBHOOK',
                  dtoRequest: `{ "transaction_id": "TRX-9981", "order_id": "shp-101", "payment_status": "PAID" }`,
                  dtoResponse: `{ "acknowledged": true, "new_status": "READY_FOR_PICKUP" }`,
                },
                {
                  method: 'PATCH',
                  path: '/api/v1/courier/tasks/:id/status',
                  desc: 'Update status kurir (PICKED_UP / OUT_FOR_DELIVERY) + trigger Notifikasi',
                  role: 'COURIER',
                  dtoRequest: `{ "status": "PICKED_UP", "notes": "Paket diterima di alamat pengirim", "currentLat": -7.954, "currentLng": 112.598 }`,
                  dtoResponse: `{ "success": true, "status": "PICKED_UP", "notificationSent": true }`,
                },
                {
                  method: 'POST',
                  path: '/api/v1/courier/tasks/:id/fail',
                  desc: 'Laporan Gagal Antar (Extend Update Status: dropdown alasan, foto lokasi, notifikasi)',
                  role: 'COURIER',
                  dtoRequest: `{ "reason": "Rumah Kosong / Penerima Tidak di Tempat", "photoUrl": "https://...", "notes": "Pagar digembok" }`,
                  dtoResponse: `{ "success": true, "status": "DELIVERY_FAILED", "rescheduleScheduled": true }`,
                },
                {
                  method: 'POST',
                  path: '/api/v1/hub/inbound & /outbound',
                  desc: 'Inbound scanner gun / Outbound manifest transit rute darat',
                  role: 'HUB_STAFF',
                  dtoRequest: `{ "hubId": "hub-mlg", "resiList": ["NC-202610-84920"], "vehiclePlate": "N 8920 EF", "driver": "Slamet" }`,
                  dtoResponse: `{ "manifestId": "MNF-849102", "status": "IN_TRANSIT", "packagesUpdated": 1 }`,
                },
                {
                  method: 'POST',
                  path: '/api/v1/verification/verify-otp',
                  desc: 'Konfirmasi Penerima (<<include>> Verifikasi OTP 6-Digit -> Status DELIVERED)',
                  role: 'PUBLIC (Receiver)',
                  dtoRequest: `{ "resi": "NC-202610-84920", "otp": "749201", "receivedBy": "Ibu Melani", "rating": 5, "review": "Sangat cepat" }`,
                  dtoResponse: `{ "verified": true, "status": "DELIVERED", "message": "Paket berhasil diserahterimakan" }`,
                },
              ].map((ep, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono font-bold px-2.5 py-0.5 rounded text-[10px] ${
                          ep.method === 'POST'
                            ? 'bg-emerald-600 text-white'
                            : ep.method === 'GET'
                            ? 'bg-blue-600 text-white'
                            : 'bg-amber-600 text-white'
                        }`}
                      >
                        {ep.method}
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-xs">{ep.path}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      Role: {ep.role}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs">{ep.desc}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                    <div className="bg-white p-2 rounded border border-slate-200 text-slate-700">
                      <span className="text-[9px] text-slate-400 block font-bold font-sans">REQUEST DTO:</span>
                      <div className="truncate">{ep.dtoRequest}</div>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200 text-emerald-800">
                      <span className="text-[9px] text-slate-400 block font-bold font-sans">RESPONSE DTO:</span>
                      <div className="truncate">{ep.dtoResponse}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PSEUDOCODE ALGORITMA OTOMATISASI */}
      {activeDocTab === 'ALGORITHMS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Algorithm 1: Tugaskan Kurir Otomatis */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <Zap className="w-5 h-5 text-orange-600" />
              <span>Algoritma: Tugaskan Kurir Otomatis (Auto-Dispatch)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Algoritma mengevaluasi seluruh armada kurir yang berstatus aktif (online) dengan formula jarak
              Haversine (km) dan penalti beban antrean aktif (workload factor):
            </p>

            <div className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-slate-200 overflow-x-auto space-y-1">
              <div className="text-slate-500">// Pseudocode Auto-Dispatch Kurir Terdekat</div>
              <div><span className="text-purple-400">FUNCTION</span> assignNearestCourier(pickupLat, pickupLng):</div>
              <div className="pl-4">activeCouriers = DB.couriers.find(&#123; isActive: true &#125;)</div>
              <div className="pl-4">minScore = INFINITY</div>
              <div className="pl-4">selectedCourier = NULL</div>
              <div className="pl-4 mt-1"><span className="text-purple-400">FOR EACH</span> courier <span className="text-purple-400">IN</span> activeCouriers:</div>
              <div className="pl-8">distanceKm = haversine(pickupLat, pickupLng, courier.lat, courier.lng)</div>
              <div className="pl-8 text-amber-300">// Score = Jarak (km) * 1.0 + ActiveTasks * 3.0 (penalti beban)</div>
              <div className="pl-8">score = (distanceKm * 1.0) + (courier.activeTasks * 3.0)</div>
              <div className="pl-8"><span className="text-purple-400">IF</span> score &lt; minScore <span className="text-purple-400">THEN</span></div>
              <div className="pl-12">minScore = score</div>
              <div className="pl-12">selectedCourier = courier</div>
              <div className="pl-8"><span className="text-purple-400">END IF</span></div>
              <div className="pl-4"><span className="text-purple-400">END FOR</span></div>
              <div className="pl-4 mt-1"><span className="text-purple-400">RETURN</span> selectedCourier</div>
              <div><span className="text-purple-400">END FUNCTION</span></div>
            </div>
          </div>

          {/* Algorithm 2: Async Event Notification Queue */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <Send className="w-5 h-5 text-emerald-600" />
              <span>Algoritma: Kirim Notifikasi Async Event (Queue Worker)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Menerapkan pattern Event-Driven Producer-Consumer dengan Redis / BullMQ untuk menjamin tidak
              ada blocking I/O pada HTTP request thread saat mengirimkan pesan WhatsApp / SMS:
            </p>

            <div className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-slate-200 overflow-x-auto space-y-1">
              <div className="text-slate-500">// Event-Driven Worker Pattern</div>
              <div><span className="text-purple-400">CLASS</span> NotificationQueueWorker:</div>
              <div className="pl-4">queue = <span className="text-purple-400">new</span> Queue('shipment-notifications', redisConfig)</div>
              <div className="pl-4 mt-1"><span className="text-purple-400">ASYNC FUNCTION</span> emitEvent(eventType, payload):</div>
              <div className="pl-8">job = <span className="text-purple-400">await</span> queue.add(eventType, payload, &#123;</div>
              <div className="pl-12">attempts: 3,</div>
              <div className="pl-12">backoff: &#123; type: 'exponential', delay: 2000 &#125;</div>
              <div className="pl-8">&#125;)</div>
              <div className="pl-8"><span className="text-purple-400">RETURN</span> job.id</div>
              <div className="pl-4"><span className="text-purple-400">END FUNCTION</span></div>
              <div className="pl-4 mt-1"><span className="text-purple-400">FUNCTION</span> processJobs():</div>
              <div className="pl-8">queue.process(<span className="text-purple-400">ASYNC</span> (job) =&gt; &#123;</div>
              <div className="pl-12">template = renderMessage(job.data.eventType, job.data)</div>
              <div className="pl-12"><span className="text-purple-400">AWAIT</span> whatsappProvider.send(job.data.phone, template)</div>
              <div className="pl-8">&#125;)</div>
              <div className="pl-4"><span className="text-purple-400">END FUNCTION</span></div>
              <div><span className="text-purple-400">END CLASS</span></div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INTERACTIVE LIVE API PLAYGROUND */}
      {activeDocTab === 'LIVE_TESTER' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900">
                Interactive API Playground (Live Console)
              </h3>
              <p className="text-xs text-slate-500">
                Uji langsung payload request dan response JSON untuk endpoint arsitektur E-Shipment
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedEndpoint}
                onChange={(e) => setSelectedEndpoint(e.target.value)}
                className="text-xs font-bold px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl"
              >
                <option value="POST_CALCULATE_TARIFF">POST /api/v1/tariffs/calculate</option>
                <option value="POST_CREATE_SHIPMENT">POST /api/v1/shipments</option>
                <option value="POST_VERIFY_OTP">POST /api/v1/verification/verify-otp</option>
              </select>
              <button
                disabled={apiLoading}
                onClick={handleRunApiTest}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow"
              >
                <Play className="w-3.5 h-3.5" /> {apiLoading ? 'Testing...' : 'Kirim Request'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Request Editor */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Request JSON Payload:
              </label>
              <textarea
                rows={12}
                value={apiRequestBody}
                onChange={(e) => setApiRequestBody(e.target.value)}
                className="w-full font-mono text-xs p-4 bg-slate-950 text-emerald-400 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Response Viewer */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Response JSON Output:
              </label>
              <pre className="w-full font-mono text-xs p-4 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 min-h-[240px] overflow-x-auto leading-relaxed">
                {apiResponse || '// Tekan tombol [Kirim Request] untuk menjalankan simulasi HTTP handler'}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
