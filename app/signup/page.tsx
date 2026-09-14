"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "./actions";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, undefined);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-action">Roomly</p>
          <h1 className="mt-2 text-2xl font-bold text-ink">Create your account</h1>
        </div>

        <form action={formAction} className="ruled space-y-5 rounded-xl bg-paper-raised p-6 shadow-sm">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          {state && "error" in state && <p className="text-sm text-danger">{state.error}</p>}
          {state && "message" in state && <p className="text-sm text-chores">{state.message}</p>}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-action">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
