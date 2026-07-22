-- Run once in Supabase SQL Editor if uploads table already exists
alter table uploads
  add column if not exists status text not null default 'latest';

alter table uploads
  add column if not exists content_hash text not null default '';

-- Optional: constrain status values (ignore error if constraint already exists)
do $$
begin
  alter table uploads
    add constraint uploads_status_check
    check (status in ('latest', 'duplicate', 'previous'));
exception
  when duplicate_object then null;
end $$;
