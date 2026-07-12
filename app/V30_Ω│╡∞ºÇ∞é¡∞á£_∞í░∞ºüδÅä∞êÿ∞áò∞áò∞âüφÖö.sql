-- V30 공지사항 삭제 및 조직도 수정 권한 안정화

-- 공지사항 관리자 삭제 함수
create or replace function public.delete_notice_admin(
  p_notice_id bigint
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
begin
  if not (
    public.is_super_admin()
    or public.has_permission('notices_manage')
  ) then
    raise exception '공지사항 삭제 권한이 없습니다.';
  end if;

  delete from public.notices
  where id=p_notice_id;

  return jsonb_build_object('success',true,'notice_id',p_notice_id);
end;
$$;

grant execute on function public.delete_notice_admin(bigint)
to authenticated;

-- 조직도 수정 RPC는 V22에서 생성된 함수를 그대로 사용합니다.
-- 누락된 조직도 컬럼 보완
alter table public.profiles
  add column if not exists org_level integer default 4,
  add column if not exists manager_emp_no text,
  add column if not exists pending_approval boolean default false,
  add column if not exists move_planned boolean default false;

alter table public.employee_registry
  add column if not exists org_level integer default 4,
  add column if not exists manager_emp_no text,
  add column if not exists pending_approval boolean default false,
  add column if not exists move_planned boolean default false;

notify pgrst, 'reload schema';
