-- V19 조직도 카드형 구조 및 표시 상태
-- Supabase SQL Editor에서 전체 실행하세요.

alter table public.profiles
  add column if not exists pending_approval boolean default false,
  add column if not exists move_planned boolean default false;

alter table public.employee_registry
  add column if not exists pending_approval boolean default false,
  add column if not exists move_planned boolean default false;

notify pgrst, 'reload schema';
