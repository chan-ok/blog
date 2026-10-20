# 개발 가이드

## 설치와 실행

Node.js 24, pnpm 11.18.0을 사용합니다. `blog`와 `blog-content`를 같은 부모 디렉터리에 checkout하고 `blog`에서 `pnpm install --frozen-lockfile`을 실행합니다. 콘텐츠 생성 스크립트는 Astro 개발·빌드에 필요하지 않습니다.

```bash
pnpm dev --host 127.0.0.1 --port 4321
pnpm build
pnpm preview --host 127.0.0.1 --port 4322
```

Astro 7은 에이전트 환경을 감지하면 개발 서버를 백그라운드로 실행할 수 있습니다. `pnpm exec astro dev status`, `logs`, `stop`으로 관리합니다. 독립 테스트 프로세스는 `--ignore-lock`으로 foreground에서 실행하고 자신이 시작한 프로세스만 정리합니다.

## Obsidian 작성

`blog-content/ko` 또는 `ja` 아래에 글을 만듭니다. `.md`와 `.mdx`는 모두 실행하지 않는 Markdown입니다.

```yaml
---
title: 글 제목
createdAt: 2026-01-01
published: false
tags: [astro]
---
```

제목이 없으면 기존처럼 파일명을 사용합니다. `updatedAt`, `summary`, `thumbnail`, `series`는 선택 사항입니다. 썸네일이 없으면 본문 첫 이미지를 사용합니다. 본문 이미지 경로는 vault 루트 기준입니다. 예: `![[images/example.png|설명]]`, `![설명](images/example.png)`.

폴더를 URL에 보존하고 파일명 공백만 `_`로 바꿉니다. `ko/분류/글 제목.md`는 `/ko/posts/분류/글_제목/`입니다. URL 충돌·잘못된 YAML/메타데이터·없는 이미지·vault 외부 symlink는 파일명을 확인해 수정해야 합니다.

개발 목록은 발행 글을, 개발 상세는 초안까지 표시합니다. 운영 빌드는 발행 글 중 정확한 `test`, `draft` 태그가 있는 글을 제외합니다. 없는 번역으로 언어를 바꾸면 같은 글 경로의 404를 표시합니다. 파일 추가·수정·삭제와 이미지 교체는 열린 화면에 자동 반영됩니다.

## 환경 설정

| 값 | 용도 |
| --- | --- |
| `BLOG_CONTENT_DIR` | 기본 `../blog-content` 대신 읽을 vault 경로 |
| `BLOG_ABOUT_DIR` | 선택 사항: `README.ko.md`, `README.ja.md`가 있는 로컬 소개 fixture 경로 |
| `BLOG_CACHE_DIR`, `BLOG_OUT_DIR` | 독립 테스트용 캐시·출력 경로; 출력은 프로젝트와 같은 파일시스템에 둡니다 |
| `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` | 선택 사항: 설치된 Chromium 실행 파일 |

기본 소개는 서버가 `chan-ok/chan-ok`의 locale README를 HTTPS로 읽습니다. 실패를 빈 페이지로 숨기지 않습니다. `VITE_GIT_RAW_URL`은 사용하지 않습니다.

클라우드에서는 `scripts/cloud-install.sh`의 writable XDG 경로와 Node 24의 `NODE_USE_ENV_PROXY=1`, `NODE_USE_SYSTEM_CA=1` 설정을 사용합니다. TLS 검증을 끄거나 브라우저 trust store를 바꾸지 않습니다. 외부 소개 문서 fetch는 Node에서 수행하고 테스트 fixture 성공과 실제 외부 통신 성공을 구별합니다.

## 검증과 변경 범위

[명령어](commands.md) 순서로 타입·린트·테스트·빌드·산출물·브라우저를 검사합니다. formatter는 TypeScript/JSON/CSS에 oxfmt, Astro/Vue/Svelte에 Prettier 공식 플러그인을 사용합니다. Astro checker·vue-tsc·svelte-check는 각 템플릿과 타입을 검사하며 oxlint는 지원하는 script 부분을 검사합니다.

현재 Netlify 설정은 이전 SPA용입니다. 배포 시 콘텐츠 커밋 checkout, fallback/CSP, Build Hook과 Actions의 수동 값 입력을 마지막에 연결해야 합니다. 이 구현 작업은 해당 설정을 변경하거나 배포하지 않습니다.
