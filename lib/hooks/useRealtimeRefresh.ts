"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";

export type RealtimeChange = {
  table: string;
  new: Record<string, unknown> | null;
  old: Record<string, unknown> | null;
};

// Subscribes to Postgres change events on the given tables and re-runs the
// server component's data fetch whenever one fires — this is the whole
// real-time sync mechanism: a roommate's change streams in, we re-fetch.
// An optional onChange fires first with the raw row, so callers can flash
// the changed row instead of letting it silently reshuffle under a thumb.
export function useRealtimeRefresh(
  supabase: SupabaseClient,
  channelName: string,
  tables: { table: string; filter?: string }[],
  onChange?: (change: RealtimeChange) => void
) {
  const router = useRouter();
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    const channel = supabase.channel(channelName);

    for (const { table, filter } of tables) {
      channel.on(
        "postgres_changes" as never,
        { event: "*", schema: "public", table, filter },
        (payload: { new: Record<string, unknown> | null; old: Record<string, unknown> | null }) => {
          onChangeRef.current?.({ table, new: payload.new ?? null, old: payload.old ?? null });
          router.refresh();
        }
      );
    }

    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName]);
}
