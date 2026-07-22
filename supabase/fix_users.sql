-- Fix corrupted user IDs (trailing spaces/newlines) — run once in Supabase SQL Editor
-- Example bad value: 'user-amandeep' with a hidden newline at the end

BEGIN;

ALTER TABLE uploads DROP CONSTRAINT IF EXISTS uploads_user_id_fkey;
ALTER TABLE sales_entries DROP CONSTRAINT IF EXISTS sales_entries_user_id_fkey;

UPDATE uploads SET user_id = trim(user_id);
UPDATE sales_entries SET user_id = trim(user_id);

UPDATE users
SET
  id = trim(id),
  email = lower(trim(email)),
  name = trim(name),
  first_name = trim(first_name),
  region = trim(region),
  zone = trim(zone);

DELETE FROM uploads WHERE user_id NOT IN (SELECT id FROM users);
DELETE FROM sales_entries WHERE user_id NOT IN (SELECT id FROM users);

ALTER TABLE uploads
  ADD CONSTRAINT uploads_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE sales_entries
  ADD CONSTRAINT sales_entries_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

COMMIT;

-- Verify (id_length should match visible id length)
SELECT id, length(id) AS id_length, email, role FROM users ORDER BY role, name;
