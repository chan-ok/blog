# 테스트 코드 최적화 요약

테스트 코드 최적화 계획에 따라 적용한 기준과 변경 요약입니다.

## 적용 기준

- **실행 시간**: 유닛/기능 테스트 각 `it` 5초 이내 목표 (`testTimeout: 5000`)
- **Property-based 반복**: 동일 케이스 내 **최대 20회** (`numRuns: 20`)
- **검증**: 기능 위주, 스타일 검증 파일당 1~2개로 제한
- **병렬**: unit 프로젝트 `pool: 'threads'` 명시
- **대기**: 고정 `setTimeout` 대신 `waitFor` 사용
- **보안**: 검증 우회 목 없음, 실패 경로 검증 유지

## 주요 변경

1. **Vitest**: `vite.config.ts`에 `testTimeout: 5000`, unit `pool: 'threads'` 추가
2. **numRuns**: 모든 `fc.assert`를 `numRuns: 20`으로 통일 (기존 30/50 제거)
3. **스타일 검증 축소**: typography, code, footer, header, table-wrapper, post-compact-card, table-of-contents, optimized-image 등에서 className/toHaveClass 최소화
4. **code-block**: `setTimeout(100)` 제거, `waitFor`로 대체
5. **문서**: `docs/testing.md`에 numRuns 상한, 커밋/푸시 원칙, **테스트 작성 규칙** 섹션 추가

## 참고

- 상세 규칙은 [testing.md](./testing.md)의 "테스트 작성 규칙" 참고
- 커밋 전 `pnpm test --project=unit run`, 푸시 전 `pnpm e2e` 실행 권장
