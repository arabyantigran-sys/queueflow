import type { Business, PlanId, SalonRequest } from '../types';
import { defaultWorkingHours } from './demoData';

/** QueueFlow platform (super-admin) demo credentials */
export const PLATFORM_ADMIN = {
  email: 'admin@queueflow.am',
  password: 'QueueAdmin2026!',
} as const;

const mkBiz = (
  partial: Pick<Business, 'id' | 'name' | 'slug' | 'type' | 'plan' | 'phone' | 'city' | 'address'> & {
    status?: Business['status'];
    ownerEmail?: string;
    ownerPhone?: string;
    createdAt?: string;
    trialEndsAt?: string;
    nextBillingDate?: string;
  }
): Business => ({
  rating: 4.6,
  reviewCount: 40,
  openUntil: '20:00',
  bookingLink: `/book/${partial.slug}`,
  nextBillingDate: partial.nextBillingDate ?? '2026-10-28',
  workingHours: defaultWorkingHours,
  cancellationPolicy: 'Չեղարկումը՝ այցից առնվազն 2 ժամ առաջ։',
  bookingRules: 'Ամրագրումը հաստատվում է ավտոմատ։',
  status: partial.status ?? 'active',
  ownerEmail: partial.ownerEmail ?? `owner@${partial.slug}.am`,
  ownerPhone: partial.ownerPhone ?? partial.phone,
  createdAt: partial.createdAt ?? '2026-08-01',
  trialEndsAt: partial.trialEndsAt,
  ...partial,
});

/** Extra demo salons for platform overview (Beauty House stays in demoData) */
export const seedPlatformSalons: Business[] = [
  mkBiz({
    id: 'biz-glow-studio',
    name: 'Glow Studio',
    slug: 'glow-studio',
    type: 'beauty_salon',
    plan: 'business',
    phone: '091 700 101',
    city: 'Երևան',
    address: 'Մաշտոց 22',
    status: 'active',
    ownerEmail: 'ani@glow.am',
    createdAt: '2026-07-12',
    nextBillingDate: '2026-10-12',
  }),
  mkBiz({
    id: 'biz-barber-king',
    name: 'Barber King',
    slug: 'barber-king',
    type: 'barbershop',
    plan: 'starter',
    phone: '099 200 303',
    city: 'Գյումրի',
    address: 'Վարդանանց 8',
    status: 'trial',
    ownerEmail: 'karen@barberking.am',
    createdAt: '2026-09-15',
    trialEndsAt: '2026-10-15',
    nextBillingDate: '2026-10-15',
  }),
  mkBiz({
    id: 'biz-nail-lab',
    name: 'Nail Lab',
    slug: 'nail-lab',
    type: 'nail_studio',
    plan: 'pro',
    phone: '055 444 121',
    city: 'Երևան',
    address: 'Կոմիտաս 45',
    status: 'active',
    ownerEmail: 'lilit@naillab.am',
    createdAt: '2026-05-20',
    nextBillingDate: '2026-10-20',
  }),
  mkBiz({
    id: 'biz-zen-massage',
    name: 'Zen Massage',
    slug: 'zen-massage',
    type: 'massage',
    plan: 'business',
    phone: '077 888 909',
    city: 'Վանաձոր',
    address: 'Տիգրան Մեծ 3',
    status: 'suspended',
    ownerEmail: 'arman@zen.am',
    createdAt: '2026-06-01',
    nextBillingDate: '2026-09-01',
  }),
  mkBiz({
    id: 'biz-smile-clinic',
    name: 'Smile Dental',
    slug: 'smile-dental',
    type: 'dental',
    plan: 'enterprise',
    phone: '010 555 777',
    city: 'Երևան',
    address: 'Սայաթ-Նովա 12',
    status: 'active',
    ownerEmail: 'clinic@smile.am',
    createdAt: '2026-03-10',
    nextBillingDate: '2026-10-10',
  }),
];

export const seedSalonRequests: SalonRequest[] = [
  {
    id: 'req-001',
    businessName: 'Rose Beauty',
    ownerName: 'Նարե Հովհաննիսյան',
    ownerEmail: 'nare@rosebeauty.am',
    ownerPhone: '091 333 444',
    city: 'Երևան',
    type: 'beauty_salon',
    planRequested: 'business' as PlanId,
    employees: [{ name: 'Նարե', role: 'Վարսահարդար' }],
    services: [{ name: 'Կտրվածք', price: 7000, duration: 45 }],
    workingHours: defaultWorkingHours,
    status: 'pending',
    notes: '',
    createdAt: '2026-09-28T10:20:00.000Z',
    updatedAt: '2026-09-28T10:20:00.000Z',
  },
  {
    id: 'req-002',
    businessName: 'Cut & Style',
    ownerName: 'Դավիթ Մկրտչյան',
    ownerEmail: 'david@cutstyle.am',
    ownerPhone: '098 111 222',
    city: 'Աբովյան',
    type: 'barbershop',
    planRequested: 'starter',
    employees: [
      { name: 'Դավիթ', role: 'Սափրիչ' },
      { name: 'Հայկ', role: 'Սափրիչ' },
    ],
    services: [
      { name: 'Տղամարդու կտրվածք', price: 4000, duration: 30 },
      { name: 'Մորուքի ձևավորում', price: 3000, duration: 20 },
    ],
    workingHours: defaultWorkingHours,
    status: 'reviewing',
    notes: 'Ստուգել հեռախոսահամարը',
    createdAt: '2026-09-26T14:00:00.000Z',
    updatedAt: '2026-09-27T09:00:00.000Z',
  },
  {
    id: 'req-003',
    businessName: 'Old Spa',
    ownerName: 'Լևոն',
    ownerEmail: 'levon@oldspa.am',
    ownerPhone: '094 000 111',
    city: 'Երևան',
    type: 'massage',
    planRequested: 'pro',
    employees: [{ name: 'Լևոն', role: 'Մերսող' }],
    services: [{ name: 'Դասական մերսում', price: 12000, duration: 60 }],
    workingHours: defaultWorkingHours,
    status: 'rejected',
    notes: 'Անլիիր տվյալներ',
    createdAt: '2026-09-20T11:00:00.000Z',
    updatedAt: '2026-09-21T16:00:00.000Z',
  },
];
