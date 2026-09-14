"use client";

import { useState, useActionState } from "react";
import { createHouseholdAction, joinHouseholdAction } from "./actions";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function HouseholdSetupPage() {
  const [tab, setTab] = useState<"create" | "join">("create");
  const [createState, createAction, creating] = useActionState(createHouseholdAction, undefined);
  const [joinState, joinAction, joining] = useActionState(joinHouseholdAction, undefined);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-action">Roomly</p>
          <h1 className="mt-2 text-2xl font-bold text-ink">Set up your household</h1>
        </div>

        <div className="mb-4 flex rounded-lg border border-rule p-1">
          {(["create", "join"] as const).map((option) => (
            <button
              key={option}
              onClick={() => setTab(option)}
              className={`flex-1 rounded-md py-2 text-sm font-semibold capitalize transition-colors ${
                tab === option ? "bg-action text-white" : "text-ink-soft"
              }`}
            >
              {option === "create" ? "Create new" : "Join existing"}
            </button>
          ))}
        </div>

        {tab === "create" ? (
          <form action={createAction} className="ruled space-y-5 rounded-xl bg-paper-raised p-6 shadow-sm">
            <div>
              <Label htmlFor="name">Household name</Label>
              <Input id="name" name="name" placeholder="e.g. 214 Maple St" required />
            </div>
            {createState?.error && <p className="text-sm text-danger">{createState.error}</p>}
            <Button type="submit" disabled={creating} className="w-full">
              {creating ? "Creating…" : "Create household"}
            </Button>
          </form>
        ) : (
          <form action={joinAction} className="ruled space-y-5 rounded-xl bg-paper-raised p-6 shadow-sm">
            <div>
              <Label htmlFor="code">Invite code</Label>
              <Input
                id="code"
                name="code"
                placeholder="e.g. 4F9A2C"
                required
                className="uppercase tracking-widest"
              />
            </div>
            {joinState?.error && <p className="text-sm text-danger">{joinState.error}</p>}
            <Button type="submit" disabled={joining} className="w-full">
              {joining ? "Joining…" : "Join household"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
