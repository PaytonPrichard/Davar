-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- This creates the table and security policies for Davar cloud sync.

-- 1. Create the user_progress table
create table if not exists public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  progress_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Enable Row Level Security
alter table public.user_progress enable row level security;

-- 3. Users can only read their own row
create policy "Users can read own progress"
  on public.user_progress
  for select
  using (auth.uid() = user_id);

-- 4. Users can insert their own row
create policy "Users can insert own progress"
  on public.user_progress
  for insert
  with check (auth.uid() = user_id);

-- 5. Users can update their own row
create policy "Users can update own progress"
  on public.user_progress
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 6. Users can delete their own row (for account deletion)
create policy "Users can delete own progress"
  on public.user_progress
  for delete
  using (auth.uid() = user_id);

-- 7. Index for faster lookups (primary key already covers this, but explicit for clarity)
-- No additional index needed since user_id is the primary key.

-- 8. Optional: auto-update the updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_user_progress_updated
  before update on public.user_progress
  for each row
  execute function public.handle_updated_at();
