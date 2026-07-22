-- Allow managers/admins (via app) to update upload status when restoring previous sheets
do $$
begin
  create policy "public update uploads" on uploads for update using (true) with check (true);
exception
  when duplicate_object then null;
end $$;
