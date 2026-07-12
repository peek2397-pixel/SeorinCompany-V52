-- 서린컴퍼니 V51 조직도 직급정렬 및 임태희 직급 수정
-- Supabase SQL Editor에서 전체 실행하세요.

do $$
begin
  if to_regclass('public.employee_registry') is not null then
    update public.employee_registry
    set position = '사원',
        org_level = 4
    where emp_no = '202605261'
       or name = '임태희';
  end if;

  if to_regclass('public.profiles') is not null then
    update public.profiles
    set position = '사원',
        org_level = 4
    where employee_no = '202605261'
       or emp_no = '202605261'
       or name = '임태희';
  end if;
exception
  when undefined_column then
    -- 설치 버전에 따라 profiles의 사원번호 컬럼명이 다를 수 있으므로 이름 기준으로 재시도
    if to_regclass('public.profiles') is not null then
      update public.profiles
      set position = '사원',
          org_level = 4
      where name = '임태희';
    end if;
end $$;
