-- V14 사원번호 전용 로그인 확인용
-- 신규 가입자는 내부적으로 "사원번호@seorin-portal.com" 형식으로 저장됩니다.
-- 직원 화면에는 이메일이 표시되지 않습니다.

-- 가입 확인 함수가 없을 경우 생성
create or replace function public.check_employee_signup(
  p_emp_no text,
  p_name text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.employee_registry;
begin
  select * into r
  from public.employee_registry
  where emp_no = trim(p_emp_no)
    and is_active = true;

  if r.emp_no is null then
    return jsonb_build_object('allowed',false,'message','등록되지 않은 사원번호입니다.');
  end if;

  if r.name <> trim(p_name) then
    return jsonb_build_object('allowed',false,'message','사원번호와 이름이 일치하지 않습니다.');
  end if;

  if r.auth_user_id is not null then
    return jsonb_build_object('allowed',false,'message','이미 가입된 사원번호입니다.');
  end if;

  return jsonb_build_object('allowed',true,'message','가입 가능');
end;
$$;

grant execute on function public.check_employee_signup(text,text)
to anon, authenticated;

notify pgrst, 'reload schema';
