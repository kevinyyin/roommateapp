import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

// Used in Client Components — reads/writes the session from browser cookies.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
