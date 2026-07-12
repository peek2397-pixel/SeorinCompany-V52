서린 물류 포털 V33 - 달력 테이블 전체 설치

오류 원인
- Supabase에 work_calendar_entries 테이블이 아직 없는데
  V32 SQL이 바로 정책부터 만들려고 해서 오류가 발생했습니다.

적용 방법
1. Supabase SQL Editor에서 V33_달력테이블_전체설치.sql 전체 실행
2. Success. No rows returned 확인
3. V33 폴더의 index.html 실행
4. Ctrl+F5
5. 근무·휴무 달력 메뉴 확인

동작
- 일반 직원: 본인 일정만 조회·등록
- 관리자: 전체 직원 일정 조회·등록
- 연차, 반차, 반반차, 주말근무, 대체휴일 지원
