-- Fix 1: Add announcements to realtime publication
alter publication supabase_realtime add table public.announcements;

-- Fix 2: Drop and recreate the household FK with on delete cascade
alter table public.announcements drop constraint announcements_household_id_fkey;
alter table public.announcements add constraint announcements_household_id_fkey
  foreign key (household_id) references public.households(id) on delete cascade;
