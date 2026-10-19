export type UserRole = 'GUEST' | 'CUSTOMER' | 'COURIER' | 'HUB_STAFF' | 'ADMIN';

export type ShipmentStatus =
  | 'UNPAID'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'ARRIVED_AT_HUB'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'DELIVERY_FAILED'
  | 'CANCELLED';

export type ServiceType = 'EXPRESS' | 'REGULER' | 'CARGO_DARAT';

export type PaymentMethod =
  | 'BCA_VA'
  | 'MANDIRI_VA'
  | 'BRI_VA'
  | 'GOPAY'
  | 'OVO'
  | 'SHOPEEPAY'
  | 'QRIS';

export type PaymentStatus = 'UNPAID' | 'PAID' | 'EXPIRED';

export interface LocationCoordinate {
  lat: number;
  lng: number;
  address: string;
  city: string;
  postalCode?: string;
  contactName: string;
  contactPhone: string;
  notes?: string;
}

export interface PackageDetails {
  itemCategory: 'Dokumen' | 'Elektronik' | 'Pakaian & Tekstil' | 'Makanan Kering' | 'Suku Cadang / Mesin' | 'Lainnya';
  description: string;
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  declaredValueRp: number;
  isInsured: boolean;
  volumetricWeightKg: number;
}

export interface TariffCalculation {
  serviceType: ServiceType;
  serviceName: string;
  description: string;
  estimatedDuration: string;
  baseRate: number;
  distanceKm: number;
  distanceCost: number;
  weightCost: number;
  insuranceCost: number;
  adminFee: number;
  totalCost: number;
}

export interface TrackingStep {
  id: string;
  status: ShipmentStatus;
  title: string;
  description: string;
  timestamp: string;
  locationName: string;
  actorName: string;
  notes?: string;
  proofPhotoUrl?: string;
}

export interface Courier {
  id: string;
  name: string;
  phone: string;
  plateNumber: string;
  vehicleType: 'Sepeda Motor' | 'Blind Van' | 'Pick-up Box' | 'Truk CDD';
  currentLocation: { lat: number; lng: number; address: string };
  assignedHubId: string;
  isActive: boolean;
  activeTaskCount: number;
  rating: number;
}

export interface CourierTask {
  id: string;
  shipmentId: string;
  courierId: string;
  taskType: 'PICKUP' | 'DELIVERY';
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  address: string;
  recipientOrSenderName: string;
  contactPhone: string;
  coordinates: { lat: number; lng: number };
  distanceKm: number;
  assignedAt: string;
  completedAt?: string;
  failedReason?: string;
  failedProofPhoto?: string;
  failedNotes?: string;
}

export interface TransitHub {
  id: string;
  hubCode: string;
  name: string;
  city: string;
  address: string;
  coordinates: { lat: number; lng: number };
  capacityTon: number;
  currentLoadTon: number;
  managerName: string;
  phone: string;
}

export interface OutboundManifest {
  manifestId: string;
  originHubId: string;
  destinationHubId: string;
  vehiclePlate: string;
  driverName: string;
  shipmentIds: string[];
  totalPackages: number;
  totalWeightKg: number;
  dispatchedAt: string;
  status: 'DRAFT' | 'RELEASED' | 'RECEIVED';
}

export interface Shipment {
  id: string;
  resiNumber: string; // e.g. NC-202610-84920
  customerId: string;
  sender: LocationCoordinate;
  receiver: LocationCoordinate;
  packageDetails: PackageDetails;
  service: TariffCalculation;
  status: ShipmentStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentExpiresAt: string;
  assignedCourierId?: string;
  assignedCourier?: Courier;
  currentHubId?: string;
  deliveryOtp: string; // 6-digit OTP for receiver verification
  proofOfDelivery?: {
    receivedBy: string;
    photoUrl: string;
    verifiedAt: string;
    rating: number;
    review?: string;
  };
  failureLog?: {
    reason: string;
    photoUrl: string;
    loggedAt: string;
    notes?: string;
  };
  trackingTimeline: TrackingStep[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationEvent {
  id: string;
  shipmentResi: string;
  eventType: string;
  recipientType: 'SENDER' | 'RECEIVER' | 'COURIER' | 'ADMIN';
  recipientContact: string;
  channel: 'WHATSAPP' | 'SMS' | 'EMAIL' | 'PUSH';
  subject: string;
  message: string;
  timestamp: string;
  status: 'SENT' | 'QUEUED';
}

export interface TariffRateConfig {
  id: string;
  originCity: string;
  destinationCity: string;
  expressRatePerKg: number;
  regularRatePerKg: number;
  cargoRatePerKg: number;
  minWeightCargoKg: number;
  estimatedHoursExpress: string;
  estimatedHoursRegular: string;
  estimatedHoursCargo: string;
}
