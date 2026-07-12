-- V16 권한관리 컬럼 보완 및 신규 직원 기본 권한 최소화
-- Supabase SQL Editor에서 전체 실행하세요.

alter table public.user_permissions
  add column if not exists dashboard_view boolean default true,
  add column if not exists notices_view boolean default true,
  add column if not exists notices_manage boolean default false,
  add column if not exists organization_view boolean default true,
  add column if not exists emergency_contacts_view boolean default false,
  add column if not exists community_view boolean default true,
  add column if not exists private_messages_use boolean default true,
  add column if not exists card_use boolean default false,
  add column if not exists card_manage boolean default false,
  add column if not exists card_export boolean default false,
  add column if not exists inventory_view boolean default false,
  add column if not exists inventory_manage boolean default false,
  add column if not exists inventory_export boolean default false,
  add column if not exists purchase_view boolean default false,
  add column if not exists purchase_approve boolean default false,
  add column if not exists calendar_use boolean default true,
  add column if not exists calendar_manage boolean default false,
  add column if not exists kpi_view boolean default false,
  add column if not exists kpi_manage boolean default false,
  add column if not exists kpi_export boolean default false,
  add column if not exists employees_manage boolean default false,
  add column if not exists permissions_manage boolean default false;

-- 최고관리자를 제외한 기존 직원 권한을 안전한 기본값으로 정리
update public.user_permissions up
set
  dashboard_view=true,
  notices_view=true,
  notices_manage=false,
  organization_view=true,
  emergency_contacts_view=false,
  community_view=true,
  private_messages_use=true,
  card_use=false,
  card_manage=false,
  card_export=false,
  inventory_view=false,
  inventory_manage=false,
  inventory_export=false,
  purchase_view=false,
  purchase_approve=false,
  calendar_use=true,
  calendar_manage=false,
  kpi_view=false,
  kpi_manage=false,
  kpi_export=false,
  employees_manage=false,
  permissions_manage=false
where up.user_id in (
  select p.id
  from public.profiles p
  where coalesce(p.is_super_admin,false)=false
);

-- 최고관리자 권한은 모두 true로 유지
update public.user_permissions up
set
  dashboard_view=true,
  notices_view=true,
  notices_manage=true,
  organization_view=true,
  emergency_contacts_view=true,
  community_view=true,
  private_messages_use=true,
  card_use=true,
  card_manage=true,
  card_export=true,
  inventory_view=true,
  inventory_manage=true,
  inventory_export=true,
  purchase_view=true,
  purchase_approve=true,
  calendar_use=true,
  calendar_manage=true,
  kpi_view=true,
  kpi_manage=true,
  kpi_export=true,
  employees_manage=true,
  permissions_manage=true
where up.user_id in (
  select p.id
  from public.profiles p
  where coalesce(p.is_super_admin,false)=true
);

notify pgrst, 'reload schema';
