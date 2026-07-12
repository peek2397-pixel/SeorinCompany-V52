서린 물류 포털 V6 - Supabase 연결 완료본

이 버전은 아래 설정이 이미 입력되어 있습니다.
- Supabase URL
- Publishable key

사용 방법
1. 압축을 풉니다.
2. index.html을 실행합니다.
3. 이전 화면이 남아 있으면 Ctrl+F5를 누릅니다.

포함 기능
- 회사 사원번호 그대로 회원가입
- 로그인
- 직원관리
- 직원별 권한관리
- 조직도
- 공지사항
- 일반 소통방
- 1:1 비밀소통
- 법인카드 관리
- 영수증 사진/카메라 업로드
- 물품관리
- 구매관리
- KPI 메뉴
- 엑셀 다운로드

Supabase 필수 설정
- Authentication → Email provider: ON
- Confirm email: OFF
- Storage private bucket 이름: receipts
- receipt-storage-policies.sql 실행

주의
- sb_secret_ 키는 포함하지 않았습니다.
- 현재 파일은 PC에서 실행할 수 있습니다.
- 휴대폰에서 쓰려면 웹 배포가 필요합니다.
