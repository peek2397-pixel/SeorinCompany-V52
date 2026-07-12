서린 물류 포털 V4 - 사번 회원가입 오류 수정

변경 내용
- 신규 회원가입은 내부적으로 emp002@seorin-portal.com 형식을 사용합니다.
- 직원은 이메일을 입력하지 않고 사번/이름/비밀번호만 입력합니다.
- 기존 관리자 EMP001 계정이 emp001@seorin.local로 만들어져 있어도 계속 로그인됩니다.
- 새 직원은 EMP002부터 정상 가입됩니다.

적용 방법
1. 압축을 풉니다.
2. 기존 포털 폴더의 app.js만 새 app.js로 교체합니다.
3. index.html과 config.js는 현재 정상 작동하는 파일을 그대로 둡니다.
4. 홈페이지에서 Ctrl+F5를 누릅니다.
5. 회원가입을 다시 시도합니다.

Supabase 설정
- Authentication → Sign In / Providers → Email provider: ON
- Confirm email: OFF
