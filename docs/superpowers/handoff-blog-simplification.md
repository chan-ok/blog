# 블로그 최소화 재구성 — 세션 인계 지시

> 새 세션에서 아래 "복붙용 지시"를 그대로 첫 메시지로 보내면 이어서 진행됩니다.

---

## 복붙용 지시

블로그 최소화 재구성 작업을 이어서 진행해줘. 아래 문서를 먼저 읽고 현재 상태를 파악해.

**문서**

- 플랜: docs/superpowers/plans/2026-06-20-blog-simplification.md
- 스펙: docs/superpowers/specs/2026-06-19-blog-simplification-design.md

**현재 상태 (브랜치: feat/blog-simplification)**

- Phase 0 커밋 완료: `c513e6f`(docs) / `de816a5`(knip) / `eca75eb`(design)
- Phase 1(contact·태그·검색·부가기능·en 삭제 + en.svg 제거): 변경은 워킹트리에 모두 적용됨(약 41개: 삭제 23 / 수정 18), `npm run tsc` 통과·`npm run build` 통과 확인됨. **단 아직 미커밋** — Codex가 커밋 단계에서 2회 중단(멈춤 + 세션 재시작)됨.
- Phase 2~8 미진행. 워킹트리는 Phase 1 범위만 담고 있음(routes 미이동·locale 미통합·about 그대로 확인됨). react-query 참조 3건은 Phase 3에서 제거 예정이라 정상.

**즉시 할 일: Phase 1 커밋 정리**

1. 워킹트리의 Phase 1 변경을 의미 단위 커밋으로 정리:
   - contact 삭제 / 태그 삭제 / 검색 삭제 / 부가기능 삭제 / en 제거
   - 공유 수정 파일(get-posts.ts, posts/index.tsx, header.tsx 등)이 여러 Task에 걸치면 가장 관련된 커밋에 합리적으로 배치. 완벽한 분리가 어려우면 contact / 태그·검색 / 부가기능 / en 4개로 묶어도 됨.
2. 커밋 후 `npm run tsc && npm run build` 통과 확인.
3. Codex가 커밋에서 반복 실패했으니, 이 커밋 정리는 Claude Code가 직접 수행해도 된다(변경은 이미 완료·검증됨, 감사·관리 범위).

**그 다음 (플랜 순서대로, 각 Phase는 Codex에 위임 + 단계별 리뷰)**

- Phase 2 마크다운 컴포넌트 통합 → Phase 3 react-query→router loader → Phase 4 FSD 재구성(about→post, locale 묶기, pages→app/routes) → Phase 5 테마 자동·푸터 이메일 → Phase 6 React Compiler 적용 → Phase 7 의존성 제거+업그레이드 → Phase 8 최종 검증·PR

**규칙(중요)**

- 구현·커밋·명령 실행은 Codex(/codex, codex:rescue) 위임이 기본. Claude Code는 관리·리뷰. 단 커밋 정리 같은 작은 관리 작업은 직접 가능.
- 이 프로젝트는 테스트 0개·테스트 인프라 제거 → TDD 아님. 검증은 `tsc`/`lint`/`build`/수동 동작.
- feature 브랜치 → develop 으로 PR (main 직접 금지).
- satteri 관련은 일절 기록·도입하지 않음(사용자 지시).
- Codex 위임 시 "변경 후 Task별 커밋"을 명시해도 누락할 수 있으니, 완료 후 git log로 커밋 여부를 반드시 확인할 것.

---

## 참고: 중단 시점 메모 (2026-06-20)

- Codex rescue가 Task 1.5(en 제거) 진입 직후 hang(약 30분 무진전) → 취소 후 재위임 → 재위임도 커밋 직전 세션 재시작으로 중단.
- 두 번 모두 "파일 변경은 완료, 커밋만 미수행" 패턴. 그래서 다음엔 커밋을 Claude가 직접 정리하기로 함.
