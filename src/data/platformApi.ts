import type { Business, PlanId, SalonLifecycle, SalonRequest, SalonRequestStatus } from '../types';
import { api } from './api';
import { PLATFORM_ADMIN, seedPlatformSalons, seedSalonRequests } from './platformData';
import { demoBusiness } from './demoData';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const REQ_KEY = 'queueflow_salon_requests_v1';
const PLATFORM_AUTH_KEY = 'queueflow_platform_auth';

function loadRequests(): SalonRequest[] {
  try {
    const raw = localStorage.getItem(REQ_KEY);
    if (!raw) {
      const seed = structuredClone(seedSalonRequests);
      localStorage.setItem(REQ_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as SalonRequest[];
  } catch {
    return structuredClone(seedSalonRequests);
  }
}

function saveRequests(list: SalonRequest[]) {
  try {
    localStorage.setItem(REQ_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

let requests = typeof window !== 'undefined' ? loadRequests() : structuredClone(seedSalonRequests);

function mapRequest(row: Record<string, unknown>): SalonRequest {
  return {
    id: String(row.id),
    businessName: String(row.business_name ?? row.businessName ?? ''),
    ownerName: String(row.owner_name ?? row.ownerName ?? ''),
    ownerEmail: String(row.owner_email ?? row.ownerEmail ?? ''),
    ownerPhone: String(row.owner_phone ?? row.ownerPhone ?? ''),
    city: String(row.city ?? ''),
    type: (row.type as SalonRequest['type']) ?? 'beauty_salon',
    planRequested: (row.plan_requested as PlanId) ?? (row.planRequested as PlanId) ?? 'business',
    employees: (row.employees as SalonRequest['employees']) ?? [],
    services: (row.services as SalonRequest['services']) ?? [],
    workingHours: (row.working_hours as SalonRequest['workingHours']) ?? (row.workingHours as SalonRequest['workingHours']),
    status: (row.status as SalonRequestStatus) ?? 'pending',
    notes: String(row.notes ?? ''),
    createdAt: String(row.created_at ?? row.createdAt ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? row.updatedAt ?? new Date().toISOString()),
    approvedBusinessId: row.approved_business_id
      ? String(row.approved_business_id)
      : row.approvedBusinessId
        ? String(row.approvedBusinessId)
        : undefined,
  };
}

export const platformApi = {
  checkCredentials(email: string, password: string): boolean {
    return (
      email.trim().toLowerCase() === PLATFORM_ADMIN.email &&
      password === PLATFORM_ADMIN.password
    );
  },

  isLoggedIn(): boolean {
    try {
      return localStorage.getItem(PLATFORM_AUTH_KEY) === '1';
    } catch {
      return false;
    }
  },

  setLoggedIn(on: boolean) {
    try {
      if (on) localStorage.setItem(PLATFORM_AUTH_KEY, '1');
      else localStorage.removeItem(PLATFORM_AUTH_KEY);
    } catch {
      /* ignore */
    }
  },

  async listRequests(): Promise<SalonRequest[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('salon_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data.map((r) => mapRequest(r as Record<string, unknown>));
      }
    }
    requests = loadRequests();
    return [...requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async getRequest(id: string): Promise<SalonRequest | undefined> {
    const all = await this.listRequests();
    return all.find((r) => r.id === id);
  },

  async createRequest(
    input: Omit<SalonRequest, 'id' | 'status' | 'notes' | 'createdAt' | 'updatedAt' | 'approvedBusinessId'>
  ): Promise<SalonRequest> {
    const now = new Date().toISOString();
    const req: SalonRequest = {
      ...input,
      id: `req-${Date.now()}`,
      status: 'pending',
      notes: '',
      createdAt: now,
      updatedAt: now,
    };

    if (isSupabaseConfigured && supabase) {
      const row = {
        id: req.id,
        business_name: req.businessName,
        owner_name: req.ownerName,
        owner_email: req.ownerEmail,
        owner_phone: req.ownerPhone,
        city: req.city,
        type: req.type,
        plan_requested: req.planRequested,
        employees: req.employees,
        services: req.services,
        working_hours: req.workingHours,
        status: req.status,
        notes: req.notes,
        created_at: req.createdAt,
        updated_at: req.updatedAt,
      };
      const { error } = await supabase.from('salon_requests').insert(row);
      if (!error) return req;
    }

    requests = [req, ...loadRequests()];
    saveRequests(requests);
    return req;
  },

  async updateRequestStatus(
    id: string,
    status: SalonRequestStatus,
    notes?: string
  ): Promise<SalonRequest> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      const patch: Record<string, unknown> = { status, updated_at: now };
      if (notes != null) patch.notes = notes;
      const { data, error } = await supabase
        .from('salon_requests')
        .update(patch)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (!error && data) return mapRequest(data as Record<string, unknown>);
    }

    requests = loadRequests().map((r) =>
      r.id === id
        ? { ...r, status, notes: notes ?? r.notes, updatedAt: now }
        : r
    );
    saveRequests(requests);
    return requests.find((r) => r.id === id)!;
  },

  /** Ensure seed salons exist in the shops DB. */
  async ensureSeedSalons(): Promise<void> {
    await api.ensureBusinesses([demoBusiness, ...seedPlatformSalons]);
  },

  async listSalons(): Promise<Business[]> {
    await this.ensureSeedSalons();
    const list = await api.listBusinesses();
    return list.map((b) => ({
      ...b,
      status: b.status ?? 'active',
    }));
  },

  async getSalon(id: string): Promise<Business | undefined> {
    const list = await this.listSalons();
    return list.find((b) => b.id === id || b.slug === id);
  },

  async setSalonStatus(id: string, status: SalonLifecycle): Promise<Business> {
    return api.updateBusiness(id, { status });
  },

  async setSalonPlan(id: string, plan: PlanId): Promise<Business> {
    return api.updateBusiness(id, { plan });
  },

  async approveRequest(id: string): Promise<{ request: SalonRequest; business: Business }> {
    const req = await this.getRequest(id);
    if (!req) throw new Error('Request not found');

    const { business } = await api.createBusiness({
      name: req.businessName,
      type: req.type,
      workingHours: req.workingHours,
      employees: req.employees.length
        ? req.employees
        : [{ name: 'Մասնագետ 1', role: 'Մասնագետ' }],
      services: req.services.length
        ? req.services
        : [{ name: 'Ծառայություն', price: 8000, duration: 45 }],
    });

    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + 30);
    const updatedBiz = await api.updateBusiness(business.id, {
      plan: req.planRequested,
      status: 'trial',
      ownerEmail: req.ownerEmail,
      ownerPhone: req.ownerPhone,
      city: req.city || business.city,
      phone: req.ownerPhone || business.phone,
      createdAt: new Date().toISOString().slice(0, 10),
      trialEndsAt: trialEnds.toISOString().slice(0, 10),
      nextBillingDate: trialEnds.toISOString().slice(0, 10),
    });

    const now = new Date().toISOString();
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('salon_requests')
        .update({
          status: 'approved',
          approved_business_id: updatedBiz.id,
          updated_at: now,
        })
        .eq('id', id);
    }

    requests = loadRequests().map((r) =>
      r.id === id
        ? {
            ...r,
            status: 'approved' as const,
            approvedBusinessId: updatedBiz.id,
            updatedAt: now,
          }
        : r
    );
    saveRequests(requests);

    return {
      request: requests.find((r) => r.id === id)!,
      business: updatedBiz,
    };
  },
};
