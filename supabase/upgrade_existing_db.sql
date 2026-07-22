-- Run once in Supabase SQL Editor on existing databases (incremental upgrade)
-- Safe to run multiple times.

-- 1) Upload status + duplicate hash columns
alter table uploads
  add column if not exists status text not null default 'latest';

alter table uploads
  add column if not exists content_hash text not null default '';

do $$
begin
  alter table uploads
    add constraint uploads_status_check
    check (status in ('latest', 'duplicate', 'previous'));
exception
  when duplicate_object then null;
end $$;

-- 2) Allow status updates when restoring previous sheets after manager delete
do $$
begin
  create policy "public update uploads" on uploads for update using (true) with check (true);
exception
  when duplicate_object then null;
end $$;
