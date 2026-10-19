import { UserRole } from './shipment';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatarUrl: string;
  assignedHubId?: string;
  plateNumber?: string;
  token: string;
}

export const PRESET_ACCOUNTS: AuthUser[] = [
  {
    id: 'user-cust-01',
    name: 'Hendra Gunawan (Direktur Logistik)',
    email: 'hendra.gunawan@perusahaan.co.id',
    role: 'CUSTOMER',
    phone: '+62 811-2233-4455',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    token: 'jwt_cust_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.hendra.corp',
  },
  {
    id: 'user-courier-01',
    name: 'Dimas Wicaksono (Kurir Ekspedisi)',
    email: 'dimas.kurir@eshipment.org',
    role: 'COURIER',
    phone: '+62 812-7711-2233',
    plateNumber: 'N 4821 AC (Blind Van)',
    assignedHubId: 'hub-mlg',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    token: 'jwt_courier_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dimas.eshipment',
  },
  {
    id: 'user-hub-01',
    name: 'Guntur Wibowo (Petugas Hub Sortir)',
    email: 'guntur.hub@eshipment.org',
    role: 'HUB_STAFF',
    phone: '+62 813-4455-6677',
    assignedHubId: 'hub-mlg',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    token: 'jwt_hub_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.guntur.hub',
  },
  {
    id: 'user-admin-01',
    name: 'Super Admin Operasional E-Shipment',
    email: 'admin.ops@eshipment.org',
    role: 'ADMIN',
    phone: '+62 811-9988-7766',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    token: 'jwt_admin_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.admin.eshipment',
  },
];
