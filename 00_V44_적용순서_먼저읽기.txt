서린컴퍼니 V44 적용 순서

수정 내용
- 관리자 연차·대휴 잔여일수 저장 정상화
- 최고관리자 emp001 권한 인식 보강
- 연차와 대휴를 한 번의 RPC로 원자적으로 저장
- 저장 성공/실패를 알림창으로 명확히 표시
- 외주 업체 내역의 수정·삭제 버튼이 HTML 글자로 보이던 오류 수정
- V42/V43 SQL이 누락된 경우에도 V44 통합 SQL 하나로 설치 가능

1. Supabase SQL Editor에서 SQL/V44_통합설치_연차대휴저장_외주버튼수정.sql 전체 실행
2. GitHub Code 화면에서 V44 파일로 기존 파일 교체
3. Actions에서 새 workflow 실행
4. Artifacts의 SeorinCompany_Setup_Windows_V44 다운로드
5. SeorinCompany_Setup_1.3.0.exe 설치

중요: 반드시 SQL을 먼저 실행한 뒤 프로그램을 새로 설치하세요.
