"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";

// Subscribes to Postgres change events on the given tables and re-runs the
// server component's data fetch whenever one fires — this is the whole
// real-time sync mechanism: a roommate's change streams in, we re-fetch.
export function useRealtimeRefresh(
  supabase: SupabaseClient,
  channelName: string,
  tables: { table: string; filter?: string }[]
) {
  const router = useRouter();

  useEffect(() => {
    const channel = supabase.channel(channelName);

    for (const { table, filter } of tables) {
      channel.on(
        "postgres_changes" as never,
        { event: "*", schema: "public", table, filter },
        () => router.refresh()
      );
    }

    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName]);
}
