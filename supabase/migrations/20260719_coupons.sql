create table if not exists public.coupons (
    id uuid default gen_random_uuid() primary key,
    code text not null unique,
    discount_percentage int not null check (discount_percentage > 0 and discount_percentage <= 100),
    max_uses int not null default 1,
    used_count int not null default 0,
    is_active boolean not null default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.coupons enable row level security;

-- Only admins can create/update (enforced via Service Role key, so no policy needed for that)
-- Public can read active coupons to validate them during checkout
create policy "Anyone can read active coupons"
    on public.coupons for select
    using (is_active = true);
