서린컴퍼니 V51 적용 안내

이번 수정
1. 조직도 팀장은 기존 지정 팀장으로 맨 위 고정
2. 팀장을 제외한 직원은 직급순으로 정렬
   부장 → 차장 → 과장 → 대리 → 주임 → 사원
3. 같은 직급은 기존 표시순서, 이름순으로 정렬
4. 임태희(202605261) 직급을 차장이 아닌 사원으로 수정
5. 차량관리에서 보험 관련 입력·알림·엑셀 항목 제거
6. 기존 B2C KPI와 B2B 작업통계는 그대로 유지
7. 기존 조직도·비상연락망 기능 유지

적용 순서
1. Supabase SQL Editor에서 V51_조직도직급정렬_임태희사원.sql 전체 실행
2. GitHub 저장소 Code → Add file → Upload files
3. 이 ZIP을 압축 해제한 뒤 app, package.json 등 변경 파일 업로드
4. Commit changes
5. Actions → Build SeorinCompany Windows Setup → Run workflow
6. 성공 후 Artifacts 다운로드
7. SeorinCompany_Setup_1.5.0.exe 설치
