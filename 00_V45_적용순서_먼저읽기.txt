서린컴퍼니 V45 통합업무관리

주요 기능
- 대시보드 내일 점심 주문 인원(직원+외주)
- 회사 일정/B2C 행사: 전 직원 달력과 대시보드 표시
- 회의실 예약: 누구와 미팅, 참석자, 중복예약 차단
- 조직도 직원 클릭: 본인 전화번호, 권한자에게 비상연락처 표시
- 차량 4대 초기 등록 및 변경 가능
- 차량 운행일지, 정비·수리 이력, 보험/검사/정비 알림
- 차량 엑셀 다운로드: 차량기본정보/운행일지/정비수리이력
- 기존 연차·대휴, 외주 인력, 메신저, 구매관리 유지

적용 순서
1. SQL/V45_통합업무관리.sql을 Supabase SQL Editor에서 전체 실행
2. GitHub 저장소 Code → Add file → Upload files에서 V45 압축 해제 내용 업로드 및 Commit
3. .github 폴더는 기존 것을 그대로 두어도 됨
4. Actions → Build SeorinCompany Windows Setup → Run workflow
5. 성공 후 Artifacts에서 SeorinCompany_Setup_Windows_V45 다운로드
6. 압축을 풀고 SeorinCompany_Setup_1.4.0.exe 설치
