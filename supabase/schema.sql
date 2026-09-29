-- QueueFlow schema (run in Supabase → SQL Editor → New query → Run)

create extension if not exists "pgcrypto";

create table if not exists businesses (
  id text primary key,
  name text not null,
  slug text not null unique,
  type text not null default 'beauty_salon',
  address text default '',
  phone text default '',
  city text default 'Երևան',
  rating numeric default 5,
  review_count int default 0,
  open_until text default '21:00',
  booking_link text,
  plan text default 'business',
  next_billing_date text,
  working_hours jsonb default '{}'::jsonb,
  cancellation_policy text default '',
  booking_rules text default '',
  created_at timestamptz default now()
);

create table if not exists employees (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  name text not null,
  role text default 'Մասնագետ',
  phone text default '',
  services jsonb default '[]'::jsonb,
  working_hours text default '09:00 – 18:00',
  appointments_today int default 0,
  revenue int default 0,
  rating numeric default 5,
  created_at timestamptz default now()
);

create table if not exists services (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  name text not null,
  name_hy text not null,
  price int not null default 0,
  duration int not null default 45,
  description text,
  employee_ids jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists customers (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  name text not null,
  phone text not null,
  birthday text,
  notes text,
  status text default 'active',
  last_visit text,
  total_visits int default 0,
  total_spent int default 0,
  next_visit text,
  created_at timestamptz default now()
);

create table if not exists appointments (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  customer_id text default '',
  customer_name text not null,
  customer_phone text not null,
  service_id text not null,
  service_name text not null,
  employee_id text not null,
  employee_name text not null,
  date text not null,
  start_time text not null,
  end_time text not null,
  status text not null default 'confirmed',
  channel text not null default 'queueflow',
  notes text,
  price int default 0,
  waiting_minutes int,
  created_at timestamptz default now()
);

create index if not exists idx_employees_business on employees(business_id);
create index if not exists idx_services_business on services(business_id);
create index if not exists idx_customers_business on customers(business_id);
create index if not exists idx_appointments_business on appointments(business_id);
create index if not exists idx_appointments_date on appointments(business_id, date);
create index if not exists idx_businesses_slug on businesses(slug);

-- Prototype: open access via anon key (tighten with auth later)
alter table businesses enable row level security;
alter table employees enable row level security;
alter table services enable row level security;
alter table customers enable row level security;
alter table appointments enable row level security;

drop policy if exists "public_all_businesses" on businesses;
drop policy if exists "public_all_employees" on employees;
drop policy if exists "public_all_services" on services;
drop policy if exists "public_all_customers" on customers;
drop policy if exists "public_all_appointments" on appointments;

create policy "public_all_businesses" on businesses for all using (true) with check (true);
create policy "public_all_employees" on employees for all using (true) with check (true);
create policy "public_all_services" on services for all using (true) with check (true);
create policy "public_all_customers" on customers for all using (true) with check (true);
create policy "public_all_appointments" on appointments for all using (true) with check (true);

-- Seed Beauty House demo (optional)
insert into businesses (
  id, name, slug, type, address, phone, city, rating, review_count, open_until,
  booking_link, plan, next_billing_date, working_hours, cancellation_policy, booking_rules
) values (
  'biz-beauty-house',
  'Beauty House',
  'beauty-house',
  'beauty_salon',
  'Աբովյան 15',
  '091 555 010',
  'Երևան, Կենտրոն',
  4.8,
  126,
  '21:00',
  '/book/beauty-house',
  'business',
  '2026-10-28',
  '{
    "monday":{"open":"09:00","close":"21:00"},
    "tuesday":{"open":"09:00","close":"21:00"},
    "wednesday":{"open":"09:00","close":"21:00"},
    "thursday":{"open":"09:00","close":"21:00"},
    "friday":{"open":"09:00","close":"21:00"},
    "saturday":{"open":"10:00","close":"20:00"},
    "sunday":{"open":"10:00","close":"18:00"}
  }'::jsonb,
  'Չեղարկումը պետք է կատարվի այցից առնվազն 2 ժամ առաջ։',
  'Ամրագրումը հաստատվում է ավտոմատ։'
) on conflict (id) do nothing;

insert into employees (id, business_id, name, role, phone, services, working_hours, appointments_today, revenue, rating) values
('emp-anna', 'biz-beauty-house', 'Աննա', 'Վարսահարդար', '091 111 221', '["svc-haircut","svc-coloring","svc-makeup"]', '09:00 – 18:00', 8, 420000, 4.9),
('emp-mariam', 'biz-beauty-house', 'Մարիամ', 'Եղունգների մասնագետ', '091 222 331', '["svc-manicure"]', '10:00 – 19:00', 6, 280000, 4.8),
('emp-sona', 'biz-beauty-house', 'Սոնա', 'Կոսմետոլոգ', '091 333 441', '["svc-coloring","svc-makeup","svc-massage"]', '11:00 – 20:00', 5, 510000, 4.7)
on conflict (id) do nothing;

insert into services (id, business_id, name, name_hy, price, duration, description, employee_ids) values
('svc-haircut', 'biz-beauty-house', 'Haircut', 'Մազերի կտրվածք', 8000, 45, 'Լվացում, կտրվածք և հարդարում', '["emp-anna"]'),
('svc-manicure', 'biz-beauty-house', 'Manicure', 'Մատնահարդարում', 7000, 60, 'Դասական կամ գել', '["emp-mariam"]'),
('svc-coloring', 'biz-beauty-house', 'Hair coloring', 'Մազերի ներկում', 18000, 120, 'Ամբողջական ներկում', '["emp-anna","emp-sona"]'),
('svc-makeup', 'biz-beauty-house', 'Makeup', 'Դիմահարդարում', 15000, 60, 'Երեկոյան կամ ցերեկային', '["emp-anna","emp-sona"]'),
('svc-massage', 'biz-beauty-house', 'Massage', 'Մերսում', 15000, 60, 'Թուլացնող մերսում', '["emp-sona"]')
on conflict (id) do nothing;

-- Platform admin: salon applications + lifecycle fields
alter table businesses add column if not exists status text default 'active';
alter table businesses add column if not exists owner_email text default '';
alter table businesses add column if not exists owner_phone text default '';
alter table businesses add column if not exists trial_ends_at text;

create table if not exists salon_requests (
  id text primary key,
  business_name text not null,
  owner_name text not null,
  owner_email text not null,
  owner_phone text default '',
  city text default '',
  type text default 'beauty_salon',
  plan_requested text default 'business',
  employees jsonb default '[]'::jsonb,
  services jsonb default '[]'::jsonb,
  working_hours jsonb default '{}'::jsonb,
  status text not null default 'pending',
  notes text default '',
  approved_business_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table salon_requests enable row level security;
drop policy if exists "public_all_salon_requests" on salon_requests;
create policy "public_all_salon_requests" on salon_requests for all using (true) with check (true);
