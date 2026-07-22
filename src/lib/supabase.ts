import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL ?? '').trim()
const supabaseKey = String(
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    '',
).trim()

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null

export async function checkDatabaseSetup(): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: false,
      message:
        'Database not connected. In Vercel, set env vars for Production (not only Development) and Redeploy.',
    }
  }

  const [entriesCheck, usersCheck, uploadsCheck] = await Promise.all([
    supabase.from('sales_entries').select('id').limit(1),
    supabase.from('users').select('id').limit(1),
    supabase.from('uploads').select('status, content_hash').limit(1),
  ])

  if (
    entriesCheck.error?.code === 'PGRST205' ||
    usersCheck.error?.code === 'PGRST205' ||
    uploadsCheck.error?.code === 'PGRST205'
  ) {
    return {
      ok: false,
      message: 'Tables missing. Run supabase/schema.sql in Supabase SQL Editor.',
    }
  }

  if (uploadsCheck.error?.message?.includes('content_hash') || uploadsCheck.error?.message?.includes('status')) {
    return {
      ok: false,
      message: 'Upload columns missing. Run supabase/add_upload_status.sql in Supabase SQL Editor.',
    }
  }

  if (entriesCheck.error) {
    return { ok: false, message: entriesCheck.error.message }
  }

  if (usersCheck.error) {
    return { ok: false, message: usersCheck.error.message }
  }

  if (uploadsCheck.error) {
    return { ok: false, message: uploadsCheck.error.message }
  }

  const { count } = await supabase.from('users').select('*', { count: 'exact', head: true })

  if (!count) {
    return {
      ok: false,
      message: 'No users in database. Add users to the Supabase users table.',
    }
  }

  return { ok: true, message: 'Connected' }
}
