서린 물류 포털 V23 - 직원정보 저장 오류 수정

문제 원인
- 직원정보 저장은 profiles와 employee_registry 두 테이블을 직접 수정했습니다.
- Supabase RLS 정책이나 누락된 컬럼 때문에 저장이 중간에 실패할 수 있었습니다.

수정 내용
- 직원정보 저장을 save_employee_admin RPC로 변경
- profiles와 employee_registry를 서버에서 한 번에 저장
- 부서, 팀, 직급, 연락처, 비상연락처, 연차, 표시순서 저장
- 저장 후 조직도 즉시 갱신
- 직급에 따라 조직 단계 자동 계산
  이사/총괄 1단계
  팀장/부장/차장 2단계
  주임/대리/과장 3단계
  일반직원 4단계

적용 방법
1. Supabase SQL Editor에서 V23_직원정보저장_오류수정.sql 전체 실행
2. 새 V23 폴더의 index.html 실행
3. Ctrl+F5
4. 직원관리에서 정보 변경 후 직원정보 저장
