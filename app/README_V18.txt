서린 물류 포털 V18

수정 내용
1. 신규 직원 추가
   - 직원관리에서 직원 추가 클릭
   - 인증계정 자동 생성
   - 초기 비밀번호: 123456
   - 직원 명부·프로필·기본권한 자동 생성
   - 조직도 즉시 반영

2. 직원 정보 수정
   - 직원정보 저장 시 profiles와 employee_registry를 동시에 수정
   - 팀·직급·연차·연락처 저장
   - 조직도 즉시 갱신

3. 직원 비밀번호
   - 최초 로그인: 사원번호 + 123456
   - 로그인 후 내 정보·비밀번호에서 본인이 변경

적용 순서
1. Supabase SQL Editor에서
   V18_직원자동생성_저장_조직도반영.sql
   전체 실행
2. 새 V18 폴더의 index.html 실행
3. Ctrl+F5
4. 관리자 로그인
5. 직원관리에서 신규 직원 추가 시험

중요
- Supabase Authentication 설정:
  Allow new users to sign up = ON
  Confirm email = OFF
  Email provider = ON
- 직원 추가는 관리자 권한(employees_manage)이 있는 계정만 가능합니다.
