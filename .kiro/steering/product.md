# 제품 개요

Next.js 16으로 구축된 개인 개발 블로그로, 콘텐츠 관리를 위한 이중 리포지터리 아키텍처를 특징으로 합니다.

## 목적

- 기술 지식 공유를 위한 개인 개발 블로그
- 모던 프론트엔드 기술 학습 플랫폼
- 다국어 콘텐츠 제공 (한국어, 일본어, 영어)

## 아키텍처

두 개의 독립적인 리포지터리:

1. **blog** (현재 리포지터리) - 블로그를 렌더링하는 Next.js 16 애플리케이션
2. **blog-content** - MDX 포스트와 페이지를 저장하는 별도 리포지터리

### 콘텐츠 파이프라인

- 포스트는 `blog-content` 리포지터리에 MDX 형식으로 작성됨
- GitHub Actions가 push 시 각 언어별 `index.json` 파일을 자동 생성
- 블로그는 GitHub Raw URL을 통해 콘텐츠를 가져와 원격으로 MDX를 렌더링
- 페이지네이션, 태그 필터링, 다국어 라우팅 지원

## 주요 기능

### 구현 완료

- 자동 빌드를 통한 Netlify 배포
- URL 기반 다국어 지원 (ko, en, ja)
- 코드 하이라이팅을 포함한 원격 MDX 렌더링
- About 페이지 (마크다운 기반)
- Posts 페이지 (blog-content 리포지터리 연동)
- 검증 기능이 있는 Contact 폼 (Zod + Cloudflare Turnstile + Resend)
- 시스템 감지 및 LocalStorage 지속성을 갖춘 다크 모드 (Zustand + Tailwind dark:)
- 쿠키 기반 언어 선택기 (NEXT_LOCALE 쿠키)

### 예정 기능

- 향상된 마크다운 기능 (개선된 코드 블록, TOC, 읽기 시간)
- 최신/인기 포스트 및 구독 폼이 있는 개선된 홈페이지 디자인
- 검색 기능 (클라이언트 사이드 또는 Algolia)
- 댓글 시스템 (utterances/giscus)
