서린 물류 포털 V1 시작 방법

[파일 구성]
1. index.html          : 포털 화면
2. styles.css          : 디자인
3. app.js              : 로그인·권한·법인카드·물품 기능
4. config.js           : Supabase 주소와 키 입력
5. supabase-schema.sql : 데이터베이스/권한 구조

[1단계: Supabase 테이블 만들기]
1. Supabase 프로젝트를 엽니다.
2. 왼쪽 SQL Editor를 클릭합니다.
3. New query를 클릭합니다.
4. supabase-schema.sql 내용을 전부 복사합니다.
5. Run을 한 번 누릅니다.

[2단계: 첫 직원 계정 만들기]
1. Supabase 왼쪽 Authentication → Users
2. Add user → Create new user
3. Email: emp001@seorin.local
4. Password: 사용할 비밀번호
5. Auto Confirm User를 켭니다.
6. 계정을 만든 뒤 SQL Editor에서 아래 실행:
   update public.profiles
   set name='손동오', emp_no='EMP001', department='물류본부',
       position='이사', is_super_admin=true, can_receive_private=true
   where emp_no='EMP001';

[3단계: 홈페이지에 Supabase 연결]
1. Supabase Project Settings → API
2. Project URL을 config.js의 SUPABASE_URL에 붙여넣습니다.
3. anon public key를 SUPABASE_ANON_KEY에 붙여넣습니다.
주의: service_role key는 절대 홈페이지에 넣으면 안 됩니다.

[4단계: 실행]
index.html을 더블클릭하면 브라우저 보안 때문에 일부 기능이 막힐 수 있습니다.
가장 쉬운 방법:
- VS Code 설치
- Live Server 확장 설치
- index.html 우클릭 → Open with Live Server

[현재 포함된 기능]
- 직원번호 로그인
- 직원별 메뉴 권한
- 관리자/직원 화면 분리
- 카드형 대시보드
- 공지사항
- 조직도
- 1:1 비밀소통
- 법인카드 등록·조회·엑셀 다운로드
- 요소수 등 물류 물품 등록·입고·사용·재고·엑셀
- 직원관리·권한관리 기본 화면
- KPI 연결 자리

[다음 개발 단계]
- 기존 B2C KPI 전체 기능을 Supabase 저장 방식으로 통합
- 영수증 사진 업로드
- 구매요청 승인/반려
- 법인카드 월별보고서와 차트
- 모바일 화면 세부 조정
- Vercel 무료 배포

[중요]
일반 직원은 KPI 점수·등급·순위가 보이지 않도록 설계합니다.
권한은 화면 숨김뿐 아니라 Supabase RLS 정책으로 데이터 접근까지 차단합니다.
