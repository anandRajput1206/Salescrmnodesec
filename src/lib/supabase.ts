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
    return { ok: true, message: 'Using browser local storage.' }
  }

  const { error } = await supabase.from('sales_entries').select('id').limit(1)

  if (error?.code === 'PGRST205') {
    return {
      ok: false,
      message:
        'Supabase tables are missing. Open Supabase → SQL Editor → run supabase/schema.sql, then refresh.',
    }
  }

  if (error) {
    return { ok: false, message: `Supabase error: ${error.message}` }
  }

  return { ok: true, message:
    //  'Connected to Supabase cloud storage.'
    ''
     }
}
