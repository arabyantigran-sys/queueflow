/**
 * Mock API layer — replace implementations with real REST calls later.
 * UI components should only import from here / the store, never hardcode fetches.
 */
import type {
  Appointment,
  AppointmentStatus,
  Business,
  Customer,
  Employee,
  Service,
} from '../types';
import {
  demoAppointments,
  demoBusiness,
  demoCustomers,
  demoEmployees,
  demoServices,
  TODAY,
} from './demoData';

const delay = (ms = 80) => new Promise((r) => setTimeout(r, ms));

let businesses = [structuredClone(demoBusiness)];
let employees = structuredClone(demoEmployees);
let services = structuredClone(demoServices);
let customers = structuredClone(demoCustomers);
let appointments = structuredClone(demoAppointments);

export const api = {
  async getBusiness(slugOrId: string): Promise<Business | undefined> {
    await delay();
    return businesses.find((b) => b.slug === slugOrId || b.id === slugOrId);
  },

  async updateBusiness(id: string, patch: Partial<Business>): Promise<Business> {
    await delay();
    businesses = businesses.map((b) => (b.id === id ? { ...b, ...patch } : b));
    return businesses.find((b) => b.id === id)!;
  },

  async getEmployees(businessId: string): Promise<Employee[]> {
    await delay();
    return employees.filter((e) => e.businessId === businessId);
  },

  async addEmployee(emp: Omit<Employee, 'id'>): Promise<Employee> {
    await delay();
    const created: Employee = { ...emp, id: `emp-${Date.now()}` };
    employees = [...employees, created];
    return created;
  },

  async updateEmployee(id: string, patch: Partial<Employee>): Promise<Employee> {
    await delay();
    employees = employees.map((e) => (e.id === id ? { ...e, ...patch } : e));
    return employees.find((e) => e.id === id)!;
  },

  async deleteEmployee(id: string): Promise<void> {
    await delay();
    employees = employees.filter((e) => e.id !== id);
  },

  async getServices(businessId: string): Promise<Service[]> {
    await delay();
    return services.filter((s) => s.businessId === businessId);
  },

  async addService(svc: Omit<Service, 'id'>): Promise<Service> {
    await delay();
    const created: Service = { ...svc, id: `svc-${Date.now()}` };
    services = [...services, created];
    return created;
  },

  async updateService(id: string, patch: Partial<Service>): Promise<Service> {
    await delay();
    services = services.map((s) => (s.id === id ? { ...s, ...patch } : s));
    return services.find((s) => s.id === id)!;
  },

  async deleteService(id: string): Promise<void> {
    await delay();
    services = services.filter((s) => s.id !== id);
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
    return created;
  },

  async updateCustomer(id: string, patch: Partial<Customer>): Promise<Customer> {
    await delay();
    customers = customers.map((c) => (c.id === id ? { ...c, ...patch } : c));
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

    // Upsert customer if new
    const existing = customers.find(
      (c) => c.phone.replace(/\s/g, '') === data.customerPhone.replace(/\s/g, '')
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

    return created;
  },

  async updateAppointment(
    id: string,
    patch: Partial<Appointment>
  ): Promise<Appointment> {
    await delay();
    appointments = appointments.map((a) => (a.id === id ? { ...a, ...patch } : a));
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
};
