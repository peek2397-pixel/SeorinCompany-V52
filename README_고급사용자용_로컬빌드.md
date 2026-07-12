# 서린컴퍼니 물류포털 Windows 앱 V41

이 프로젝트는 기존 V41 포털을 Electron 데스크톱 앱으로 감싼 정식 Windows 설치 프로그램 빌드 프로젝트입니다.

## 생성되는 설치파일

빌드 후 `dist` 폴더에 아래 파일이 생성됩니다.

`SeorinCompany_Setup_1.0.0.exe`

설치 프로그램 기능:

- 설치 마법사
- 설치 위치 선택
- 바탕화면 바로가기 자동 생성
- 시작 메뉴 등록
- 독도로션 아이콘 적용
- 설치 완료 후 자동 실행
- 프로그램 제거 지원
- 기존 Supabase 프로젝트와 동일하게 연동

## Windows PC에서 빌드

1. Node.js LTS를 설치합니다.
2. 이 폴더에서 `BUILD_SETUP_EXE.bat`를 더블클릭합니다.
3. 완료되면 `dist` 폴더에서 Setup.exe를 확인합니다.

## GitHub에서 자동 빌드

프로젝트 전체를 GitHub 저장소에 올리면 `.github/workflows/build-windows.yml`이 Windows 서버에서 자동으로 Setup.exe를 빌드합니다.

GitHub의 `Actions` → `Build Windows Setup EXE` → `Run workflow`를 누른 뒤,
완료된 작업의 `Artifacts`에서 설치파일을 내려받으면 됩니다.

## Supabase

앱은 기존 `app/config.js` 설정을 그대로 사용합니다.
V41 메신저용 SQL은 `app/V41_직원선택형_메신저.sql`에 포함되어 있습니다.
