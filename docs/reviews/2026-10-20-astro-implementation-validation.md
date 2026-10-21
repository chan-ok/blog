# Astro 구현의 검증 대응표

승인 설계와 구현 계획을 실행한 후 기존 91개 테스트의 책임을 아래와 같이 보존·대체했습니다. 이전 SPA 구조에 종속된 테스트는 새 행동 검증이 확보된 뒤 제거했습니다.

| 이전 테스트/책임 | 현재 검증 |
| --- | --- |
| Markdown 비실행 렌더링 | `lib/markdown/render.test.ts`, 세 프레임워크 `framework-security.test.ts` |
| 원격 글 URL traversal, MD/MDX fallback·본문 크기 | `vault.test.ts`, `routes.test.ts`, `frontmatter.test.ts`; 두 확장자를 직접 수집하며 원격 fallback 경로 제거 |
| JS frontmatter 실행 거부 | `frontmatter.test.ts`, `vault.test.ts` |
| 원격 index 공개 필터·pagination 전 정책·잘못된 metadata | `visibility.test.ts`(기존 케이스 이관), `vault.test.ts`, 프로덕션 fixture 빌드 |
| 원격 index HTTPS·응답 제한·thumbnail URL | `shared/util/content-url.test.ts`, `fetch-limited.test.ts` 유지; 로컬 asset 경로·형식과 최종 OG/이미지 산출물 검증 |
| 상세 loader의 비공개 차단·404·SEO | 정적 `verify:build`, `framework-pages.test.ts`, `framework-runtime.test.ts`, JavaScript 없는 상세 탐색 |
| 프로필 SSR 크기·반응형 skeleton | 세 프레임워크 320/375/768/1023/1440px `home-responsive.test.ts`, 이미지 실패 fixture |
| Mermaid strict/CSS 설정 | `lib/browser/mermaid.test.ts`로 기존 테스트 이관, 기존 SVG 보안 브라우저 테스트 유지 |
| locale resource schema | `lib/i18n/schema.test.ts`로 그대로 이관 |
| 실행 도구·Node/pnpm·헤더·audit 설정 | `shared/security-config.test.ts` 유지·Astro 실행 계약으로 변경 |
| 생성 HTML integration | `verify:build` 및 독립 프로덕션 fixture로 강화; 단위 runner가 오래된 dist에 의존하지 않도록 분리 |

추가 검증: Sätteri 두 공식 API의 설정 동등성, Markdown 이미지 reference·Obsidian 처리, 스마트 문장부호 비활성, raw HTML 차단, lazy HAST 공식 mutation, 코드 복사 성공/거부·번역, 목차 펼침, 실제 Mermaid 표시, 이미지 fallback, 미완료 Mermaid 취소, HTML 중첩 원문 검사, 프로덕션 client entry 의존 그래프, 초안 미리보기 후 공개 빌드의 자산 정리, 외부 vault 자동 갱신과 서버 재시작.

기존 실제 인덱스의 4개 한국어 글 URL을 새 vault slug와 비교해 모두 유지되는 것을 확인했습니다. 기본 About README의 HTTPS fetch 성공은 로컬 fixture 성공과 별도로 확인했습니다.

Astro 7.4.1, Vue integration 7.1.1, Astro checker 0.9.11은 구현 시점 release-age 정책에 걸려 각각 7.4.0, 7.1.0, 0.9.10을 사용했습니다. Node 24와 TypeScript 6.0.3, Vite 8.3.4를 사용합니다. 정책 예외는 추가하지 않았습니다.

배포 연결과 새 환경 snapshot 게시·새 task 복원 검증은 이 구현 검증에 포함되지 않습니다.

SPA 정리 시점에는 단위/HTML validator 99개와 브라우저 37개를 실행했습니다. 독립 검토 후 이미지 인코딩과 fixture 프로세스 수명 주기 회귀 검증을 더해 최종 단위 테스트는 108개입니다. 브라우저 37개도 수정 후 통과했으며 자세한 결과와 경미한 후속 항목은 [최종 검토 기록](2026-10-21-astro-final-review.md)에 있습니다. 이전 컴파일러 선택 의존성을 없애기 위해 manifest를 기준으로 lockfile을 다시 계산했으며 frozen install과 peers check가 통과했습니다. 감사에서 발견한 Tinypool·KaTeX 3개 advisory는 패치된 overrides로 해소했습니다. KaTeX는 잘못된 breaking release로 deprecated된 0.18.11을 피하고 0.18.2로 고정했습니다. Mermaid fixture에는 수식 레이블도 포함합니다.
