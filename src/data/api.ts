/**
 * Data API — uses Supabase when VITE_SUPABASE_* env vars are set,
 * otherwise falls back to in-memory + localStorage mock.
 */
import type {
  Appointment,
  AppointmentStatus,
  Business,
  BusinessType,
  Customer,
  CustomerStatus,
  Employee,
  Service,
  WorkingHours,
} from '../types';
import {
  demoAppointments,
  demoBusiness,
  demoCustomers,
  demoEmployees,
  demoServices,
  defaultWorkingHours,
  TODAY,
} from './demoData';
import { seedPlatformSalons } from './platformData';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const STORAGE_KEY = 'queueflow_db_v2';
const ACTIVE_KEY = 'queueflow_active_business_id';

const delay = (ms = 40) => new Promise((r) => setTimeout(r, ms));

export function slugify(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || `salon-${Date.now()}`
  );
}

type DbShape = {
  businesses: Business[];
  employees: Employee[];
  services: Service[];
  customers: Customer[];
  appointments: Appointment[];
};

function defaultDb(): DbShape {
  return {
    businesses: [structuredClone(demoBusiness), ...structuredClone(seedPlatformSalons)],
    employees: structuredClone(demoEmployees),
    services: structuredClone(demoServices),
    customers: structuredClone(demoCustomers),
    appointments: structuredClone(demoAppointments),
  };
}

function loadDb(): DbShape {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultDb();
    const parsed = JSON.parse(raw) as DbShape;
    if (!parsed.businesses?.length) return defaultDb();
    return parsed;
  } catch {
    return defaultDb();
  }
}

let local = loadDb();
let { businesses, employees, services, customers, appointments } = local;

function persistLocal() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ businesses, employees, services, customers, appointments })
    );
  } catch {
    /* ignore */
  }
}

/* ——— mappers ——— */
function mapBusiness(row: Record<string, unknown>): Business {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    type: row.type as BusinessType,
    address: String(row.address ?? ''),
    phone: String(row.phone ?? ''),
    city: String(row.city ?? ''),
    rating: Number(row.rating ?? 5),
    reviewCount: Number(row.review_count ?? 0),
    openUntil: String(row.open_until ?? '21:00'),
    bookingLink: String(row.booking_link ?? `/book/${row.slug}`),
    plan: (row.plan as Business['plan']) ?? 'business',
    nextBillingDate: String(row.next_billing_date ?? ''),
    workingHours: (row.working_hours as WorkingHours) ?? defaultWorkingHours,
    cancellationPolicy: String(row.cancellation_policy ?? ''),
    bookingRules: String(row.booking_rules ?? ''),
    status: (row.status as Business['status']) ?? undefined,
    ownerEmail: row.owner_email != null ? String(row.owner_email) : undefined,
    ownerPhone: row.owner_phone != null ? String(row.owner_phone) : undefined,
    createdAt: row.created_at != null ? String(row.created_at).slice(0, 10) : undefined,
    trialEndsAt: row.trial_ends_at != null ? String(row.trial_ends_at) : undefined,
  };
}

function mapEmployee(row: Record<string, unknown>): Employee {
  return {
    id: String(row.id),
    businessId: String(row.business_id),
    name: String(row.name),
    role: String(row.role ?? ''),
    phone: String(row.phone ?? ''),
    services: (row.services as string[]) ?? [],
    workingHours: String(row.working_hours ?? ''),
    appointmentsToday: Number(row.appointments_today ?? 0),
    revenue: Number(row.revenue ?? 0),
    rating: Number(row.rating ?? 5),
  };
}

function mapService(row: Record<string, unknown>): Service {
  return {
    id: String(row.id),
    businessId: String(row.business_id),
    name: String(row.name),
    nameHy: String(row.name_hy ?? row.name),
    price: Number(row.price ?? 0),
    duration: Number(row.duration ?? 45),
    description: row.description ? String(row.description) : undefined,
    employeeIds: (row.employee_ids as string[]) ?? [],
  };
}

function mapCustomer(row: Record<string, unknown>): Customer {
  return {
    id: String(row.id),
    businessId: String(row.business_id),
    name: String(row.name),
    phone: String(row.phone),
    birthday: row.birthday ? String(row.birthday) : undefined,
    notes: row.notes ? String(row.notes) : undefined,
    status: (row.status as CustomerStatus) ?? 'active',
    lastVisit: String(row.last_visit ?? ''),
    totalVisits: Number(row.total_visits ?? 0),
    totalSpent: Number(row.total_spent ?? 0),
    nextVisit: row.next_visit ? String(row.next_visit) : undefined,
  };
}

function mapAppointment(row: Record<string, unknown>): Appointment {
  return {
    id: String(row.id),
    businessId: String(row.business_id),
    customerId: String(row.customer_id ?? ''),
    customerName: String(row.customer_name),
    customerPhone: String(row.customer_phone),
    serviceId: String(row.service_id),
    serviceName: String(row.service_name),
    employeeId: String(row.employee_id),
    employeeName: String(row.employee_name),
    date: String(row.date),
    startTime: String(row.start_time),
    endTime: String(row.end_time),
    status: row.status as AppointmentStatus,
    channel: row.channel as Appointment['channel'],
    notes: row.notes ? String(row.notes) : undefined,
    price: Number(row.price ?? 0),
    waitingMinutes: row.waiting_minutes != null ? Number(row.waiting_minutes) : undefined,
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

function requireSb() {
  if (!supabase) throw new Error('Supabase is not configured');
  return supabase;
}

/* ===================== SUPABASE IMPLEMENTATION ===================== */
const sbApi = {
  getActiveBusinessId(): string {
    return localStorage.getItem(ACTIVE_KEY) || demoBusiness.id;
  },
  setActiveBusinessId(id: string) {
    localStorage.setItem(ACTIVE_KEY, id);
  },

  async listBusinesses(): Promise<Business[]> {
    const { data, error } = await requireSb().from('businesses').select('*');
    if (error) throw error;
    return (data ?? []).map((r) => mapBusiness(r));
  },

  async getBusiness(slugOrId: string): Promise<Business | undefined> {
    const sb = requireSb();
    let { data, error } = await sb.from('businesses').select('*').eq('slug', slugOrId).maybeSingle();
    if (error) throw error;
    if (!data) {
      ({ data, error } = await sb.from('businesses').select('*').eq('id', slugOrId).maybeSingle());
      if (error) throw error;
    }
    return data ? mapBusiness(data) : undefined;
  },

  async createBusiness(input: {
    name: string;
    type: BusinessType;
    workingHours?: WorkingHours;
    employees?: { name: string; role: string }[];
    services?: { name: string; price: number; duration: number }[];
  }): Promise<{ business: Business; employees: Employee[]; services: Service[] }> {
    const sb = requireSb();
    let slug = slugify(input.name);
    const existing = await this.getBusiness(slug);
    if (existing) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

    const id = `biz-${Date.now()}`;
    const row = {
      id,
      name: input.name,
      slug,
      type: input.type,
      address: '',
      phone: '',
      city: 'Երևան',
      rating: 5,
      review_count: 0,
      open_until: input.workingHours?.monday?.close || '21:00',
      booking_link: `/book/${slug}`,
      plan: 'business',
      next_billing_date: '2026-10-28',
      working_hours: input.workingHours || defaultWorkingHours,
      cancellation_policy: 'Չեղարկումը պետք է կատարվի այցից առնվազն 2 ժամ առաջ։',
      booking_rules: 'Ամրագրումը հաստատվում է ավտոմատ։',
    };

    const { data: bizData, error: bizErr } = await sb.from('businesses').insert(row).select().single();
    if (bizErr) throw bizErr;

    const empRows = (input.employees || []).map((e, i) => ({
      id: `emp-${Date.now()}-${i}`,
      business_id: id,
      name: e.name,
      role: e.role || 'Մասնագետ',
      phone: '091 000 000',
      services: [] as string[],
      working_hours: '09:00 – 18:00',
      appointments_today: 0,
      revenue: 0,
      rating: 5,
    }));

    const svcRows = (input.services || []).map((s, i) => ({
      id: `svc-${Date.now()}-${i}`,
      business_id: id,
      name: s.name,
      name_hy: s.name,
      price: s.price,
      duration: s.duration,
      employee_ids: empRows.map((e) => e.id),
    }));

    const svcIds = svcRows.map((s) => s.id);
    const linkedEmpRows = empRows.map((e) => ({ ...e, services: svcIds }));

    if (linkedEmpRows.length) {
      const { error } = await sb.from('employees').insert(linkedEmpRows);
      if (error) throw error;
    }
    if (svcRows.length) {
      const { error } = await sb.from('services').insert(svcRows);
      if (error) throw error;
    }

    this.setActiveBusinessId(id);
    return {
      business: mapBusiness(bizData),
      employees: linkedEmpRows.map((r) => mapEmployee(r)),
      services: svcRows.map((r) => mapService(r)),
    };
  },

  async updateBusiness(id: string, patch: Partial<Business>): Promise<Business> {
    const row: Record<string, unknown> = {};
    if (patch.name != null) row.name = patch.name;
    if (patch.type != null) row.type = patch.type;
    if (patch.address != null) row.address = patch.address;
    if (patch.phone != null) row.phone = patch.phone;
    if (patch.city != null) row.city = patch.city;
    if (patch.openUntil != null) row.open_until = patch.openUntil;
    if (patch.plan != null) row.plan = patch.plan;
    if (patch.workingHours != null) row.working_hours = patch.workingHours;
    if (patch.cancellationPolicy != null) row.cancellation_policy = patch.cancellationPolicy;
    if (patch.bookingRules != null) row.booking_rules = patch.bookingRules;
    if (patch.slug != null) {
      row.slug = patch.slug;
      row.booking_link = `/book/${patch.slug}`;
    }
    if (patch.status != null) row.status = patch.status;
    if (patch.ownerEmail != null) row.owner_email = patch.ownerEmail;
    if (patch.ownerPhone != null) row.owner_phone = patch.ownerPhone;
    if (patch.createdAt != null) row.created_at = patch.createdAt;
    if (patch.trialEndsAt != null) row.trial_ends_at = patch.trialEndsAt;
    if (patch.nextBillingDate != null) row.next_billing_date = patch.nextBillingDate;

    const { data, error } = await requireSb()
      .from('businesses')
      .update(row)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapBusiness(data);
  },

  async ensureBusinesses(list: Business[]): Promise<void> {
    const sb = requireSb();
    let existing: Business[] = [];
    try {
      existing = await this.listBusinesses();
    } catch {
      existing = [];
    }
    const ids = new Set(existing.map((b) => b.id));
    const missing = list.filter((b) => !ids.has(b.id) && !existing.some((e) => e.slug === b.slug));
    for (const b of missing) {
      const base = {
        id: b.id,
        name: b.name,
        slug: b.slug,
        type: b.type,
        address: b.address,
        phone: b.phone,
        city: b.city,
        rating: b.rating,
        review_count: b.reviewCount,
        open_until: b.openUntil,
        booking_link: b.bookingLink,
        plan: b.plan,
        next_billing_date: b.nextBillingDate,
        working_hours: b.workingHours,
        cancellation_policy: b.cancellationPolicy,
        booking_rules: b.bookingRules,
      };
      const full = {
        ...base,
        status: b.status ?? 'active',
        owner_email: b.ownerEmail ?? '',
        owner_phone: b.ownerPhone ?? '',
        trial_ends_at: b.trialEndsAt ?? null,
      };
      const { error } = await sb.from('businesses').upsert(full);
      if (error) {
        // Older schema without platform columns — still insert core fields
        await sb.from('businesses').upsert(base);
      }
    }
  },

  async getEmployees(businessId: string): Promise<Employee[]> {
    const { data, error } = await requireSb()
      .from('employees')
      .select('*')
      .eq('business_id', businessId);
    if (error) throw error;
    return (data ?? []).map((r) => mapEmployee(r));
  },

  async addEmployee(emp: Omit<Employee, 'id'>): Promise<Employee> {
    const existing = await this.getServices(emp.businessId);
    const row = {
      id: `emp-${Date.now()}`,
      business_id: emp.businessId,
      name: emp.name,
      role: emp.role,
      phone: emp.phone,
      services: emp.services.length ? emp.services : existing.map((s) => s.id),
      working_hours: emp.workingHours,
      appointments_today: emp.appointmentsToday,
      revenue: emp.revenue,
      rating: emp.rating,
    };
    const { data, error } = await requireSb().from('employees').insert(row).select().single();
    if (error) throw error;
    return mapEmployee(data);
  },

  async updateEmployee(id: string, patch: Partial<Employee>): Promise<Employee> {
    const row: Record<string, unknown> = {};
    if (patch.name != null) row.name = patch.name;
    if (patch.role != null) row.role = patch.role;
    if (patch.phone != null) row.phone = patch.phone;
    if (patch.services != null) row.services = patch.services;
    if (patch.workingHours != null) row.working_hours = patch.workingHours;
    const { data, error } = await requireSb().from('employees').update(row).eq('id', id).select().single();
    if (error) throw error;
    return mapEmployee(data);
  },

  async deleteEmployee(id: string): Promise<void> {
    const { error } = await requireSb().from('employees').delete().eq('id', id);
    if (error) throw error;
  },

  async getServices(businessId: string): Promise<Service[]> {
    const { data, error } = await requireSb()
      .from('services')
      .select('*')
      .eq('business_id', businessId);
    if (error) throw error;
    return (data ?? []).map((r) => mapService(r));
  },

  async addService(svc: Omit<Service, 'id'>): Promise<Service> {
    const emps = await this.getEmployees(svc.businessId);
    const row = {
      id: `svc-${Date.now()}`,
      business_id: svc.businessId,
      name: svc.name,
      name_hy: svc.nameHy,
      price: svc.price,
      duration: svc.duration,
      description: svc.description ?? null,
      employee_ids: svc.employeeIds.length ? svc.employeeIds : emps.map((e) => e.id),
    };
    const { data, error } = await requireSb().from('services').insert(row).select().single();
    if (error) throw error;

    // attach to employees
    for (const e of emps) {
      if (!e.services.includes(row.id)) {
        await this.updateEmployee(e.id, { services: [...e.services, row.id] });
      }
    }
    return mapService(data);
  },

  async updateService(id: string, patch: Partial<Service>): Promise<Service> {
    const row: Record<string, unknown> = {};
    if (patch.name != null) row.name = patch.name;
    if (patch.nameHy != null) row.name_hy = patch.nameHy;
    if (patch.price != null) row.price = patch.price;
    if (patch.duration != null) row.duration = patch.duration;
    if (patch.description != null) row.description = patch.description;
    if (patch.employeeIds != null) row.employee_ids = patch.employeeIds;
    const { data, error } = await requireSb().from('services').update(row).eq('id', id).select().single();
    if (error) throw error;
    return mapService(data);
  },

  async deleteService(id: string): Promise<void> {
    const { error } = await requireSb().from('services').delete().eq('id', id);
    if (error) throw error;
  },

  async getCustomers(businessId: string): Promise<Customer[]> {
    const { data, error } = await requireSb()
      .from('customers')
      .select('*')
      .eq('business_id', businessId);
    if (error) throw error;
    return (data ?? []).map((r) => mapCustomer(r));
  },

  async getCustomer(id: string): Promise<Customer | undefined> {
    const { data, error } = await requireSb().from('customers').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? mapCustomer(data) : undefined;
  },

  async addCustomer(cus: Omit<Customer, 'id'>): Promise<Customer> {
    const row = {
      id: `cus-${Date.now()}`,
      business_id: cus.businessId,
      name: cus.name,
      phone: cus.phone,
      birthday: cus.birthday ?? null,
      notes: cus.notes ?? null,
      status: cus.status,
      last_visit: cus.lastVisit,
      total_visits: cus.totalVisits,
      total_spent: cus.totalSpent,
      next_visit: cus.nextVisit ?? null,
    };
    const { data, error } = await requireSb().from('customers').insert(row).select().single();
    if (error) throw error;
    return mapCustomer(data);
  },

  async updateCustomer(id: string, patch: Partial<Customer>): Promise<Customer> {
    const row: Record<string, unknown> = {};
    if (patch.name != null) row.name = patch.name;
    if (patch.phone != null) row.phone = patch.phone;
    if (patch.notes != null) row.notes = patch.notes;
    if (patch.status != null) row.status = patch.status;
    if (patch.lastVisit != null) row.last_visit = patch.lastVisit;
    if (patch.totalVisits != null) row.total_visits = patch.totalVisits;
    if (patch.totalSpent != null) row.total_spent = patch.totalSpent;
    if (patch.nextVisit != null) row.next_visit = patch.nextVisit;
    const { data, error } = await requireSb().from('customers').update(row).eq('id', id).select().single();
    if (error) throw error;
    return mapCustomer(data);
  },

  async getAppointments(businessId: string, date?: string): Promise<Appointment[]> {
    let q = requireSb().from('appointments').select('*').eq('business_id', businessId);
    if (date) q = q.eq('date', date);
    const { data, error } = await q.order('start_time');
    if (error) throw error;
    return (data ?? []).map((r) => mapAppointment(r));
  },

  async getAppointment(id: string): Promise<Appointment | undefined> {
    const { data, error } = await requireSb().from('appointments').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? mapAppointment(data) : undefined;
  },

  async createAppointment(data: Omit<Appointment, 'id' | 'createdAt'>): Promise<Appointment> {
    const sb = requireSb();
    const row = {
      id: `apt-${Date.now()}`,
      business_id: data.businessId,
      customer_id: data.customerId || '',
      customer_name: data.customerName,
      customer_phone: data.customerPhone,
      service_id: data.serviceId,
      service_name: data.serviceName,
      employee_id: data.employeeId,
      employee_name: data.employeeName,
      date: data.date,
      start_time: data.startTime,
      end_time: data.endTime,
      status: data.status,
      channel: data.channel,
      notes: data.notes ?? null,
      price: data.price,
      waiting_minutes: data.waitingMinutes ?? null,
    };
    const { data: apt, error } = await sb.from('appointments').insert(row).select().single();
    if (error) throw error;

    const list = await this.getCustomers(data.businessId);
    const existing = list.find(
      (c) => c.phone.replace(/\s/g, '') === data.customerPhone.replace(/\s/g, '')
    );
    if (!existing) {
      await this.addCustomer({
        businessId: data.businessId,
        name: data.customerName,
        phone: data.customerPhone,
        status: 'active',
        lastVisit: data.date,
        totalVisits: 1,
        totalSpent: data.price,
        notes: data.notes,
      });
    } else {
      await this.updateCustomer(existing.id, {
        lastVisit: data.date,
        totalVisits: existing.totalVisits + 1,
        totalSpent: existing.totalSpent + data.price,
        status: 'active',
      });
    }

    return mapAppointment(apt);
  },

  async updateAppointment(id: string, patch: Partial<Appointment>): Promise<Appointment> {
    const row: Record<string, unknown> = {};
    if (patch.customerName != null) row.customer_name = patch.customerName;
    if (patch.customerPhone != null) row.customer_phone = patch.customerPhone;
    if (patch.serviceId != null) row.service_id = patch.serviceId;
    if (patch.serviceName != null) row.service_name = patch.serviceName;
    if (patch.employeeId != null) row.employee_id = patch.employeeId;
    if (patch.employeeName != null) row.employee_name = patch.employeeName;
    if (patch.date != null) row.date = patch.date;
    if (patch.startTime != null) row.start_time = patch.startTime;
    if (patch.endTime != null) row.end_time = patch.endTime;
    if (patch.status != null) row.status = patch.status;
    if (patch.channel != null) row.channel = patch.channel;
    if (patch.notes != null) row.notes = patch.notes;
    if (patch.price != null) row.price = patch.price;
    const { data, error } = await requireSb().from('appointments').update(row).eq('id', id).select().single();
    if (error) throw error;
    return mapAppointment(data);
  },

  async setAppointmentStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    return this.updateAppointment(id, { status });
  },

  async cancelAppointment(id: string): Promise<Appointment> {
    return this.setAppointmentStatus(id, 'cancelled');
  },

  getToday(): string {
    return TODAY;
  },

  resetDemoData() {
    /* no-op for supabase */
  },
};

/* ===================== LOCAL FALLBACK ===================== */
const localApi = {
  getActiveBusinessId(): string {
    return localStorage.getItem(ACTIVE_KEY) || demoBusiness.id;
  },
  setActiveBusinessId(id: string) {
    localStorage.setItem(ACTIVE_KEY, id);
  },
  async listBusinesses(): Promise<Business[]> {
    await delay();
    return [...businesses];
  },
  async getBusiness(slugOrId: string): Promise<Business | undefined> {
    await delay();
    return businesses.find((b) => b.slug === slugOrId || b.id === slugOrId);
  },
  async createBusiness(input: {
    name: string;
    type: BusinessType;
    workingHours?: WorkingHours;
    employees?: { name: string; role: string }[];
    services?: { name: string; price: number; duration: number }[];
  }) {
    await delay();
    let slug = slugify(input.name);
    if (businesses.some((b) => b.slug === slug)) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    const id = `biz-${Date.now()}`;
    const business: Business = {
      id,
      name: input.name,
      slug,
      type: input.type,
      address: '',
      phone: '',
      city: 'Երևան',
      rating: 5,
      reviewCount: 0,
      openUntil: input.workingHours?.monday?.close || '21:00',
      bookingLink: `/book/${slug}`,
      plan: 'business',
      nextBillingDate: '2026-10-28',
      workingHours: input.workingHours || defaultWorkingHours,
      cancellationPolicy: 'Չեղարկումը պետք է կատարվի այցից առնվազն 2 ժամ առաջ։',
      bookingRules: 'Ամրագրումը հաստատվում է ավտոմատ։',
    };
    businesses = [...businesses, business];
    const createdEmployees: Employee[] = (input.employees || []).map((e, i) => ({
      id: `emp-${Date.now()}-${i}`,
      businessId: id,
      name: e.name,
      role: e.role || 'Մասնագետ',
      phone: '091 000 000',
      services: [],
      workingHours: '09:00 – 18:00',
      appointmentsToday: 0,
      revenue: 0,
      rating: 5,
    }));
    const createdServices: Service[] = (input.services || []).map((s, i) => ({
      id: `svc-${Date.now()}-${i}`,
      businessId: id,
      name: s.name,
      nameHy: s.name,
      price: s.price,
      duration: s.duration,
      employeeIds: createdEmployees.map((e) => e.id),
    }));
    const svcIds = createdServices.map((s) => s.id);
    const linked = createdEmployees.map((e) => ({ ...e, services: svcIds }));
    employees = [...employees, ...linked];
    services = [...services, ...createdServices];
    this.setActiveBusinessId(id);
    persistLocal();
    return { business, employees: linked, services: createdServices };
  },
  async updateBusiness(id: string, patch: Partial<Business>) {
    await delay();
    businesses = businesses.map((b) =>
      b.id === id
        ? {
            ...b,
            ...patch,
            bookingLink: `/book/${patch.slug ?? b.slug}`,
          }
        : b
    );
    persistLocal();
    return businesses.find((b) => b.id === id)!;
  },
  async ensureBusinesses(list: Business[]) {
    await delay();
    const ids = new Set(businesses.map((b) => b.id));
    const missing = list.filter((b) => !ids.has(b.id));
    if (missing.length) {
      businesses = [...businesses, ...structuredClone(missing)];
      persistLocal();
    }
  },
  async getEmployees(businessId: string) {
    await delay();
    return employees.filter((e) => e.businessId === businessId);
  },
  async addEmployee(emp: Omit<Employee, 'id'>) {
    await delay();
    const bizServices = services.filter((s) => s.businessId === emp.businessId).map((s) => s.id);
    const created: Employee = { ...emp, id: `emp-${Date.now()}`, services: emp.services.length ? emp.services : bizServices };
    employees = [...employees, created];
    persistLocal();
    return created;
  },
  async updateEmployee(id: string, patch: Partial<Employee>) {
    await delay();
    employees = employees.map((e) => (e.id === id ? { ...e, ...patch } : e));
    persistLocal();
    return employees.find((e) => e.id === id)!;
  },
  async deleteEmployee(id: string) {
    await delay();
    employees = employees.filter((e) => e.id !== id);
    persistLocal();
  },
  async getServices(businessId: string) {
    await delay();
    return services.filter((s) => s.businessId === businessId);
  },
  async addService(svc: Omit<Service, 'id'>) {
    await delay();
    const empIds = employees.filter((e) => e.businessId === svc.businessId).map((e) => e.id);
    const created: Service = { ...svc, id: `svc-${Date.now()}`, employeeIds: svc.employeeIds.length ? svc.employeeIds : empIds };
    services = [...services, created];
    employees = employees.map((e) =>
      e.businessId === svc.businessId && !e.services.includes(created.id)
        ? { ...e, services: [...e.services, created.id] }
        : e
    );
    persistLocal();
    return created;
  },
  async updateService(id: string, patch: Partial<Service>) {
    await delay();
    services = services.map((s) => (s.id === id ? { ...s, ...patch } : s));
    persistLocal();
    return services.find((s) => s.id === id)!;
  },
  async deleteService(id: string) {
    await delay();
    services = services.filter((s) => s.id !== id);
    employees = employees.map((e) => ({ ...e, services: e.services.filter((sid) => sid !== id) }));
    persistLocal();
  },
  async getCustomers(businessId: string) {
    await delay();
    return customers.filter((c) => c.businessId === businessId);
  },
  async getCustomer(id: string) {
    await delay();
    return customers.find((c) => c.id === id);
  },
  async addCustomer(cus: Omit<Customer, 'id'>) {
    await delay();
    const created: Customer = { ...cus, id: `cus-${Date.now()}` };
    customers = [...customers, created];
    persistLocal();
    return created;
  },
  async updateCustomer(id: string, patch: Partial<Customer>) {
    await delay();
    customers = customers.map((c) => (c.id === id ? { ...c, ...patch } : c));
    persistLocal();
    return customers.find((c) => c.id === id)!;
  },
  async getAppointments(businessId: string, date?: string) {
    await delay();
    return appointments
      .filter((a) => a.businessId === businessId && (!date || a.date === date))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  },
  async getAppointment(id: string) {
    await delay();
    return appointments.find((a) => a.id === id);
  },
  async createAppointment(data: Omit<Appointment, 'id' | 'createdAt'>) {
    await delay();
    const created: Appointment = { ...data, id: `apt-${Date.now()}`, createdAt: new Date().toISOString() };
    appointments = [...appointments, created];
    const existing = customers.find(
      (c) =>
        c.businessId === data.businessId &&
        c.phone.replace(/\s/g, '') === data.customerPhone.replace(/\s/g, '')
    );
    if (!existing) {
      customers = [
        ...customers,
        {
          id: `cus-${Date.now()}`,
          businessId: data.businessId,
          name: data.customerName,
          phone: data.customerPhone,
          status: 'active',
          lastVisit: data.date,
          totalVisits: 1,
          totalSpent: data.price,
          notes: data.notes,
        },
      ];
    } else {
      customers = customers.map((c) =>
        c.id === existing.id
          ? {
              ...c,
              lastVisit: data.date,
              totalVisits: c.totalVisits + 1,
              totalSpent: c.totalSpent + data.price,
              status: 'active' as const,
            }
          : c
      );
    }
    persistLocal();
    return created;
  },
  async updateAppointment(id: string, patch: Partial<Appointment>) {
    await delay();
    appointments = appointments.map((a) => (a.id === id ? { ...a, ...patch } : a));
    persistLocal();
    return appointments.find((a) => a.id === id)!;
  },
  async setAppointmentStatus(id: string, status: AppointmentStatus) {
    return this.updateAppointment(id, { status });
  },
  async cancelAppointment(id: string) {
    return this.setAppointmentStatus(id, 'cancelled');
  },
  getToday() {
    return TODAY;
  },
  resetDemoData() {
    const db = defaultDb();
    businesses = db.businesses;
    employees = db.employees;
    services = db.services;
    customers = db.customers;
    appointments = db.appointments;
    this.setActiveBusinessId(demoBusiness.id);
    persistLocal();
  },
};

export const api = isSupabaseConfigured ? sbApi : localApi;
export { isSupabaseConfigured };
