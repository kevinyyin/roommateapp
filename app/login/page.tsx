"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "./actions";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <main className="ruled flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-action">Roomly</p>
          <h1 className="mt-2 text-2xl font-bold text-ink">Welcome back</h1>
        </div>

        <form action={formAction} className="space-y-5 rounded-xl bg-paper-raised p-6 shadow-sm">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>

          {state?.error && <p className="text-sm text-danger">{state.error}</p>}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          New here?{" "}
          <Link href="/signup" className="font-semibold text-action">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
