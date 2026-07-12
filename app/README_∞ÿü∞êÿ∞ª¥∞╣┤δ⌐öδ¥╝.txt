서린 물류 포털 V3 - 법인카드 영수증 카메라 업로드

1. 기존 포털 폴더에서 index.html, app.js를 교체하세요.
2. config.js는 현재 정상 연결된 파일을 그대로 사용하세요.
3. Supabase Storage에 private bucket 'receipts'를 만드세요.
4. SQL Editor에서 receipt-storage-policies.sql을 실행하세요.
5. 홈페이지에서 Ctrl+F5로 새로고침하세요.

휴대폰:
- 영수증 사진 입력을 누르면 카메라 또는 사진 선택이 열립니다.
- 촬영 후 미리보기가 나타납니다.
- 사용내역 저장을 누르면 사진과 법인카드 내역이 함께 저장됩니다.

PC:
- 카메라 대신 파일 선택창이 열립니다.

중요:
- 휴대폰에서 사용하려면 포털을 Vercel 같은 웹 주소로 배포해야 합니다.
- 현재 PC의 file:/// 주소는 휴대폰에서 열 수 없습니다.
- receipts 버킷은 Public으로 만들지 마세요.
