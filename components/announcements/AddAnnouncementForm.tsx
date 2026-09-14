"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { addAnnouncement } from "@/lib/queries/announcements";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

export function AddAnnouncementForm({
  householdId,
  authorId,
  onDone,
}: {
  householdId: string;
  authorId: string;
  onDone: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const supabase = createClient();
      await addAnnouncement(supabase, {
        householdId,
        authorId,
        title: title.trim(),
        body: body.trim(),
      });
      router.refresh();
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't post announcement.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="ruled space-y-4 rounded-xl bg-paper-raised p-4">
      <div>
        <Label htmlFor="announcement-title">Title</Label>
        <Input
          id="announcement-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Rent due Friday"
          required
        />
      </div>
      <div>
        <Label htmlFor="announcement-body">Message</Label>
        <textarea
          id="announcement-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Details for the house…"
          required
          rows={3}
          className="w-full border-0 border-b-2 border-rule bg-transparent px-0.5 py-2 text-base text-ink placeholder:text-ink-soft/60 focus:border-action focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Posting…" : "Post"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
