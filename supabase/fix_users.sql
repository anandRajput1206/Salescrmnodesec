-- Cleanup script only: fix corrupted user IDs in Supabase
-- Users, roles, and passwords are managed directly in the users table (not in app code)

update users set id = trim(id);
update users set email = lower(trim(email));
update users set name = trim(name);
update users set first_name = trim(first_name);
update users set region = trim(region);
update users set zone = trim(zone);

delete from users where id = '' or email = '';

-- Verify users loaded from database
select id, email, role, region, zone from users order by role, name;
