# Downloaded LDraw models

- `parts/`: LDraw.org에서 받은 원본 부품 `.dat` 파일
- `models/`: 요청한 색상 코드가 적용된 조립 모델 `.ldr` 파일
- `manifest.json`: 부품 번호, 색상 코드, 로컬 파일, 원본 URL 목록

다시 다운로드하려면 프로젝트 루트에서 다음 명령을 실행합니다.

```sh
npm run ldraw:download
```

`.ldr` 모델은 LDraw 호환 뷰어에서 열 수 있습니다. 뷰어의 부품 검색 경로에는
완전한 LDraw 공식 라이브러리 또는 이 디렉터리의 `parts/`를 추가해야 합니다.
