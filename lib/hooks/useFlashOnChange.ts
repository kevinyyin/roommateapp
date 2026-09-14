"use client";

import { useCallback, useRef, useState } from "react";

// Tracks one "recently changed" row id so a realtime update can flash into
// place instead of silently reshuffling the list under a thumb.
export function useFlashOnChange(durationMs = 1200) {
  const [flashId, setFlashId] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = useCallback(
    (id: string | undefined | null) => {
      if (!id) return;
      setFlashId(id);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setFlashId(null), durationMs);
    },
    [durationMs]
  );

  return { flashId, flash };
}
