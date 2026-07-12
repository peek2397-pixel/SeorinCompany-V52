-- V31 B2C KPI 관리자 전용
-- 일반 직원은 B2C KPI 메뉴를 볼 수 없고, 관리자만 볼 수 있습니다.

update public.user_permissions up
set
  kpi_view=false,
  kpi_manage=false,
  kpi_export=false
where up.user_id in (
  select p.id
  from public.profiles p
  where coalesce(p.is_super_admin,false)=false
);

update public.user_permissions up
set
  kpi_view=true,
  kpi_manage=true,
  kpi_export=true
where up.user_id in (
  select p.id
  from public.profiles p
  where coalesce(p.is_super_admin,false)=true
);

notify pgrst, 'reload schema';
