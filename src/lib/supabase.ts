import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null

export async function checkDatabaseSetup(): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: false,
      message: 'Supabase not configured. Add env variables and restart.',
    }
  }

  const [entriesCheck, usersCheck] = await Promise.all([
    supabase.from('sales_entries').select('id').limit(1),
    supabase.from('users').select('id').limit(1),
  ])

  if (entriesCheck.error?.code === 'PGRST205' || usersCheck.error?.code === 'PGRST205') {
    return {
      ok: false,
      message: 'Tables missing. Run supabase/schema.sql in Supabase SQL Editor.',
    }
  }

  if (entriesCheck.error) {
    return { ok: false, message: entriesCheck.error.message }
  }

  if (usersCheck.error) {
    return { ok: false, message: usersCheck.error.message }
  }

  const { count } = await supabase.from('users').select('*', { count: 'exact', head: true })

  if (!count) {
    return {
      ok: false,
      message: 'No users in database. Add users to the Supabase users table.',
    }
  }

  return { ok: true, message: 'Live data from Supabase PostgreSQL' }
}
