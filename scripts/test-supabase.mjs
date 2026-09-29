import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
const { data, error } = await sb.from('businesses').select('id,name,slug').limit(5);
if (error) {
  console.error('FAIL', error.message);
  process.exit(1);
}
console.log('OK', data?.length ?? 0, 'businesses');
console.log((data || []).map((b) => b.slug).join(', '));
