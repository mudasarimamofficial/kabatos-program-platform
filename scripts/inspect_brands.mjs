import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SECRET_KEY

if (!url || !serviceKey) {
  console.error('Missing url or serviceKey', { url: !!url, serviceKey: !!serviceKey })
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  const { data, error } = await supabase
    .from('brands')
    .select('*, program_configs(*)')
  
  if (error) {
    console.error('DB Error:', error)
    process.exit(1)
  }
  
  console.log('BRANDS_COUNT:', data?.length)
  for (const b of data || []) {
    console.log('=== BRAND ===', JSON.stringify(b, null, 2))
  }
}

main().catch(err => {
  console.error('Crash:', err)
  process.exit(1)
})
