로컬 하드디스크 자동 백업

1. Python을 PC에 설치합니다.
2. backup_config.json을 메모장으로 엽니다.
3. service_role_key에 Supabase의 Secret/service_role 키를 입력합니다.
   - 이 키는 이 PC에만 보관하고 채팅·직원·홈페이지에 절대 공유하지 마세요.
4. backup_folder를 원하는 하드디스크 폴더로 바꿉니다.
   예: D:\SeorinPortalBackup
5. 먼저 '지금_백업실행.cmd'를 실행해 시험합니다.
6. 정상 백업되면 '자동백업_등록.cmd'를 관리자 권한으로 실행합니다.

매일 자정 생성
- 전체 테이블 Excel 파일
- 각 테이블 JSON 파일
- 영수증 사진(receipts Storage)
- 백업 결과 manifest

중요
- 자정에 PC가 켜져 있어야 실행됩니다.
- 더 확실하게 하려면 회사에서 항상 켜져 있는 관리자 PC 또는 소형 서버에 설치하세요.
- 홈페이지 브라우저의 자동 다운로드가 아니라 Windows 작업 스케줄러가 백업하므로, 홈페이지를 열어둘 필요가 없습니다.
