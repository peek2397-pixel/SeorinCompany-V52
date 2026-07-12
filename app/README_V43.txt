서린컴퍼니 V43 적용 안내

추가 기능
1. 대시보드의 '재고 부족 알림' 제거
2. 대시보드에 '오늘 점심 식사 인원' 표시
3. 직원 식사 인원 자동 계산
   - 활성 직원 전체에서 오늘 휴무·연차·대체휴일 사용자를 제외
   - 반차·반반차는 출근 인원으로 포함
4. 외주 업체 인력관리 추가
   - 근무일, 업체명, 작업 구역
   - 출근 인원, 점심 식사 인원
   - 수정·삭제·월별 조회
5. 근무·휴무 달력 날짜 안에 외주 출근/식사 인원 표시
6. 오늘 총 점심 주문 수량 = 직원 식사 인원 + 외주 식사 인원

적용 순서
1. SQL/V43_점심식사인원_외주업체인력관리.sql을 Supabase SQL Editor에서 전체 실행
2. GitHub 저장소 Code 화면에서 V43 파일로 기존 파일 교체
3. Actions → Build SeorinCompany Windows Setup → Run workflow
4. 성공 후 Artifacts의 SeorinCompany_Setup_Windows_V43 다운로드
5. 압축을 풀고 SeorinCompany_Setup_1.2.0.exe 설치

중요
- GitHub Actions 실행 기록 주소에 파일을 올리는 것이 아닙니다.
- 항상 저장소의 Code 화면에서 파일을 교체한 뒤 Actions에서 새로 빌드합니다.
