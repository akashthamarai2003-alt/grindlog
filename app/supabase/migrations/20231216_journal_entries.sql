create table if not exists public.journal_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  title text,
  content text,
  mood smallint check (mood between 1 and 5),
  energy smallint check (energy between 1 and 5),
  focus smallint check (focus between 1 and 5),
  photo_urls text[],
  voice_note_url text,
  voice_transcript text,
  ai_summary text,
  ai_sentiment text,
  ai_insights text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

alter table public.journal_entries enable row level security;

create policy "Users can view own journal entries"
  on public.journal_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own journal entries"
  on public.journal_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own journal entries"
  on public.journal_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own journal entries"
  on public.journal_entries for delete
  using (auth.uid() = user_id);
