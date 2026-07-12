-- 서린컴퍼니 V43 점심 식사 인원 · 외주 업체 인력관리
-- Supabase SQL Editor에서 전체를 1회 실행하세요.

create extension if not exists pgcrypto;

create table if not exists public.contractor_workforce (
  id uuid primary key default gen_random_uuid(),
  work_date date not null,
  company_name text not null,
  work_area text,
  headcount integer not null default 0 check (headcount >= 0),
  meal_count integer not null default 0 check (meal_count >= 0),
  memo text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_contractor_workforce_date
  on public.contractor_workforce(work_date desc);

alter table public.contractor_workforce enable row level security;

drop policy if exists "contractor workforce authenticated read" on public.contractor_workforce;
create policy "contractor workforce authenticated read"
on public.contractor_workforce
for select
to authenticated
using (true);

drop policy if exists "contractor workforce manager insert" on public.contractor_workforce;
create policy "contractor workforce manager insert"
on public.contractor_workforce
for insert
to authenticated
with check (
  public.is_super_admin()
  or public.has_permission('calendar_manage')
);

drop policy if exists "contractor workforce manager update" on public.contractor_workforce;
create policy "contractor workforce manager update"
on public.contractor_workforce
for update
to authenticated
using (
  public.is_super_admin()
  or public.has_permission('calendar_manage')
)
with check (
  public.is_super_admin()
  or public.has_permission('calendar_manage')
);

drop policy if exists "contractor workforce manager delete" on public.contractor_workforce;
create policy "contractor workforce manager delete"
on public.contractor_workforce
for delete
to authenticated
using (
  public.is_super_admin()
  or public.has_permission('calendar_manage')
);

grant select,insert,update,delete on public.contractor_workforce to authenticated;

comment on table public.contractor_workforce is
'날짜별 외주 업체 출근 인원과 점심 식사 인원 관리';
