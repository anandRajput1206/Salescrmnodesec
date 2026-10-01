-- New CyberSecurity Sales template fields. Run once in Supabase SQL Editor.

alter table sales_entries add column if not exists customer_email text not null default '';
alter table sales_entries add column if not exists customer_mobile text not null default '';
alter table sales_entries add column if not exists partner_company text not null default '';
alter table sales_entries add column if not exists partner_contact text not null default '';
alter table sales_entries add column if not exists partner_email text not null default '';
alter table sales_entries add column if not exists partner_mobile text not null default '';
alter table sales_entries add column if not exists oem_description text not null default '';
alter table sales_entries add column if not exists product_value_inr numeric not null default 0;
alter table sales_entries add column if not exists hosting_value_inr numeric not null default 0;
alter table sales_entries add column if not exists prof_service_value_inr numeric not null default 0;

update sales_entries
set partner_company = partner_name
where partner_company = '' and partner_name <> '';
