/**
 * Mock API layer — replace with real REST later.
 * Persists to localStorage so new salons survive refresh (same browser only).
 */
import type {
  Appointment,
  AppointmentStatus,
  Business,
  BusinessType,
  Customer,
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

const STORAGE_KEY = 'queueflow_db_v1';
const ACTIVE_KEY = 'queueflow_active_business_id';

const delay = (ms = 40) => new Promise((r) => setTimeout(r, ms));

export function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || `salon-${Date.now()}`;
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
    businesses: [structuredClone(demoBusiness)],
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

function saveDb() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ businesses, employees, services, customers, appointments })
    );
  } catch {
    /* ignore quota */
  }
}

let { businesses, employees, services, customers, appointments } = loadDb();

function persist() {
  saveDb();
}

export const api = {
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
  }): Promise<{ business: Business; employees: Employee[]; services: Service[] }> {
    await delay();
    let slug = slugify(input.name);
    const existing = businesses.some((b) => b.slug === slug);
    if (existing) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

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

    // Link all services to all employees of this salon
    const svcIds = createdServices.map((s) => s.id);
    const linkedEmployees = createdEmployees.map((e) => ({ ...e, services: svcIds }));

    employees = [...employees, ...linkedEmployees];
    services = [...services, ...createdServices];

    this.setActiveBusinessId(id);
    persist();

    return { business, employees: linkedEmployees, services: createdServices };
  },

  async updateBusiness(id: string, patch: Partial<Business>): Promise<Business> {
    await delay();
    businesses = businesses.map((b) => {
      if (b.id !== id) return b;
      const next = { ...b, ...patch };
      if (patch.name && !patch.slug) {
        // keep existing slug unless explicitly changed
      }
      if (patch.name) {
        next.bookingLink = `/book/${next.slug}`;
      }
      return next;
    });
    persist();
    return businesses.find((b) => b.id === id)!;
  },

  async getEmployees(businessId: string): Promise<Employee[]> {
    await delay();
    return employees.filter((e) => e.businessId === businessId);
  },

  async addEmployee(emp: Omit<Employee, 'id'>): Promise<Employee> {
    await delay();
    const bizServices = services.filter((s) => s.businessId === emp.businessId).map((s) => s.id);
    const created: Employee = {
      ...emp,
      id: `emp-${Date.now()}`,
      services: emp.services.length ? emp.services : bizServices,
    };
    employees = [...employees, created];
    persist();
    return created;
  },

  async updateEmployee(id: string, patch: Partial<Employee>): Promise<Employee> {
    await delay();
    employees = employees.map((e) => (e.id === id ? { ...e, ...patch } : e));
    persist();
    return employees.find((e) => e.id === id)!;
  },

  async deleteEmployee(id: string): Promise<void> {
    await delay();
    employees = employees.filter((e) => e.id !== id);
    persist();
  },

  async getServices(businessId: string): Promise<Service[]> {
    await delay();
    return services.filter((s) => s.businessId === businessId);
  },

  async addService(svc: Omit<Service, 'id'>): Promise<Service> {
    await delay();
    const empIds = employees.filter((e) => e.businessId === svc.businessId).map((e) => e.id);
    const created: Service = {
      ...svc,
      id: `svc-${Date.now()}`,
      employeeIds: svc.employeeIds.length ? svc.employeeIds : empIds,
    };
    services = [...services, created];
    // attach service to employees
    employees = employees.map((e) =>
      e.businessId === svc.businessId && !e.services.includes(created.id)
        ? { ...e, services: [...e.services, created.id] }
        : e
    );
    persist();
    return created;
  },

  async updateService(id: string, patch: Partial<Service>): Promise<Service> {
    await delay();
    services = services.map((s) => (s.id === id ? { ...s, ...patch } : s));
    persist();
    return services.find((s) => s.id === id)!;
  },

  async deleteService(id: string): Promise<void> {
    await delay();
    services = services.filter((s) => s.id !== id);
    employees = employees.map((e) => ({
      ...e,
      services: e.services.filter((sid) => sid !== id),
    }));
    persist();
  },

  async getCustomers(businessId: string): Promise<Customer[]> {
    await delay();
    return customers.filter((c) => c.businessId === businessId);
  },

  async getCustomer(id: string): Promise<Customer | undefined> {
    await delay();
    return customers.find((c) => c.id === id);
  },

  async addCustomer(cus: Omit<Customer, 'id'>): Promise<Customer> {
    await delay();
    const created: Customer = { ...cus, id: `cus-${Date.now()}` };
    customers = [...customers, created];
    persist();
    return created;
  },

  async updateCustomer(id: string, patch: Partial<Customer>): Promise<Customer> {
    await delay();
    customers = customers.map((c) => (c.id === id ? { ...c, ...patch } : c));
    persist();
    return customers.find((c) => c.id === id)!;
  },

  async getAppointments(businessId: string, date?: string): Promise<Appointment[]> {
    await delay();
    return appointments
      .filter((a) => a.businessId === businessId && (!date || a.date === date))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  },

  async getAppointment(id: string): Promise<Appointment | undefined> {
    await delay();
    return appointments.find((a) => a.id === id);
  },

  async createAppointment(
    data: Omit<Appointment, 'id' | 'createdAt'>
  ): Promise<Appointment> {
    await delay();
    const created: Appointment = {
      ...data,
      id: `apt-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
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

    persist();
    return created;
  },

  async updateAppointment(
    id: string,
    patch: Partial<Appointment>
  ): Promise<Appointment> {
    await delay();
    appointments = appointments.map((a) => (a.id === id ? { ...a, ...patch } : a));
    persist();
    return appointments.find((a) => a.id === id)!;
  },

  async setAppointmentStatus(
    id: string,
    status: AppointmentStatus
  ): Promise<Appointment> {
    return this.updateAppointment(id, { status });
  },

  async cancelAppointment(id: string): Promise<Appointment> {
    return this.setAppointmentStatus(id, 'cancelled');
  },

  getToday(): string {
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
    persist();
  },
};
