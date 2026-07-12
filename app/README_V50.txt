서린컴퍼니 V50 차량관리 통합 테스트 버전

차량관리 메뉴 안에 다음 탭을 통합했습니다.
1. 차량 기본정보
2. 운행일지
3. 정비관리

포함 기능
- 모하비 22우8010, 벤츠 215서1806, 스포티지 174하9138, 스타리아 807노5770 초기 등록
- 차량 추가·수정·삭제
- 운행일지 등록·수정·삭제 및 월별 조회
- 정비·수리 이력 등록·수정·삭제 및 월별 조회
- 검사·정비 예정 알림
- 선택 차량 엑셀 다운로드
- 전체 차량 엑셀 다운로드

적용 순서
1. Supabase SQL Editor에서 V50_차량관리통합.sql 전체 실행
2. GitHub Code 화면에서 이 폴더의 app, package.json, main.js, preload.js, build 내용을 기존 파일에 덮어쓰기
3. .github 폴더는 기존 빌드 워크플로가 있으면 그대로 두어도 됩니다.
4. Actions → Build SeorinCompany Windows Setup → Run workflow
5. 성공 후 Artifacts에서 SeorinCompany_Setup_Windows_V50 다운로드
6. 압축을 풀고 SeorinCompany_Setup_1.5.0.exe 설치
