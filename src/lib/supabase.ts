import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client for real RSVP + live guest-wall.
 *
 * ─── Setup (one-time) ────────────────────────────────────────────────
 *  1. Create a free project at https://supabase.com
 *  2. Project → Settings → API → copy "Project URL" and "anon/public" key
 *  3. Put them in .env.local:
 *       NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
 *       NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
 *  4. Run this SQL in Supabase SQL Editor:
 *
 *     create table public.rsvps (
 *       id          uuid primary key default gen_random_uuid(),
 *       name        text not null,
 *       attending   boolean not null,
 *       events      text[] not null default '{}',
 *       message     text,
 *       created_at  timestamptz not null default now()
 *     );
 *
 *     alter table public.rsvps enable row level security;
 *
 *     -- allow anyone to insert a reply (guests)
 *     create policy "rsvp_insert_anon" on public.rsvps
 *       for insert to anon, authenticated with check (true);
 *
 *     -- allow anyone to read non-null messages for the live wall
 *     create policy "rsvp_read_messages" on public.rsvps
 *       for select to anon, authenticated using (message is not null);
 *
 *     alter publication supabase_realtime add table public.rsvps;
 *
 *     -- Presence-diya counter (Ardhanarishwara section).
 *     -- Returns just the count of confirmed-attending RSVPs; no rows
 *     -- leak, so guest names stay private even though anon can call it.
 *     create or replace function public.presence_count()
 *       returns bigint
 *       language sql
 *       security definer
 *       set search_path = public
 *       as $$
 *         select count(*)::bigint from public.rsvps where attending = true;
 *       $$;
 *     grant execute on function public.presence_count() to anon, authenticated;
 *
 *  5. Restart the dev server. The live guest wall and RSVP submission
 *     begin working automatically. Without keys the UI gracefully falls
 *     back to a "connect Supabase" placeholder.
 * ──────────────────────────────────────────────────────────────────────
 */

export type RSVPRow = {
  id: string;
  name: string;
  attending: boolean;
  events: string[];
  message: string | null;
  created_at: string;
};

export type RSVPInsert = Omit<RSVPRow, "id" | "created_at">;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

export const hasSupabase = Boolean(supabase);

export async function submitRSVP(row: RSVPInsert) {
  if (!supabase) {
    console.warn("[rsvp] Supabase not configured; skipping persistence");
    return { ok: false as const, error: "not-configured" };
  }
  const { error } = await supabase.from("rsvps").insert(row);
  if (error) {
    console.error("[rsvp] insert failed", error);
    return { ok: false as const, error: error.message };
  }
  return { ok: true as const };
}

/**
 * Live count of attending RSVPs — feeds the presence-diya counter under
 * the Ardhanarishwara mandala. Backed by a security-definer Postgres
 * function so RLS can keep guest names private while the count itself
 * is publicly readable. Returns null when Supabase isn't configured or
 * the call fails — callers should hide the counter UI in that case.
 */
export async function getPresenceCount(): Promise<number | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("presence_count");
  if (error) {
    console.warn("[presence] count fetch failed", error.message);
    return null;
  }
  if (typeof data === "number") return data;
  const n = Number(data);
  return Number.isFinite(n) ? n : null;
}
