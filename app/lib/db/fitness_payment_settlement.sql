-- Apply before deploying the payment settlement code. One transaction per user/payment.
begin;
alter table public.subscriptions add column if not exists amount_paise bigint;
alter table public.subscriptions add column if not exists currency text;
create table if not exists public.fitness_payment_receipts (
 payment_id text primary key, order_id text not null unique,
 user_id uuid not null references auth.users(id), amount_paise bigint not null check(amount_paise > 0),
 currency text not null, processed_at timestamptz not null default now()
);
alter table public.fitness_payment_receipts enable row level security;
create or replace function public.settle_fitness_payment(p_user uuid, p_order text, p_payment text, p_tier text, p_level text, p_amount bigint, p_currency text)
returns void language plpgsql security definer set search_path = public as $$
declare base_expiry timestamptz; new_expiry timestamptz;
begin
 if p_tier not in ('monthly','six_months','lifetime') or p_level not in ('core','pro') or p_amount <= 0 or p_currency <> 'INR' then raise exception 'Invalid payment'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_user::text, 0));
 if exists(select 1 from fitness_payment_receipts where payment_id=p_payment or order_id=p_order) then return; end if;
 -- Legacy payments may have completed before this migration.
 if exists(select 1 from subscriptions where razorpay_payment_id=p_payment)
 or exists(select 1 from fitness_os_subscriptions where provider_payment_id=p_payment) then
   insert into fitness_payment_receipts values(p_payment,p_order,p_user,p_amount,p_currency,now());
   return;
 end if;
 select greatest(s.current_period_end, f.fitness_premium_expires_at, now()) into base_expiry
 from fitness_os_profiles f left join fitness_os_subscriptions s on s.user_id=f.user_id where f.user_id=p_user;
 if not found then raise exception 'Fitness profile missing'; end if;
 new_expiry := case when p_tier='lifetime' then null when p_tier='six_months' then base_expiry+interval '6 months' else base_expiry+interval '1 month' end;
 update fitness_os_profiles set fitness_is_premium=true,fitness_premium_tier=p_tier,fitness_premium_level=p_level,fitness_premium_expires_at=new_expiry where user_id=p_user;
 insert into fitness_os_subscriptions(user_id,plan,status,provider,provider_order_id,provider_payment_id,current_period_start,current_period_end)
 values(p_user,case when p_level='pro' then 'pro' else 'starter' end,'active','razorpay',p_order,p_payment,now(),new_expiry)
 on conflict(user_id) do update set plan=excluded.plan,status=excluded.status,provider=excluded.provider,provider_order_id=excluded.provider_order_id,provider_payment_id=excluded.provider_payment_id,current_period_start=excluded.current_period_start,current_period_end=excluded.current_period_end;
 insert into subscriptions(user_id,plan,status,razorpay_order_id,razorpay_payment_id,expires_at,started_at,amount_paise,currency)
 values(p_user,'fitness_'||p_tier||'_'||p_level,'active',p_order,p_payment,new_expiry,now(),p_amount,p_currency);
 insert into fitness_payment_receipts values(p_payment,p_order,p_user,p_amount,p_currency,now());
end;
$$;
revoke all on function public.settle_fitness_payment(uuid,text,text,text,text,bigint,text) from public,anon,authenticated;
grant execute on function public.settle_fitness_payment(uuid,text,text,text,text,bigint,text) to service_role;

commit;
