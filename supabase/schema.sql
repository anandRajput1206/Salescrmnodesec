-- CyberSecurity Sales CRM — fresh schema
-- Run this entire file in Supabase SQL Editor

drop table if exists sales_records cascade;
drop table if exists pipeline cascade;
drop table if exists forecast cascade;
drop table if exists partners cascade;
drop table if exists meetings cascade;
drop table if exists sales_entries cascade;
drop table if exists uploads cascade;
drop table if exists users cascade;

create table users (
  id text primary key,
  email text not null unique,
  password text not null,
  name text not null,
  first_name text not null,
  role text not null check (role in ('admin', 'manager', 'sales_team')),
  region text default '',
  zone text default '',
  created_at timestamptz not null default now()
);

create table uploads (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  user_name text not null,
  file_name text not null,
  row_count integer not null default 0,
  uploaded_at timestamptz not null default now()
);

create table sales_entries (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  user_name text not null,
  upload_id text not null references uploads(id) on delete cascade,
  uploaded_at timestamptz not null default now(),

  month text default '',
  week_number integer default 0,
  date date,
  month_key text default '',
  quarter text default '',
  week_key text default '',

  region text default '',
  zone text default '',
  region_zone text default '',

  lead_source text default '',
  customer_name text default '',
  industry text default '',
  contact_person text default '',
  designation text default '',

  opportunity_id text default '',
  opportunity_name text default '',
  opportunity_type text default '',
  opportunity_value_inr numeric default 0,
  probability_pct numeric default 0,
  weighted_pipeline_inr numeric default 0,

  sales_stage text default '',
  status text default '',

  meetings_conducted numeric default 0,
  demos_conducted numeric default 0,
  pocs_initiated numeric default 0,
  proposal_submitted numeric default 0,

  expected_close_date date,
  expected_close_month_key text default '',
  expected_close_quarter text default '',

  revenue_closed_inr numeric default 0,
  competitor text default '',
  partner_name text default '',
  renewal_upsell text default '',
  next_action text default '',
  remarks text default ''
);

create index users_email_idx on users(email);
create index users_role_idx on users(role);
create index sales_entries_user_id_idx on sales_entries(user_id);
create index sales_entries_month_key_idx on sales_entries(month_key);
create index sales_entries_quarter_idx on sales_entries(quarter);
create index sales_entries_week_key_idx on sales_entries(week_key);
create index sales_entries_region_idx on sales_entries(region);
create index sales_entries_industry_idx on sales_entries(industry);
create index sales_entries_sales_stage_idx on sales_entries(sales_stage);
create index sales_entries_customer_name_idx on sales_entries(customer_name);

alter table users enable row level security;
alter table uploads enable row level security;
alter table sales_entries enable row level security;

create policy "public read users" on users for select using (true);
create policy "public read uploads" on uploads for select using (true);
create policy "public insert uploads" on uploads for insert with check (true);
create policy "public delete uploads" on uploads for delete using (true);
create policy "public read sales_entries" on sales_entries for select using (true);
create policy "public insert sales_entries" on sales_entries for insert with check (true);
create policy "public delete sales_entries" on sales_entries for delete using (true);

insert into users (id, email, password, name, first_name, role, region, zone) values
  ('user-admin',   'admin@company.com',          'Admin@2024',   'System Admin',  'Admin',  'admin',      'All',   'All'),
  ('user-manager', 'manager@company.com',        'Manager@2024', 'Sales Manager', 'Manager','manager',    'All',   'All'),
  ('user-rahul',   'rahul.sharma@company.com',   'Rahul@2024',   'Rahul Sharma',  'Rahul',  'sales_team', 'North', 'Zone A'),
  ('user-priya',   'priya.nair@company.com',     'Priya@2024',   'Priya Nair',    'Priya',  'sales_team', 'South', 'Zone B'),
  ('user-amit',    'amit.patel@company.com',     'Amit@2024',    'Amit Patel',    'Amit',   'sales_team', 'East',  'Zone C'),
  ('user-kavita',  'kavita.singh@company.com',   'Kavita@2024',  'Kavita Singh',  'Kavita', 'sales_team', 'West',  'Zone D'),
  ('user-rohan',   'rohan.mehta@company.com',    'Rohan@2024',   'Rohan Mehta',   'Rohan',  'sales_team', 'North', 'Zone B');
