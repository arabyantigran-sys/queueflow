import { create } from 'zustand';
import { api } from '../data/api';
import { platformApi } from '../data/platformApi';
import {
  demoAnalytics,
  demoBusiness,
  demoNotifications,
  defaultWorkingHours,
} from '../data/demoData';
import type {
  AnalyticsData,
  Appointment,
  AppointmentStatus,
  BookingDraft,
  Business,
  BusinessType,
  Customer,
  Employee,
  NotificationSetting,
  OnboardingState,
  PlanId,
  Service,
} from '../types';

interface AppState {
  isAuthenticated: boolean;
  business: Business;
  employees: Employee[];
  services: Service[];
  customers: Customer[];
  appointments: Appointment[];
  notifications: NotificationSetting[];
  analytics: AnalyticsData;
  selectedCustomerId: string | null;
  sidebarOpen: boolean;
  appointmentModalOpen: boolean;
  editingAppointment: Appointment | null;
  toast: string | null;
  onboarding: OnboardingState;
  bookingDraft: BookingDraft;
  bookingCompleteId: string | null;
  bookingNotFound: boolean;

  login: (email: string, password: string) => boolean;
  logout: () => void;
  hydrate: () => Promise<void>;
  hydrateBySlug: (slug: string) => Promise<boolean>;
  refreshAppointments: (date?: string) => Promise<void>;

  setSidebarOpen: (open: boolean) => void;
  showToast: (msg: string) => void;
  clearToast: () => void;

  openAppointmentModal: (apt?: Appointment | null) => void;
  closeAppointmentModal: () => void;

  createAppointment: (data: Omit<Appointment, 'id' | 'createdAt'>) => Promise<Appointment>;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => Promise<void>;
  updateAppointment: (id: string, patch: Partial<Appointment>) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;

  addEmployee: (data: { name: string; role: string; phone: string; workingHours: string }) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;

  addService: (data: { nameHy: string; name: string; price: number; duration: number }) => Promise<void>;
  updateService: (id: string, patch: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  duplicateService: (id: string) => Promise<void>;

  selectCustomer: (id: string | null) => void;
  updateBusiness: (patch: Partial<Business>) => Promise<void>;
  setPlan: (plan: PlanId) => void;
  updateNotification: (id: string, patch: Partial<NotificationSetting>) => void;

  setOnboarding: (patch: Partial<OnboardingState>) => void;
  /** Submits a salon application to platform admin (pending approval). */
  finishOnboarding: () => Promise<{ requestId: string }>;

  setBookingDraft: (patch: Partial<BookingDraft>) => void;
  resetBookingDraft: () => void;
  submitBooking: () => Promise<Appointment>;
  setBookingCompleteId: (id: string | null) => void;
}

const emptyBooking: BookingDraft = {
  serviceId: null,
  employeeId: null,
  date: null,
  time: null,
  customerName: '',
  customerPhone: '',
  notes: '',
};

const emptyOnboarding: OnboardingState = {
  step: 1,
  businessName: '',
  businessType: '',
  ownerName: '',
  ownerEmail: '',
  ownerPhone: '',
  city: 'Երևան',
  planRequested: 'business',
  employees: [],
  services: [],
  workingHours: defaultWorkingHours,
};

export const useAppStore = create<AppState>((set, get) => ({
  isAuthenticated: false,
  business: demoBusiness,
  employees: [],
  services: [],
  customers: [],
  appointments: [],
  notifications: demoNotifications,
  analytics: demoAnalytics,
  selectedCustomerId: null,
  sidebarOpen: false,
  appointmentModalOpen: false,
  editingAppointment: null,
  toast: null,
  onboarding: emptyOnboarding,
  bookingDraft: emptyBooking,
  bookingCompleteId: null,
  bookingNotFound: false,

  login: (email) => {
    if (!email) return false;
    set({ isAuthenticated: true });
    return true;
  },

  logout: () => set({ isAuthenticated: false }),

  hydrate: async () => {
    const activeId = api.getActiveBusinessId();
    const biz = (await api.getBusiness(activeId)) || demoBusiness;
    api.setActiveBusinessId(biz.id);
    const [employees, services, customers, appointments] = await Promise.all([
      api.getEmployees(biz.id),
      api.getServices(biz.id),
      api.getCustomers(biz.id),
      api.getAppointments(biz.id),
    ]);
    set({ business: biz, employees, services, customers, appointments, bookingNotFound: false });
  },

  hydrateBySlug: async (slug) => {
    const biz = await api.getBusiness(slug);
    if (!biz) {
      set({ bookingNotFound: true });
      return false;
    }
    const [employees, services, customers, appointments] = await Promise.all([
      api.getEmployees(biz.id),
      api.getServices(biz.id),
      api.getCustomers(biz.id),
      api.getAppointments(biz.id),
    ]);
    set({
      business: biz,
      employees,
      services,
      customers,
      appointments,
      bookingNotFound: false,
    });
    return true;
  },

  refreshAppointments: async (date) => {
    const appointments = await api.getAppointments(get().business.id, date);
    const all = date
      ? [
          ...get().appointments.filter((a) => a.date !== date),
          ...appointments,
        ]
      : appointments;
    set({ appointments: all.sort((a, b) => a.startTime.localeCompare(b.startTime) || a.date.localeCompare(b.date)) });
  },

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  showToast: (msg) => {
    set({ toast: msg });
    setTimeout(() => set({ toast: null }), 2800);
  },
  clearToast: () => set({ toast: null }),

  openAppointmentModal: (apt = null) =>
    set({ appointmentModalOpen: true, editingAppointment: apt }),
  closeAppointmentModal: () =>
    set({ appointmentModalOpen: false, editingAppointment: null }),

  createAppointment: async (data) => {
    const apt = await api.createAppointment(data);
    const [customers, appointments] = await Promise.all([
      api.getCustomers(get().business.id),
      api.getAppointments(get().business.id),
    ]);
    set({ customers, appointments });
    get().showToast('Ամրագրումը ստեղծված է');
    return apt;
  },

  updateAppointmentStatus: async (id, status) => {
    await api.setAppointmentStatus(id, status);
    set({
      appointments: get().appointments.map((a) =>
        a.id === id ? { ...a, status } : a
      ),
    });
    get().showToast('Կարգավիճակը թարմացված է');
  },

  updateAppointment: async (id, patch) => {
    await api.updateAppointment(id, patch);
    set({
      appointments: get().appointments.map((a) =>
        a.id === id ? { ...a, ...patch } : a
      ),
    });
    get().showToast('Ամրագրումը թարմացված է');
  },

  cancelAppointment: async (id) => {
    await api.cancelAppointment(id);
    set({
      appointments: get().appointments.map((a) =>
        a.id === id ? { ...a, status: 'cancelled' as const } : a
      ),
    });
    get().showToast('Ամրագրումը չեղարկված է');
  },

  addEmployee: async (data) => {
    const emp = await api.addEmployee({
      ...data,
      businessId: get().business.id,
      services: [],
      appointmentsToday: 0,
      revenue: 0,
      rating: 5,
    });
    set({ employees: [...get().employees, emp] });
    get().showToast('Աշխատակիցը ավելացված է');
  },

  deleteEmployee: async (id) => {
    await api.deleteEmployee(id);
    set({ employees: get().employees.filter((e) => e.id !== id) });
    get().showToast('Աշխատակիցը հեռացված է');
  },

  addService: async (data) => {
    const svc = await api.addService({
      ...data,
      businessId: get().business.id,
      employeeIds: get().employees.map((e) => e.id),
    });
    const employees = await api.getEmployees(get().business.id);
    set({ services: [...get().services, svc], employees });
    get().showToast('Ծառայությունը ավելացված է');
  },

  updateService: async (id, patch) => {
    await api.updateService(id, patch);
    set({
      services: get().services.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
    get().showToast('Ծառայությունը թարմացված է');
  },

  deleteService: async (id) => {
    await api.deleteService(id);
    set({ services: get().services.filter((s) => s.id !== id) });
    get().showToast('Ծառայությունը ջնջված է');
  },

  duplicateService: async (id) => {
    const src = get().services.find((s) => s.id === id);
    if (!src) return;
    await get().addService({
      name: `${src.name} (պատճեն)`,
      nameHy: `${src.nameHy} (պատճեն)`,
      price: src.price,
      duration: src.duration,
    });
  },

  selectCustomer: (id) => set({ selectedCustomerId: id }),

  updateBusiness: async (patch) => {
    const updated = await api.updateBusiness(get().business.id, patch);
    set({ business: updated });
    get().showToast('Կարգավորումները պահված են');
  },

  setPlan: (plan) => {
    set({ business: { ...get().business, plan } });
    get().showToast('Փաթեթը թարմացված է');
  },

  updateNotification: (id, patch) => {
    set({
      notifications: get().notifications.map((n) =>
        n.id === id ? { ...n, ...patch } : n
      ),
    });
  },

  setOnboarding: (patch) =>
    set({ onboarding: { ...get().onboarding, ...patch } }),

  finishOnboarding: async () => {
    const ob = get().onboarding;
    const name = ob.businessName.trim() || 'Նոր սրահ';
    const req = await platformApi.createRequest({
      businessName: name,
      ownerName: ob.ownerName.trim() || name,
      ownerEmail: ob.ownerEmail.trim() || 'owner@example.com',
      ownerPhone: ob.ownerPhone.trim() || '',
      city: ob.city.trim() || 'Երևան',
      type: (ob.businessType || 'beauty_salon') as BusinessType,
      planRequested: ob.planRequested || 'business',
      employees: ob.employees.length
        ? ob.employees
        : [{ name: 'Մասնագետ 1', role: 'Մասնագետ' }],
      services: ob.services.length
        ? ob.services
        : [{ name: 'Ծառայություն', price: 8000, duration: 45 }],
      workingHours: ob.workingHours,
    });

    set({
      isAuthenticated: false,
      onboarding: { ...emptyOnboarding, step: 7, submittedRequestId: req.id, businessName: name },
    });
    get().showToast('Հայտը ուղարկված է');
    return { requestId: req.id };
  },

  setBookingDraft: (patch) =>
    set({ bookingDraft: { ...get().bookingDraft, ...patch } }),

  resetBookingDraft: () => set({ bookingDraft: emptyBooking, bookingCompleteId: null }),

  submitBooking: async () => {
    const draft = get().bookingDraft;
    const biz = get().business;
    const service = get().services.find((s) => s.id === draft.serviceId);
    const employee =
      draft.employeeId === 'any'
        ? get().employees[0]
        : get().employees.find((e) => e.id === draft.employeeId);

    if (!service || !employee || !draft.date || !draft.time) {
      throw new Error('Incomplete booking');
    }

    const duration = service.duration;
    const [h, m] = draft.time.split(':').map(Number);
    const endM = h * 60 + m + duration;
    const endTime = `${String(Math.floor(endM / 60)).padStart(2, '0')}:${String(endM % 60).padStart(2, '0')}`;

    const apt = await get().createAppointment({
      businessId: biz.id,
      customerId: '',
      customerName: draft.customerName,
      customerPhone: draft.customerPhone,
      serviceId: service.id,
      serviceName: service.nameHy,
      employeeId: employee.id,
      employeeName: employee.name,
      date: draft.date,
      startTime: draft.time,
      endTime,
      status: 'confirmed',
      channel: 'queueflow',
      notes: draft.notes,
      price: service.price,
    });

    set({ bookingCompleteId: apt.id });
    return apt;
  },

  setBookingCompleteId: (id) => set({ bookingCompleteId: id }),
}));
