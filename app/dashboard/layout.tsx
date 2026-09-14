import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyHousehold } from "@/lib/queries/household";
import { BottomNav } from "@/components/BottomNav";
import { logout } from "./actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const context = await getMyHousehold(supabase);

  if (!context) redirect("/household/setup");
  const { household } = context;

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-rule px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/dashboard" className="block">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-action">Roomly</p>
            <h1 className="text-lg font-bold text-ink">{household.name}</h1>
          </Link>
          <div className="flex items-center gap-3">
            <span className="rounded-md border border-rule px-2 py-1 font-mono text-xs tabular text-ink-soft">
              {household.invite_code}
            </span>
            <form action={logout}>
              <button className="text-xs font-semibold text-ink-soft hover:text-ink">Sign out</button>
            </form>
          </div>
        </div>
      </header>

      <main className="ruled mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6">{children}</main>

      <BottomNav />
    </div>
  );
}
