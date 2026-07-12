-- 서린 물류포털 V38 구매 승인 권한 및 상태별 버튼 수정
-- 목적
-- 1) 손동오(emp001)를 대소문자와 무관하게 구매 최종 승인자로 인식
-- 2) 김헌정(202305022)은 검토·발주·입고·완료 담당
-- 3) 최종 승인을 is_super_admin 값에만 의존하지 않고 purchase_final_approve 권한으로 처리
-- Supabase SQL Editor에서 전체 실행하세요.

begin;

alter table public.user_permissions
  add column if not exists purchase_final_approve boolean default false;

-- 최종 승인자는 전체 구매 신청을 조회할 수 있어야 합니다.
drop policy if exists "V37 purchase select" on public.purchase_requests;
drop policy if exists "V38 purchase select" on public.purchase_requests;
create policy "V38 purchase select" on public.purchase_requests
for select to authenticated
using (
  requester_id=auth.uid()
  or public.has_permission('purchase_approve')
  or public.has_permission('purchase_final_approve')
  or public.is_super_admin()
);

create or replace function public.update_purchase_request_status(
  p_request_id bigint,
  p_status text,
  p_reason text default null
)
returns public.purchase_requests
language plpgsql
security definer
set search_path=public
as $$
declare
  v_row public.purchase_requests%rowtype;
  v_actor public.profiles%rowtype;
  v_is_final_approver boolean;
  v_is_manager boolean;
begin
  select * into v_actor from public.profiles where id=auth.uid();
  if v_actor.id is null then
    raise exception '로그인 사용자 정보를 찾을 수 없습니다.';
  end if;

  -- 최종 승인 권한은 전용 권한 또는 최고관리자 권한으로 판정합니다.
  v_is_final_approver := public.has_permission('purchase_final_approve') or public.is_super_admin();
  v_is_manager := public.has_permission('purchase_approve') and not v_is_final_approver;

  select * into v_row
  from public.purchase_requests
  where id=p_request_id
  for update;

  if v_row.id is null then
    raise exception '구매 신청 건을 찾을 수 없습니다.';
  end if;

  if p_status not in ('reviewing','review_complete','approved','ordered','received','completed','rejected') then
    raise exception '허용되지 않은 상태입니다.';
  end if;

  -- 김헌정 등 구매담당자 처리
  if v_is_manager then
    if p_status='reviewing' and v_row.status<>'requested' then
      raise exception '신청 상태에서만 검토를 시작할 수 있습니다.';
    elsif p_status='review_complete' and v_row.status not in ('requested','reviewing') then
      raise exception '신청 또는 검토중 상태에서만 검토완료할 수 있습니다.';
    elsif p_status='ordered' and v_row.status<>'approved' then
      raise exception '승인완료 상태에서만 발주완료할 수 있습니다.';
    elsif p_status='received' and v_row.status<>'ordered' then
      raise exception '발주완료 상태에서만 입고완료할 수 있습니다.';
    elsif p_status='completed' and v_row.status<>'received' then
      raise exception '입고완료 상태에서만 구매완료할 수 있습니다.';
    elsif p_status='approved' then
      raise exception '최종 승인 권한이 있는 사용자만 승인할 수 있습니다.';
    elsif p_status='rejected' and v_row.status not in ('requested','reviewing','review_complete','approved') then
      raise exception '현재 상태에서는 반려할 수 없습니다.';
    end if;

  -- 손동오 등 최종 승인자 처리
  elsif v_is_final_approver then
    if p_status='approved' and v_row.status<>'review_complete' then
      raise exception '구매담당자의 검토완료 후에만 승인할 수 있습니다.';
    elsif p_status='rejected' and v_row.status<>'review_complete' then
      raise exception '승인대기 상태에서만 반려할 수 있습니다.';
    elsif p_status not in ('approved','rejected') then
      raise exception '최종 승인자는 승인 또는 반려만 처리할 수 있습니다.';
    end if;
  else
    raise exception '구매 처리 권한이 없습니다.';
  end if;

  if p_status='rejected' and coalesce(trim(p_reason),'')='' then
    raise exception '반려 사유를 입력하세요.';
  end if;

  update public.purchase_requests
  set status=p_status,
      reviewer_id=case when p_status in ('reviewing','review_complete') then auth.uid() else reviewer_id end,
      reviewer_name=case when p_status in ('reviewing','review_complete') then v_actor.name else reviewer_name end,
      reviewed_at=case when p_status='review_complete' then now() else reviewed_at end,
      approver_id=case when p_status='approved' then auth.uid() else approver_id end,
      approver_name=case when p_status='approved' then v_actor.name else approver_name end,
      approved_at=case when p_status='approved' then now() else approved_at end,
      ordered_at=case when p_status='ordered' then now() else ordered_at end,
      received_at=case when p_status='received' then now() else received_at end,
      completed_at=case when p_status='completed' then now() else completed_at end,
      reject_reason=case when p_status='rejected' then trim(p_reason) else reject_reason end,
      rejected_at=case when p_status='rejected' then now() else rejected_at end,
      updated_at=now()
  where id=p_request_id
  returning * into v_row;

  insert into public.audit_logs(user_id,action,table_name,record_id,details)
  values(
    auth.uid(),
    'PURCHASE_STATUS_CHANGE',
    'purchase_requests',
    p_request_id::text,
    jsonb_build_object('status',p_status,'reason',p_reason,'actor',v_actor.name)
  );

  return v_row;
end;
$$;

grant execute on function public.update_purchase_request_status(bigint,text,text) to authenticated;

-- 손동오 계정: 사원번호 대소문자를 무시하고 최종 승인 권한 부여
insert into public.user_permissions(user_id,purchase_view,purchase_final_approve)
select id,true,true
from public.profiles
where lower(trim(emp_no))='emp001'
on conflict(user_id) do update
set purchase_view=true,
    purchase_final_approve=true,
    updated_at=now();

-- 김헌정 계정: 구매 검토·발주·입고·완료 권한 부여, 최종 승인 권한은 제외
insert into public.user_permissions(user_id,purchase_view,purchase_approve,purchase_final_approve)
select id,true,true,false
from public.profiles
where trim(emp_no)='202305022'
on conflict(user_id) do update
set purchase_view=true,
    purchase_approve=true,
    purchase_final_approve=false,
    updated_at=now();

commit;

-- 실행 결과 확인
select
  p.emp_no,
  p.name,
  p.is_super_admin,
  up.purchase_view,
  up.purchase_approve,
  up.purchase_final_approve
from public.profiles p
left join public.user_permissions up on up.user_id=p.id
where lower(trim(p.emp_no))='emp001'
   or trim(p.emp_no)='202305022'
order by p.emp_no;
