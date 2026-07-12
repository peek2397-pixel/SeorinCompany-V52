-- 서린컴퍼니 V50 통합업무관리 설치 SQL - 문법 수정본
-- Supabase SQL Editor에서 이 파일 전체를 실행하세요.

create extension if not exists pgcrypto;

create table if not exists public.company_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null default 'company',
  title text not null,
  start_date date not null,
  end_date date not null,
  event_time text,
  manager_name text,
  participant_count integer not null default 0,
  location text,
  memo text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.meeting_room_bookings (
  id uuid primary key default gen_random_uuid(),
  room_name text not null default '회의실',
  meeting_date date not null,
  start_time time not null,
  end_time time not null,
  title text not null,
  organizer_name text,
  meeting_with text,
  attendees text,
  memo text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint meeting_time_valid check (end_time > start_time)
);

create table if not exists public.fleet_vehicles (
  id uuid primary key default gen_random_uuid(),
  vehicle_name text not null,
  vehicle_number text not null unique,
  manager_name text,
  current_mileage numeric not null default 0,
  insurance_expiry date,
  inspection_expiry date,
  status text not null default '운행가능',
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicle_trip_logs (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.fleet_vehicles(id) on delete cascade,
  trip_date date not null,
  department text,
  driver_name text not null,
  start_place text,
  end_place text,
  purpose_address text,
  distance_km numeric not null default 0,
  odometer_km numeric not null default 0,
  fuel_cost numeric not null default 0,
  memo text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.vehicle_maintenance (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.fleet_vehicles(id) on delete cascade,
  maintenance_date date not null,
  maintenance_type text not null,
  mileage_km numeric not null default 0,
  shop_name text,
  cost numeric not null default 0,
  next_due_date date,
  next_due_mileage numeric,
  memo text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

insert into public.fleet_vehicles (vehicle_name, vehicle_number, status)
values
  ('모하비', '22우8010', '운행가능'),
  ('벤츠', '215서1806', '운행가능'),
  ('스포티지', '174하9138', '운행가능'),
  ('스타리아', '807노5770', '운행가능')
on conflict (vehicle_number) do nothing;

alter table public.company_events enable row level security;
alter table public.meeting_room_bookings enable row level security;
alter table public.fleet_vehicles enable row level security;
alter table public.vehicle_trip_logs enable row level security;
alter table public.vehicle_maintenance enable row level security;

-- 전체 인증 사용자가 조회 가능
drop policy if exists company_events_read on public.company_events;
create policy company_events_read
on public.company_events
for select to authenticated
using (true);

drop policy if exists meeting_room_bookings_read on public.meeting_room_bookings;
create policy meeting_room_bookings_read
on public.meeting_room_bookings
for select to authenticated
using (true);

drop policy if exists fleet_vehicles_read on public.fleet_vehicles;
create policy fleet_vehicles_read
on public.fleet_vehicles
for select to authenticated
using (true);

drop policy if exists vehicle_trip_logs_read on public.vehicle_trip_logs;
create policy vehicle_trip_logs_read
on public.vehicle_trip_logs
for select to authenticated
using (true);

drop policy if exists vehicle_maintenance_read on public.vehicle_maintenance;
create policy vehicle_maintenance_read
on public.vehicle_maintenance
for select to authenticated
using (true);

-- 회사 일정: 최고관리자 또는 달력 관리자
drop policy if exists company_events_write on public.company_events;
create policy company_events_write
on public.company_events
for all to authenticated
using (
  public.is_super_admin()
  or public.has_permission('calendar_manage')
)
with check (
  public.is_super_admin()
  or public.has_permission('calendar_manage')
);

-- 회의실 예약: 본인이 등록, 본인 또는 관리자가 수정·삭제
drop policy if exists meeting_insert on public.meeting_room_bookings;
create policy meeting_insert
on public.meeting_room_bookings
for insert to authenticated
with check (created_by = auth.uid());

drop policy if exists meeting_update on public.meeting_room_bookings;
create policy meeting_update
on public.meeting_room_bookings
for update to authenticated
using (
  created_by = auth.uid()
  or public.is_super_admin()
  or public.has_permission('calendar_manage')
)
with check (
  created_by = auth.uid()
  or public.is_super_admin()
  or public.has_permission('calendar_manage')
);

drop policy if exists meeting_delete on public.meeting_room_bookings;
create policy meeting_delete
on public.meeting_room_bookings
for delete to authenticated
using (
  created_by = auth.uid()
  or public.is_super_admin()
  or public.has_permission('calendar_manage')
);

-- 차량 기본정보: 최고관리자 또는 직원관리 권한자
drop policy if exists fleet_vehicles_write on public.fleet_vehicles;
create policy fleet_vehicles_write
on public.fleet_vehicles
for all to authenticated
using (
  public.is_super_admin()
  or public.has_permission('employees_manage')
)
with check (
  public.is_super_admin()
  or public.has_permission('employees_manage')
);

-- 운행일지: 로그인 직원은 본인이 등록, 본인 또는 관리자가 수정·삭제
drop policy if exists vehicle_trip_logs_insert on public.vehicle_trip_logs;
create policy vehicle_trip_logs_insert
on public.vehicle_trip_logs
for insert to authenticated
with check (created_by = auth.uid());

drop policy if exists vehicle_trip_logs_update on public.vehicle_trip_logs;
create policy vehicle_trip_logs_update
on public.vehicle_trip_logs
for update to authenticated
using (
  created_by = auth.uid()
  or public.is_super_admin()
  or public.has_permission('employees_manage')
)
with check (
  created_by = auth.uid()
  or public.is_super_admin()
  or public.has_permission('employees_manage')
);

drop policy if exists vehicle_trip_logs_delete on public.vehicle_trip_logs;
create policy vehicle_trip_logs_delete
on public.vehicle_trip_logs
for delete to authenticated
using (
  created_by = auth.uid()
  or public.is_super_admin()
  or public.has_permission('employees_manage')
);

-- 정비·수리 이력: 최고관리자 또는 직원관리 권한자
drop policy if exists vehicle_maintenance_write on public.vehicle_maintenance;
create policy vehicle_maintenance_write
on public.vehicle_maintenance
for all to authenticated
using (
  public.is_super_admin()
  or public.has_permission('employees_manage')
)
with check (
  public.is_super_admin()
  or public.has_permission('employees_manage')
);

grant select, insert, update, delete
on public.company_events,
   public.meeting_room_bookings,
   public.fleet_vehicles,
   public.vehicle_trip_logs,
   public.vehicle_maintenance
to authenticated;


-- V50 차량관리 통합 탭은 기존 차량 테이블을 그대로 사용합니다.
