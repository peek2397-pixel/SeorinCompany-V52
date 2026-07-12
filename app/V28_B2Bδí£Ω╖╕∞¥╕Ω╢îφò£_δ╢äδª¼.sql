-- V28 B2B 로그인·권한 분리
-- 기존 KPI 권한과 B2B 권한을 분리합니다.

alter table public.user_permissions
  add column if not exists b2b_view boolean default false,
  add column if not exists b2b_manage boolean default false,
  add column if not exists b2b_export boolean default false;

-- 최고관리자는 B2B 전체 권한
update public.user_permissions up
set
  b2b_view=true,
  b2b_manage=true,
  b2b_export=true
where up.user_id in (
  select p.id
  from public.profiles p
  where coalesce(p.is_super_admin,false)=true
);

-- 기존 B2B 관련 직원에게 기본 보기 권한 부여
update public.user_permissions up
set b2b_view=true
where up.user_id in (
  select p.id
  from public.profiles p
  where coalesce(p.team,'') ilike '%B2B%'
     or coalesce(p.department,'') ilike '%B2B%'
     or coalesce(p.position,'') ilike '%B2B%'
);

notify pgrst, 'reload schema';
