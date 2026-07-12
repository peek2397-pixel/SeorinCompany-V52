서린 물류 포털 V31 - B2C KPI 관리자 전용

변경 내용
- B2C KPI 관리 메뉴는 KPI 평가 권한(kpi_manage)이 있는 관리자만 표시
- 일반 직원에게는 B2C KPI 메뉴 자체가 보이지 않음
- 대시보드의 KPI 바로가기 역시 관리자만 표시
- 일반 직원이 강제로 KPI 페이지를 열려고 해도 접근 차단
- B2B 작업통계 권한과는 별개로 유지

적용 방법
1. Supabase SQL Editor에서 V31_B2C_KPI_관리자전용.sql 실행
2. 새 V31 폴더의 index.html 실행
3. Ctrl+F5

관리자 추가 방법
- 권한관리에서 해당 직원에게 'B2C KPI 평가' 권한을 체크하면
  B2C KPI 메뉴가 표시됩니다.
