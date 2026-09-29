export type AppointmentStatus =
  | 'confirmed'
  | 'waiting'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type CustomerStatus = 'active' | 'inactive' | 'no_show';

export type Channel =
  | 'queueflow'
  | 'website'
  | 'qr'
  | 'instagram'
  | 'phone'
  | 'walk_in';

export type BusinessType =
  | 'beauty_salon'
  | 'barbershop'
  | 'nail_studio'
  | 'massage'
  | 'dental'
  | 'medical'
  | 'other';

export type PlanId = 'starter' | 'business' | 'pro' | 'enterprise';

export type SalonLifecycle = 'trial' | 'active' | 'suspended';

export type SalonRequestStatus = 'pending' | 'reviewing' | 'approved' | 'rejected';

export interface Business {
  id: string;
  name: string;
  slug: string;
  type: BusinessType;
  address: string;
  phone: string;
  city: string;
  rating: number;
  reviewCount: number;
  openUntil: string;
  logo?: string;
  bookingLink: string;
  plan: PlanId;
  nextBillingDate: string;
  workingHours: WorkingHours;
  cancellationPolicy: string;
  bookingRules: string;
  /** Platform-managed lifecycle */
  status?: SalonLifecycle;
  ownerEmail?: string;
  ownerPhone?: string;
  createdAt?: string;
  trialEndsAt?: string;
}

export interface SalonRequest {
  id: string;
  businessName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  city: string;
  type: BusinessType;
  planRequested: PlanId;
  employees: { name: string; role: string }[];
  services: { name: string; price: number; duration: number }[];
  workingHours: WorkingHours;
  status: SalonRequestStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
  approvedBusinessId?: string;
}

export interface WorkingHours {
  [day: string]: { open: string; close: string; closed?: boolean };
}

export interface Employee {
  id: string;
  businessId: string;
  name: string;
  role: string;
  avatar?: string;
  phone: string;
  services: string[];
  workingHours: string;
  appointmentsToday: number;
  revenue: number;
  rating: number;
}

export interface Service {
  id: string;
  businessId: string;
  name: string;
  nameHy: string;
  price: number;
  duration: number;
  description?: string;
  employeeIds: string[];
}

export interface Customer {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  birthday?: string;
  notes?: string;
  status: CustomerStatus;
  lastVisit: string;
  totalVisits: number;
  totalSpent: number;
  nextVisit?: string;
}

export interface Appointment {
  id: string;
  businessId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  employeeId: string;
  employeeName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  channel: Channel;
  notes?: string;
  price: number;
  waitingMinutes?: number;
  createdAt: string;
}

export interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  push: boolean;
  sms: boolean;
  email: boolean;
}

export interface AnalyticsData {
  totalAppointments: number;
  completed: number;
  cancelled: number;
  noShow: number;
  revenue: number;
  averageBookingValue: number;
  repeatCustomers: number;
  appointmentsOverTime: { label: string; value: number }[];
  revenueOverTime: { label: string; value: number }[];
  popularServices: { name: string; value: number; revenue: number }[];
  employeePerformance: { name: string; appointments: number; revenue: number }[];
  peakHours: { hour: string; count: number }[];
}

export interface OnboardingState {
  step: number;
  businessName: string;
  businessType: BusinessType | '';
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  city: string;
  planRequested: PlanId;
  employees: { name: string; role: string }[];
  services: { name: string; price: number; duration: number }[];
  workingHours: WorkingHours;
  submittedRequestId?: string;
}

export interface BookingDraft {
  serviceId: string | null;
  employeeId: string | null;
  date: string | null;
  time: string | null;
  customerName: string;
  customerPhone: string;
  notes: string;
}
