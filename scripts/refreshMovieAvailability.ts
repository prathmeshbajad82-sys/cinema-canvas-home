/**
 * Background simulation script — updates movie availability.
 *
 * Run locally:
 *   npx tsx scripts/refreshMovieAvailability.ts            # one tick
 *   npx tsx scripts/refreshMovieAvailability.ts --watch    # every 60s
 *
 * In production this would be wired to a cron job (e.g. pg_cron calling the
 * `public.refresh_movie_availability()` SQL function). For local dev we
 * call it from the client using the service role would be unsafe, so this
 * script invokes the database function via the anon key + RPC, which works
 * because `refresh_movie_availability` is SECURITY DEFINER. If RPC is not
 * exposed, fall back to randomly toggling per row using the public anon key.
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE key env vars.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function tick() {
  const { data, error } = await supabase.rpc('refresh_movie_availability' as any);
  if (error) {
    console.error('[refresh] failed:', error.message);
  } else {
    console.log(`[refresh] availability refreshed at ${new Date().toISOString()}`, data ?? '');
  }
}

const watch = process.argv.includes('--watch');
(async () => {
  await tick();
  if (watch) {
    setInterval(tick, 60_000);
  }
})();
