---
title: oxlint + oxfmt 마이그레이션
date: 2026-05-02
status: approved
---

## 목표

ESLint + Prettier를 oxlint + oxfmt로 완전 교체한다.

## 범위

### 삭제

- `eslint.config.ts`
- `prettier.config.ts`
- `.prettierrc`
- `.prettierignore`

### 생성

- `oxlint.config.ts` — oxlint 설정
- `oxfmt.config.ts` — oxfmt 포맷 옵션

### 수정

- `package.json` — scripts, devDependencies, peerDependencyRules
- `lint-staged.config.ts` — oxfmt + oxlint 명령으로 교체

## 설정 상세

### oxlint.config.ts

- 플러그인: `react`, `typescript`
- 규칙:
  - `typescript/no-explicit-any: error` (기존 유지)
  - `react-hooks/rules-of-hooks: error` (기존 유지)
  - `react-hooks/exhaustive-deps: warn` (기존 유지)
  - oxlint recommended 규칙셋 활성화 (correctness, suspicious 등)
- ignorePatterns: 기존 ESLint globalIgnores 목록 이식
  - `.node_modules`, `.husky/**`, `.kiro/**`, `.netlify/**`, `.pnpm-store/**`
  - `.serena/**`, `.vscode/**`, `.next/**`, `out/**`, `build/**`, `dist/**`
  - `src/shared/config/route/routeTree.gen.ts`

### oxfmt.config.ts

기존 Prettier 설정 이식:

- `singleQuote: true`
- `trailingComma: 'es5'`
- `endOfLine: 'lf'`

### package.json

**scripts 변경:**

```json
"lint": "oxlint src",
"fmt":  "oxfmt ."
```

**devDependencies 제거:**

- `eslint`, `@eslint/js`, `typescript-eslint`
- `eslint-plugin-react`, `eslint-plugin-react-hooks`
- `eslint-plugin-storybook`, `eslint-plugin-testing-library`
- `@vitest/eslint-plugin`
- `prettier`

**devDependencies 추가:**

- `oxlint`
- `oxfmt`

**peerDependencyRules 제거:**

- `eslint-plugin-react-hooks>eslint` 항목
- `eslint-plugin-react>eslint` 항목

### lint-staged.config.ts

```ts
const config: Configuration = {
  '*.{ts,tsx,js,jsx}': ['oxfmt --write', 'oxlint --fix'],
};
```

CSS/JSON/MD 포매팅은 제거 (포매팅 범위 축소 합의).

## 의도적으로 제거하는 기능

| 기능                                 | 이유                                         |
| ------------------------------------ | -------------------------------------------- |
| `@vitest/eslint-plugin` 규칙         | oxlint 미지원, 개인 블로그이므로 실용적 포기 |
| `eslint-plugin-testing-library` 규칙 | 동일                                         |
| CSS/JSON/MD 포매팅                   | oxfmt JS/TS 전용, Prettier 완전 제거 우선    |

## husky

변경 없음. pre-commit은 기존과 동일하게 `pnpm exec lint-staged` 호출.
