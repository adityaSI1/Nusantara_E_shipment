import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Shipment,
  TransitHub,
  Courier,
  TariffRateConfig,
  NotificationEvent,
  UserRole,
  ServiceType,
  ShipmentStatus,
  PaymentMethod,
  TariffCalculation,
  OutboundManifest,
} from '../types/shipment';
import {
  INITIAL_HUBS,
  INITIAL_COURIERS,
  INITIAL_TARIFF_RATES,
  INITIAL_SHIPMENTS,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';
import { AuthUser, PRESET_ACCOUNTS } from '../types/auth';

// Helper: Calculate Haversine distance between two coordinates in kilometers
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.max(1, Math.round(d));
}

// Generate 6-digit OTP
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate Resi Number: NC-YYYYMM-XXXXX
export function generateResiNumber(): string {
  const dateStr = '202610';
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `NC-${dateStr}-${randomNum}`;
}

interface ShipmentContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  shipments: Shipment[];
  hubs: TransitHub[];
  couriers: Courier[];
  tariffRates: TariffRateConfig[];
  notifications: NotificationEvent[];
  manifests: OutboundManifest[];
  latestNotification: NotificationEvent | null;
  clearLatestNotification: () => void;

  // Actions
  calculateTariff: (
    originCity: string,
    destCity: string,
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
    weightKg: number,
    lengthCm: number,
    widthCm: number,
    heightCm: number,
    declaredValueRp: number,
    isInsured: boolean
  ) => TariffCalculation[];

  createShipment: (params: {
    sender: Shipment['sender'];
    receiver: Shipment['receiver'];
    packageDetails: Shipment['packageDetails'];
    service: TariffCalculation;
  }) => Shipment;

  payShipment: (shipmentId: string, method: PaymentMethod) => void;
  cancelShipment: (shipmentId: string, reason: string) => void;

  // Courier Actions
  updateCourierStatus: (shipmentId: string, newStatus: ShipmentStatus, notes?: string) => void;
  reportCourierFailure: (shipmentId: string, reason: string, photoUrl: string, notes?: string) => void;

  // Hub Actions
  processHubInbound: (resiNumbers: string[], hubId: string, staffName: string) => void;
  createOutboundManifest: (
    originHubId: string,
    destinationHubId: string,
    resiNumbers: string[],
    vehiclePlate: string,
    driverName: string
  ) => OutboundManifest;

  // Receiver Actions
  verifyReceiverOtp: (
    resi: string,
    otp: string,
    receivedBy: string,
    photoUrl: string,
    rating: number,
    review?: string
  ) => { success: boolean; message: string };

  // Admin Actions
  reassignCourier: (shipmentId: string, newCourierId: string, reason: string) => void;
  addHub: (hub: TransitHub) => void;
  updateHub: (hub: TransitHub) => void;
  deleteHub: (id: string) => void;
  addCourier: (courier: Courier) => void;
  updateCourier: (courier: Courier) => void;
  deleteCourier: (id: string) => void;
  updateTariffRate: (tariff: TariffRateConfig) => void;
}

const ShipmentContext = createContext<ShipmentContextType | undefined>(undefined);

export const ShipmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<UserRole>('GUEST');
  const [shipments, setShipments] = useState<Shipment[]>(INITIAL_SHIPMENTS);
  const [hubs, setHubs] = useState<TransitHub[]>(INITIAL_HUBS);
  const [couriers, setCouriers] = useState<Courier[]>(INITIAL_COURIERS);
  const [tariffRates, setTariffRates] = useState<TariffRateConfig[]>(INITIAL_TARIFF_RATES);
  const [notifications, setNotifications] = useState<NotificationEvent[]>(INITIAL_NOTIFICATIONS);
  const [manifests, setManifests] = useState<OutboundManifest[]>([]);
  const [latestNotification, setLatestNotification] = useState<NotificationEvent | null>(null);

  const login = (user: AuthUser) => {
    setCurrentUser(user);
    setRole(user.role);
  };

  const logout = () => {
    setCurrentUser(null);
    setRole('GUEST');
  };

  const clearLatestNotification = () => setLatestNotification(null);

  const emitNotification = (
    resi: string,
    eventType: string,
    recipientType: NotificationEvent['recipientType'],
    recipientContact: string,
    channel: NotificationEvent['channel'],
    subject: string,
    message: string
  ) => {
    const notif: NotificationEvent = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      shipmentResi: resi,
      eventType,
      recipientType,
      recipientContact,
      channel,
      subject,
      message,
      timestamp: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB',
      status: 'SENT',
    };
    setNotifications((prev) => [notif, ...prev]);
    setLatestNotification(notif);
  };

  // Algorithm: Tugaskan Kurir Otomatis (Send-Receive Automatic Dispatch)
  const autoAssignNearestCourier = (
    pickupLat: number,
    pickupLng: number
  ): Courier | undefined => {
    // 1. Filter active couriers
    const availableCouriers = couriers.filter((c) => c.isActive);
    if (availableCouriers.length === 0) return couriers[0];

    // 2. Calculate score based on distance + task load weighting
    let bestCourier = availableCouriers[0];
    let minScore = Infinity;

    for (const courier of availableCouriers) {
      const distance = calculateDistanceKm(
        pickupLat,
        pickupLng,
        courier.currentLocation.lat,
        courier.currentLocation.lng
      );
      // Score = Distance (km) * 1.0 + Active Tasks * 3.0 (penalti beban kerja)
      const score = distance * 1.0 + courier.activeTaskCount * 3.0;
      if (score < minScore) {
        minScore = score;
        bestCourier = courier;
      }
    }

    return bestCourier;
  };

  // <<include>> Hitung Tarif
  const calculateTariff = (
    originCity: string,
    destCity: string,
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
    weightKg: number,
    lengthCm: number,
    widthCm: number,
    heightCm: number,
    declaredValueRp: number,
    isInsured: boolean
  ): TariffCalculation[] => {
    // Distance in km
    const distanceKm = calculateDistanceKm(originLat, originLng, destLat, destLng);

    // Standard Indonesian land expedition volumetric calculation: (P x L x T) / 5000
    const volumetricWeightKg = (lengthCm * widthCm * heightCm) / 5000;
    const chargeableWeightKg = Math.max(weightKg, volumetricWeightKg);

    // Insurance cost is 0.2% of declared value if insured
    const insuranceCost = isInsured ? Math.max(5000, Math.round(declaredValueRp * 0.002)) : 0;

    // Service 1: Express (Same Day / Next Day Darat via Tol Trans Jawa)
    const expressBaseRate = 18000;
    const expressDistanceCost = Math.round(distanceKm * 650);
    const expressWeightCost = Math.round(chargeableWeightKg * 14000);
    const expressTotal = expressBaseRate + expressDistanceCost + expressWeightCost + insuranceCost + 2500;

    // Service 2: Reguler Darat
    const regBaseRate = 10000;
    const regDistanceCost = Math.round(distanceKm * 400);
    const regWeightCost = Math.round(chargeableWeightKg * 9000);
    const regTotal = regBaseRate + regDistanceCost + regWeightCost + insuranceCost + 1500;

    // Service 3: Cargo Darat (Heavy load - minimum 10kg)
    const cargoEffectiveWeight = Math.max(10, chargeableWeightKg);
    const cargoBaseRate = 25000;
    const cargoDistanceCost = Math.round(distanceKm * 250);
    const cargoWeightCost = Math.round(cargoEffectiveWeight * 4000);
    const cargoTotal = cargoBaseRate + cargoDistanceCost + cargoWeightCost + insuranceCost + 5000;

    return [
      {
        serviceType: 'EXPRESS',
        serviceName: 'Nusantara Kilat Darat (Express)',
        description: 'Prioritas direct-route darat armada shuttle van via Tol Trans Jawa',
        estimatedDuration: distanceKm < 150 ? '4 - 8 Jam' : '12 - 24 Jam',
        baseRate: expressBaseRate,
        distanceKm,
        distanceCost: expressDistanceCost,
        weightCost: expressWeightCost,
        insuranceCost,
        adminFee: 2500,
        totalCost: expressTotal,
      },
      {
        serviceType: 'REGULER',
        serviceName: 'Nusantara Reguler Darat',
        description: 'Ekspedisi darat terpercaya dengan jangkauan door-to-door antarkota',
        estimatedDuration: distanceKm < 200 ? '1 - 2 Hari' : '2 - 3 Hari',
        baseRate: regBaseRate,
        distanceKm,
        distanceCost: regDistanceCost,
        weightCost: regWeightCost,
        insuranceCost,
        adminFee: 1500,
        totalCost: regTotal,
      },
      {
        serviceType: 'CARGO_DARAT',
        serviceName: 'Nusantara Heavy Cargo Darat',
        description: 'Spesialis muatan besar / palet via armada truk Colt Diesel & Fuso darat (Min. 10 kg)',
        estimatedDuration: distanceKm < 200 ? '2 - 3 Hari' : '3 - 5 Hari',
        baseRate: cargoBaseRate,
        distanceKm,
        distanceCost: cargoDistanceCost,
        weightCost: cargoWeightCost,
        insuranceCost,
        adminFee: 5000,
        totalCost: cargoTotal,
      },
    ];
  };

  // Buat Pengiriman (Multi-Step Form Submission)
  const createShipment = ({
    sender,
    receiver,
    packageDetails,
    service,
  }: {
    sender: Shipment['sender'];
    receiver: Shipment['receiver'];
    packageDetails: Shipment['packageDetails'];
    service: TariffCalculation;
  }): Shipment => {
    // 1. <<include>> Generate Resi
    const resiNumber = generateResiNumber();
    const deliveryOtp = generateOtp();
    const shipmentId = `shp-${Date.now()}`;

    // 2. <<include>> Tugaskan Kurir Otomatis (Auto-Dispatch)
    const assignedCourier = autoAssignNearestCourier(sender.lat, sender.lng);

    const newShipment: Shipment = {
      id: shipmentId,
      resiNumber,
      customerId: 'cust-current',
      sender,
      receiver,
      packageDetails,
      service,
      status: 'UNPAID',
      paymentStatus: 'UNPAID',
      paymentExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      assignedCourierId: assignedCourier?.id,
      assignedCourier: assignedCourier,
      currentHubId: assignedCourier?.assignedHubId || 'hub-mlg',
      deliveryOtp,
      trackingTimeline: [
        {
          id: `t-${Date.now()}`,
          status: 'UNPAID',
          title: 'Pesanan Dibuat (Menunggu Pembayaran)',
          description: `Pesanan tercatat di sistem E-Shipment. Menunggu pelunasan via Payment Gateway.`,
          timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB',
          locationName: sender.city,
          actorName: sender.contactName,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setShipments((prev) => [newShipment, ...prev]);

    // Emit event notification
    emitNotification(
      resiNumber,
      'ORDER_CREATED',
      'SENDER',
      sender.contactPhone,
      'WHATSAPP',
      `Pesanan Pengiriman Terbuat #${resiNumber}`,
      `Halo ${sender.contactName}, pesanan pengiriman darat Anda telah terdaftar dengan No. Resi ${resiNumber}. Silakan selesaikan pembayaran Rp ${service.totalCost.toLocaleString('id-ID')} sebelum 15 menit.`
    );

    return newShipment;
  };

  // Payment Confirmation
  const payShipment = (shipmentId: string, method: PaymentMethod) => {
    setShipments((prev) =>
      prev.map((shp) => {
        if (shp.id !== shipmentId) return shp;

        const updatedTimeline = [
          ...shp.trackingTimeline,
          {
            id: `t-${Date.now()}`,
            status: 'READY_FOR_PICKUP' as ShipmentStatus,
            title: 'Pembayaran Dikonfirmasi & Kurir Ditugaskan Otomatis',
            description: `Pembayaran via ${method} sukses. Kurir ${
              shp.assignedCourier?.name || 'Armada'
            } ditugaskan secara otomatis melalui Send-Receive Auto Dispatch.`,
            timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB',
            locationName: shp.sender.city,
            actorName: 'Sistem Pembayaran E-Shipment',
          },
        ];

        // Increment courier task count
        if (shp.assignedCourierId) {
          setCouriers((cList) =>
            cList.map((c) =>
              c.id === shp.assignedCourierId ? { ...c, activeTaskCount: c.activeTaskCount + 1 } : c
            )
          );
        }

        // Emit notification to Courier
        if (shp.assignedCourier) {
          emitNotification(
            shp.resiNumber,
            'TASK_ASSIGNED_COURIER',
            'COURIER',
            shp.assignedCourier.phone,
            'WHATSAPP',
            `Tugas Baru Pickup #${shp.resiNumber}`,
            `Halo ${shp.assignedCourier.name}! Ada penugasan pickup otomatis di ${shp.sender.address}, ${shp.sender.city}. Pengirim: ${shp.sender.contactName} (${shp.sender.contactPhone}).`
          );
        }

        return {
          ...shp,
          status: 'READY_FOR_PICKUP',
          paymentStatus: 'PAID',
          paymentMethod: method,
          trackingTimeline: updatedTimeline,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const cancelShipment = (shipmentId: string, reason: string) => {
    setShipments((prev) =>
      prev.map((shp) => {
        if (shp.id !== shipmentId) return shp;
        return {
          ...shp,
          status: 'CANCELLED',
          trackingTimeline: [
            ...shp.trackingTimeline,
            {
              id: `t-${Date.now()}`,
              status: 'CANCELLED',
              title: 'Pengiriman Dibatalkan',
              description: `Alasan pembatalan: ${reason}`,
              timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB',
              locationName: shp.sender.city,
              actorName: 'Pelanggan / Admin',
            },
          ],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // Courier updates
  const updateCourierStatus = (shipmentId: string, newStatus: ShipmentStatus, notes?: string) => {
    setShipments((prev) =>
      prev.map((shp) => {
        if (shp.id !== shipmentId) return shp;

        let title = '';
        let desc = notes || '';

        if (newStatus === 'PICKED_UP') {
          title = 'Paket Berhasil Di-pickup';
          desc = desc || `Kurir ${shp.assignedCourier?.name || 'Petugas'} telah mengambil paket dari alamat pengirim.`;

          // Notification to Sender
          emitNotification(
            shp.resiNumber,
            'SHIPMENT_PICKED_UP',
            'SENDER',
            shp.sender.contactPhone,
            'WHATSAPP',
            `Paket Di-pickup #${shp.resiNumber}`,
            `Paket Anda telah berhasil diambil oleh kurir kami (${shp.assignedCourier?.name}) dan sedang menuju ke Hub Transit.`
          );
        } else if (newStatus === 'OUT_FOR_DELIVERY') {
          title = 'Paket Sedang Diantar ke Penerima (Out for Delivery)';
          desc = desc || `Kurir sedang menuju alamat penerima. Kode OTP keamanan: ${shp.deliveryOtp}`;

          // Notification to Receiver with OTP
          emitNotification(
            shp.resiNumber,
            'OUT_FOR_DELIVERY_OTP',
            'RECEIVER',
            shp.receiver.contactPhone,
            'WHATSAPP',
            `Paket Anda Sedang Diantar - Kode OTP: ${shp.deliveryOtp}`,
            `Paket #${shp.resiNumber} sedang diantar ke ${shp.receiver.address}. Harap berikan Kode OTP *${shp.deliveryOtp}* kepada kurir saat serah terima.`
          );
        }

        return {
          ...shp,
          status: newStatus,
          trackingTimeline: [
            ...shp.trackingTimeline,
            {
              id: `t-${Date.now()}`,
              status: newStatus,
              title,
              description: desc,
              timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB',
              locationName: shp.assignedCourier?.currentLocation.address || shp.sender.city,
              actorName: shp.assignedCourier?.name || 'Kurir Ekspedisi',
            },
          ],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const reportCourierFailure = (
    shipmentId: string,
    reason: string,
    photoUrl: string,
    notes?: string
  ) => {
    setShipments((prev) =>
      prev.map((shp) => {
        if (shp.id !== shipmentId) return shp;

        const failureRecord = {
          reason,
          photoUrl,
          loggedAt: new Date().toISOString(),
          notes,
        };

        // Notify Receiver and Sender
        emitNotification(
          shp.resiNumber,
          'DELIVERY_FAILED',
          'RECEIVER',
          shp.receiver.contactPhone,
          'SMS',
          `Pengantaran Tertunda #${shp.resiNumber}`,
          `Pengantaran paket #${shp.resiNumber} gagal: ${reason}. Kurir kami akan menjadwalkan ulang besok. Hubungi support kami jika butuh bantuan.`
        );

        return {
          ...shp,
          status: 'DELIVERY_FAILED',
          failureLog: failureRecord,
          trackingTimeline: [
            ...shp.trackingTimeline,
            {
              id: `t-${Date.now()}`,
              status: 'DELIVERY_FAILED',
              title: 'Pengantaran Gagal (Delivery Attempt Failed)',
              description: `Kurir melaporkan: ${reason}. Catatan: ${notes || '-'}`,
              timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB',
              locationName: shp.receiver.city,
              actorName: shp.assignedCourier?.name || 'Kurir',
              proofPhotoUrl: photoUrl,
            },
          ],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // Hub Inbound
  const processHubInbound = (resiNumbers: string[], hubId: string, staffName: string) => {
    const hub = hubs.find((h) => h.id === hubId);
    const hubName = hub?.name || 'Hub Transit';

    setShipments((prev) =>
      prev.map((shp) => {
        if (!resiNumbers.includes(shp.resiNumber)) return shp;

        emitNotification(
          shp.resiNumber,
          'ARRIVED_AT_HUB',
          'RECEIVER',
          shp.receiver.contactPhone,
          'WHATSAPP',
          `Paket Tiba di Hub Transit #${shp.resiNumber}`,
          `Paket Anda telah tiba di ${hubName} untuk proses sortir muatan darat.`
        );

        return {
          ...shp,
          status: 'ARRIVED_AT_HUB',
          currentHubId: hubId,
          trackingTimeline: [
            ...shp.trackingTimeline,
            {
              id: `t-${Date.now()}-${shp.id}`,
              status: 'ARRIVED_AT_HUB',
              title: `Tiba di ${hubName}`,
              description: `Paket telah di-scan oleh Barcode Gun dan masuk ke gudang sortir ${hubName}.`,
              timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB',
              locationName: hubName,
              actorName: `${staffName} (Petugas Hub)`,
            },
          ],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // Hub Outbound Manifest
  const createOutboundManifest = (
    originHubId: string,
    destinationHubId: string,
    resiNumbers: string[],
    vehiclePlate: string,
    driverName: string
  ): OutboundManifest => {
    const origHub = hubs.find((h) => h.id === originHubId);
    const destHub = hubs.find((h) => h.id === destinationHubId);

    const relevantShipments = shipments.filter((s) => resiNumbers.includes(s.resiNumber));
    const totalWeight = relevantShipments.reduce((acc, s) => acc + s.packageDetails.weightKg, 0);

    const manifest: OutboundManifest = {
      manifestId: `MNF-${Date.now().toString().slice(-6)}`,
      originHubId,
      destinationHubId,
      vehiclePlate,
      driverName,
      shipmentIds: relevantShipments.map((s) => s.id),
      totalPackages: relevantShipments.length,
      totalWeightKg: Math.round(totalWeight * 10) / 10,
      dispatchedAt: new Date().toISOString(),
      status: 'RELEASED',
    };

    setManifests((prev) => [manifest, ...prev]);

    // Update shipments to IN_TRANSIT
    setShipments((prev) =>
      prev.map((shp) => {
        if (!resiNumbers.includes(shp.resiNumber)) return shp;

        emitNotification(
          shp.resiNumber,
          'IN_TRANSIT_MANIFEST',
          'RECEIVER',
          shp.receiver.contactPhone,
          'WHATSAPP',
          `Paket Dalam Perjalanan Antar-Hub #${shp.resiNumber}`,
          `Paket diberangkatkan dengan armada darat (${vehiclePlate} - Driver: ${driverName}) dari ${origHub?.name} menuju ${destHub?.name}.`
        );

        return {
          ...shp,
          status: 'IN_TRANSIT',
          trackingTimeline: [
            ...shp.trackingTimeline,
            {
              id: `t-${Date.now()}-${shp.id}`,
              status: 'IN_TRANSIT',
              title: `Manifest Outbound Rilis (${manifest.manifestId})`,
              description: `Diberangkatkan dengan armada Truk Box ${vehiclePlate} (Driver: ${driverName}) rute darat ${origHub?.city} -> ${destHub?.city}.`,
              timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB',
              locationName: `Koridor Darat ${origHub?.city} - ${destHub?.city}`,
              actorName: `Admin Manifest Hub`,
            },
          ],
          updatedAt: new Date().toISOString(),
        };
      })
    );

    return manifest;
  };

  // Receiver OTP Verification
  const verifyReceiverOtp = (
    resi: string,
    otp: string,
    receivedBy: string,
    photoUrl: string,
    rating: number,
    review?: string
  ): { success: boolean; message: string } => {
    const targetShipment = shipments.find((s) => s.resiNumber.trim().toUpperCase() === resi.trim().toUpperCase());
    if (!targetShipment) {
      return { success: false, message: 'Nomor resi tidak ditemukan dalam sistem.' };
    }

    if (targetShipment.status === 'DELIVERED') {
      return { success: false, message: 'Paket ini sudah selesai diterima sebelumnya.' };
    }

    if (targetShipment.deliveryOtp !== otp.trim()) {
      return { success: false, message: 'Kode OTP tidak cocok! Mohon periksa kembali kode OTP yang dikirimkan.' };
    }

    // OTP Valid! Transition to DELIVERED
    setShipments((prev) =>
      prev.map((shp) => {
        if (shp.id !== targetShipment.id) return shp;

        return {
          ...shp,
          status: 'DELIVERED',
          proofOfDelivery: {
            receivedBy,
            photoUrl: photoUrl || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=60',
            verifiedAt: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB',
            rating,
            review,
          },
          trackingTimeline: [
            ...shp.trackingTimeline,
            {
              id: `t-${Date.now()}`,
              status: 'DELIVERED',
              title: 'Paket Berhasil Diterima (Verifikasi OTP Sukses)',
              description: `Paket telah diserahterimakan kepada ${receivedBy}. Validasi keamanan 6-Digit OTP terverifikasi.`,
              timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB',
              locationName: shp.receiver.address,
              actorName: `${receivedBy} (Penerima Terverifikasi)`,
            },
          ],
          updatedAt: new Date().toISOString(),
        };
      })
    );

    // Notify Sender that shipment has been successfully received
    emitNotification(
      targetShipment.resiNumber,
      'SHIPMENT_DELIVERED',
      'SENDER',
      targetShipment.sender.contactPhone,
      'WHATSAPP',
      `Paket Telah Sampai #${targetShipment.resiNumber}`,
      `Kabar baik! Paket Anda telah berhasil diterima oleh ${receivedBy}. Terima kasih telah menggunakan Nusantara Cargo Ekspedisi Darat.`
    );

    return { success: true, message: 'Verifikasi OTP berhasil! Paket telah resmi diserahterimakan.' };
  };

  // Admin Manual Reassignment Override
  const reassignCourier = (shipmentId: string, newCourierId: string, reason: string) => {
    const targetCourier = couriers.find((c) => c.id === newCourierId);
    if (!targetCourier) return;

    setShipments((prev) =>
      prev.map((shp) => {
        if (shp.id !== shipmentId) return shp;

        return {
          ...shp,
          assignedCourierId: newCourierId,
          assignedCourier: targetCourier,
          trackingTimeline: [
            ...shp.trackingTimeline,
            {
              id: `t-${Date.now()}`,
              status: shp.status,
              title: `Override Penugasan Kurir oleh Admin`,
              description: `Kurir diubah ke ${targetCourier.name} (${targetCourier.plateNumber}). Alasan: ${reason}`,
              timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB',
              locationName: 'Pusat Kontrol Operasional Admin',
              actorName: 'Super Admin Logistik',
            },
          ],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // Master Data CRUD
  const addHub = (hub: TransitHub) => setHubs((prev) => [...prev, hub]);
  const updateHub = (hub: TransitHub) =>
    setHubs((prev) => prev.map((h) => (h.id === hub.id ? hub : h)));
  const deleteHub = (id: string) => setHubs((prev) => prev.filter((h) => h.id !== id));

  const addCourier = (courier: Courier) => setCouriers((prev) => [...prev, courier]);
  const updateCourier = (courier: Courier) =>
    setCouriers((prev) => prev.map((c) => (c.id === courier.id ? courier : c)));
  const deleteCourier = (id: string) => setCouriers((prev) => prev.filter((c) => c.id !== id));

  const updateTariffRate = (tariff: TariffRateConfig) =>
    setTariffRates((prev) => prev.map((t) => (t.id === tariff.id ? tariff : t)));

  return (
    <ShipmentContext.Provider
      value={{
        role,
        setRole,
        currentUser,
        login,
        logout,
        shipments,
        hubs,
        couriers,
        tariffRates,
        notifications,
        manifests,
        latestNotification,
        clearLatestNotification,
        calculateTariff,
        createShipment,
        payShipment,
        cancelShipment,
        updateCourierStatus,
        reportCourierFailure,
        processHubInbound,
        createOutboundManifest,
        verifyReceiverOtp,
        reassignCourier,
        addHub,
        updateHub,
        deleteHub,
        addCourier,
        updateCourier,
        deleteCourier,
        updateTariffRate,
      }}
    >
      {children}
    </ShipmentContext.Provider>
  );
};

export const useShipment = () => {
  const context = useContext(ShipmentContext);
  if (!context) {
    throw new Error('useShipment must be used within a ShipmentProvider');
  }
  return context;
};
