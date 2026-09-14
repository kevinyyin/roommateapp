"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeRefresh } from "@/lib/hooks/useRealtimeRefresh";
import { deleteAnnouncement, setAnnouncementPinned } from "@/lib/queries/announcements";
import type { Announcement, HouseholdMember } from "@/lib/types";
import { Lane } from "@/components/Lane";
import { Button } from "@/components/ui/Button";
import { AddAnnouncementForm } from "./AddAnnouncementForm";

function sortAnnouncements(items: Announcement[]): Announcement[] {
  return [...items].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export function AnnouncementsBoard({
  householdId,
  members,
  announcements,
  currentUserId,
}: {
  householdId: string;
  members: HouseholdMember[];
  announcements: Announcement[];
  currentUserId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [adding, setAdding] = useState(false);
  const [pinOverrides, setPinOverrides] = useState<Record<string, boolean>>({});
  const [pinInFlight, setPinInFlight] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useRealtimeRefresh(supabase, `announcements-${householdId}`, [
    { table: "announcements", filter: `household_id=eq.${householdId}` },
  ]);

  // Once fresh server data agrees with an optimistic override, drop it so a
  // later change (ours or a roommate's) isn't masked by stale local state.
  useEffect(() => {
    setPinOverrides((prev) => {
      const next = { ...prev };
      for (const item of announcements) {
        if (next[item.id] === item.pinned) delete next[item.id];
      }
      return next;
    });
  }, [announcements]);

  const nameById = new Map(members.map((m) => [m.user_id, m.display_name]));
  const displayAnnouncements = sortAnnouncements(
    announcements.map((item) => (item.id in pinOverrides ? { ...item, pinned: pinOverrides[item.id] } : item))
  );

  async function togglePinned(item: Announcement) {
    const next = !item.pinned;
    setPinOverrides((prev) => ({ ...prev, [item.id]: next }));
    setPinInFlight((prev) => new Set(prev).add(item.id));
    try {
      await setAnnouncementPinned(supabase, item.id, next);
      router.refresh();
    } catch {
      setPinOverrides((prev) => ({ ...prev, [item.id]: item.pinned }));
    } finally {
      setPinInFlight((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  }

  async function handleDelete(item: Announcement) {
    setDeletingId(item.id);
    try {
      await deleteAnnouncement(supabase, item.id);
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {adding ? (
        <AddAnnouncementForm householdId={householdId} authorId={currentUserId} onDone={() => setAdding(false)} />
      ) : (
        <Button onClick={() => setAdding(true)} className="w-full">
          + Post an announcement
        </Button>
      )}

      <div className="space-y-3">
        {displayAnnouncements.length === 0 && (
          <p className="text-center text-sm text-ink-soft">No announcements yet.</p>
        )}
        {displayAnnouncements.map((item) => (
          <Lane key={item.id} category="announcements" title={item.title}>
            <p className="whitespace-pre-wrap text-sm text-ink">{item.body}</p>
            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-ink-soft">
              <span>
                {nameById.get(item.author_id) ?? "someone"} · {new Date(item.created_at).toLocaleDateString()}
              </span>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant={item.pinned ? "action" : "ghost"}
                  onClick={() => togglePinned(item)}
                  disabled={pinInFlight.has(item.id)}
                >
                  {item.pinned ? "Pinned" : "Pin"}
                </Button>
                {item.author_id === currentUserId && (
                  <Button variant="danger" onClick={() => handleDelete(item)} disabled={deletingId === item.id}>
                    {deletingId === item.id ? "…" : "Delete"}
                  </Button>
                )}
              </div>
            </div>
          </Lane>
        ))}
      </div>
    </div>
  );
}
