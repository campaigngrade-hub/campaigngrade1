import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use the Supabase Management API to run SQL
async function runSQL(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  return response;
}

// Try using pg-based approach via the Supabase dashboard SQL executor
// Actually let's use the Supabase JS client which supports running raw SQL via the admin API
async function main() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });

  // Test connection
  const { data, error } = await supabase.from('profiles').select('count').limit(0);
  console.log('Connection test:', { data, error });

  if (error && error.code === 'PGRST205') {
    console.log('Tables do not exist yet - need to run DDL via SQL editor');
    console.log('Please run the SQL files manually in the Supabase SQL editor:');
    console.log('1. supabase/migrations/001_initial_schema.sql');
    console.log('2. supabase/migrations/002_seed_firms.sql');
  }
}

main().catch(console.error);
