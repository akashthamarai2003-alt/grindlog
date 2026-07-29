-- 1. Create Quests Table
create table if not exists public.user_quests (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users not null,
    quest_type text not null, -- 'daily', 'weekly', 'monthly'
    quest_key text not null,  -- e.g., 'complete_3_habits'
    date_key text not null,   -- e.g., '2026-07-16' for daily, '2026-W28' for weekly
    progress_current integer default 0,
    progress_target integer not null,
    is_completed boolean default false,
    xp_reward integer not null,
    coins_reward integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure a user only has one active quest of a specific key per date period
alter table public.user_quests drop constraint if exists user_quests_unique;
alter table public.user_quests add constraint user_quests_unique unique (user_id, quest_key, date_key);

-- RLS for user_quests
alter table public.user_quests enable row level security;

create policy "Users can view own quests"
    on public.user_quests for select
    using (auth.uid() = user_id);

create policy "Users can insert own quests"
    on public.user_quests for insert
    with check (auth.uid() = user_id);

create policy "Users can update own quests"
    on public.user_quests for update
    using (auth.uid() = user_id);


-- 2. Create Season Progress Table
create table if not exists public.season_progress (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users not null,
    season_id text not null, -- e.g., 'season_1'
    current_xp integer default 0,
    claimed_tiers integer[] default array[]::integer[],
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.season_progress drop constraint if exists season_progress_unique;
alter table public.season_progress add constraint season_progress_unique unique (user_id, season_id);

-- RLS for season_progress
alter table public.season_progress enable row level security;

create policy "Users can view own season progress"
    on public.season_progress for select
    using (auth.uid() = user_id);

create policy "Users can insert own season progress"
    on public.season_progress for insert
    with check (auth.uid() = user_id);

create policy "Users can update own season progress"
    on public.season_progress for update
    using (auth.uid() = user_id);


-- 3. Seed Default Achievements
-- Assuming achievements table already exists and doesn't have a unique constraint on key,
-- we can't use ON CONFLICT easily without a constraint. We'll add a unique constraint on key first.
alter table public.achievements drop constraint if exists achievements_key_unique;
alter table public.achievements add constraint achievements_key_unique unique (key);

insert into public.achievements (id, key, name, description, emoji, category, xp_reward, coins_reward, sort_order)
values 
(gen_random_uuid(), 'first_steps', 'First Steps', 'Complete your first habit', '🏆', 'streaks', 100, 50, 1),
(gen_random_uuid(), 'weekly_warrior', 'Weekly Warrior', '7-day streak on any habit', '🔥', 'streaks', 200, 100, 2),
(gen_random_uuid(), 'habit_formed', 'Habit Formed', '21-day streak on any habit', '💪', 'streaks', 500, 200, 3),
(gen_random_uuid(), 'monthly_master', 'Monthly Master', '30-day streak on any habit', '📅', 'streaks', 1000, 500, 4),
(gen_random_uuid(), 'early_bird', 'Early Bird', 'Complete a habit before 9 AM', '🌅', 'consistency', 150, 50, 5),
(gen_random_uuid(), 'night_owl', 'Night Owl', 'Complete a habit after 9 PM', '🦉', 'consistency', 150, 50, 6),
(gen_random_uuid(), 'perfect_week', 'Perfect Week', 'Complete all active habits for 7 days', '⭐', 'consistency', 1000, 300, 7),
(gen_random_uuid(), 'first_leaf', 'First Leaf', 'Tree grows its first leaf', '🍃', 'tree', 100, 50, 8),
(gen_random_uuid(), 'butterfly_effect', 'Butterfly Effect', 'First butterfly on your tree', '🦋', 'tree', 300, 150, 9)
on conflict (key) do nothing;

-- 4. Set up Realtime for new tables (optional, but good for UI)
-- Check if publication exists first or just alter it directly (might fail if not enabled)
-- alter publication supabase_realtime add table public.user_quests;
-- alter publication supabase_realtime add table public.season_progress;
-- alter publication supabase_realtime add table public.user_achievements;
