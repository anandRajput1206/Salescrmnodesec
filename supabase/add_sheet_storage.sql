-- Archive original Excel files so they can be downloaded later.
-- Run once in Supabase SQL Editor. Safe to run more than once.

alter table uploads
  add column if not exists storage_path text not null default '';

insert into storage.buckets (id, name, public)
values ('sales-sheets', 'sales-sheets', false)
on conflict (id) do nothing;

do $$
begin
  create policy "read sales sheets" on storage.objects
    for select using (bucket_id = 'sales-sheets');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create policy "insert sales sheets" on storage.objects
    for insert with check (bucket_id = 'sales-sheets');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create policy "delete sales sheets" on storage.objects
    for delete using (bucket_id = 'sales-sheets');
exception
  when duplicate_object then null;
end $$;
