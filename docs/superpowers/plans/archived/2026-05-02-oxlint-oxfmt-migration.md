> ✅ **완료** — 2026-05-02

# oxlint + oxfmt 마이그레이션 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ESLint + Prettier를 oxlint + oxfmt로 완전 교체하고 관련 설정 파일을 정리한다.

**Architecture:** package.json 의존성 교체 → 신규 설정 파일(oxlint.config.ts, oxfmt.config.ts) 생성 → lint-staged 업데이트 → 구 파일 삭제 → pnpm install 후 새 린트 오류 수정 순으로 단일 PR에서 처리한다.

**Tech Stack:** oxlint, oxfmt, pnpm, lint-staged, husky

**설계 문서:** `docs/superpowers/specs/2026-05-02-oxlint-oxfmt-migration-design.md`

---

## 파일 맵

| 액션 | 경로                    |
| ---- | ----------------------- |
| 수정 | `package.json`          |
| 수정 | `lint-staged.config.ts` |
| 생성 | `oxlint.config.ts`      |
| 생성 | `oxfmt.config.ts`       |
| 삭제 | `eslint.config.ts`      |
| 삭제 | `prettier.config.ts`    |
| 삭제 | `.prettierrc`           |
| 삭제 | `.prettierignore`       |

---

### Task 1: package.json 의존성·스크립트·peerDependencyRules 업데이트

**Files:**

- Modify: `package.json`

- [ ] **Step 1: devDependencies에서 ESLint/Prettier 관련 패키지 제거**

`package.json`의 `devDependencies`에서 아래 키를 모두 삭제한다:

```json
"@eslint/js": "^10.0.1",
"@vitest/eslint-plugin": "^1.6.15",
"eslint": "^10.2.0",
"eslint-plugin-react": "^7.37.5",
"eslint-plugin-react-hooks": "^7.0.1",
"eslint-plugin-storybook": "^10.3.5",
"eslint-plugin-testing-library": "^7.16.2",
"prettier": "^3.8.2",
"typescript-eslint": "^8.58.1"
```

- [ ] **Step 2: devDependencies에 oxlint + oxfmt 추가**

아래 명령을 실행한다. pnpm이 최신 안정 버전을 package.json에 자동으로 기록한다:

```bash
pnpm add -D oxlint oxfmt
```

- [ ] **Step 3: scripts 변경**

```json
"lint": "oxlint src",
"fmt":  "oxfmt ."
```

- [ ] **Step 4: pnpm.peerDependencyRules에서 eslint 항목 제거**

`package.json`의 `pnpm.peerDependencyRules.allowedVersions`에서 아래 두 항목을 삭제한다:

```json
"eslint-plugin-react-hooks>eslint": "^10.0.0",
"eslint-plugin-react>eslint": "^10.0.0"
```

---

### Task 2: oxlint.config.ts 생성

**Files:**

- Create: `oxlint.config.ts`

- [ ] **Step 1: oxlint 공식 문서에서 TypeScript config 형식 확인**

oxlint의 최신 TypeScript 설정 파일 형식을 공식 문서 또는 `node_modules/oxlint` 내부에서 확인한다.
`defineConfig` export 여부, import 경로(`'oxlint'` vs `'oxlint/config'` 등)를 검증한다.

- [ ] **Step 2: oxlint.config.ts 작성**

아래는 참고 형식이다. 실제 API는 Step 1에서 확인한 결과에 맞게 수정한다:

```ts
import type { OxlintConfig } from 'oxlint';

const config: OxlintConfig = {
  plugins: ['react', 'typescript'],
  categories: {
    correctness: 'error',
    suspicious: 'warn',
  },
  rules: {
    'typescript/no-explicit-any': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  ignorePatterns: [
    'node_modules',
    '.husky',
    '.kiro',
    '.netlify',
    '.pnpm-store',
    '.serena',
    '.vscode',
    '.next',
    'out',
    'build',
    'dist',
    'src/shared/config/route/routeTree.gen.ts',
  ],
};

export default config;
```

- [ ] **Step 3: oxlint 동작 확인 (설치 전이라면 Task 5 이후에 실행)**

```bash
pnpm oxlint src --config oxlint.config.ts
```

오류 수를 기록해 둔다 (Task 6에서 수정).

---

### Task 3: oxfmt.config.ts 생성

**Files:**

- Create: `oxfmt.config.ts`

- [ ] **Step 1: oxfmt 공식 문서에서 TypeScript config 형식 확인**

oxfmt의 최신 TypeScript 설정 파일 형식을 공식 문서 또는 `node_modules/oxfmt` 내부에서 확인한다.

- [ ] **Step 2: oxfmt.config.ts 작성**

아래는 참고 형식이다. 실제 API는 Step 1에서 확인한 결과에 맞게 수정한다:

```ts
import type { OxfmtConfig } from 'oxfmt';

const config: OxfmtConfig = {
  singleQuote: true,
  trailingComma: 'es5',
  endOfLine: 'lf',
};

export default config;
```

- [ ] **Step 3: oxfmt 포맷 확인 (설치 후)**

```bash
pnpm oxfmt src --check
```

포맷 차이가 있으면 `pnpm oxfmt src --write`로 일괄 적용한다.

---

### Task 4: lint-staged.config.ts 수정

**Files:**

- Modify: `lint-staged.config.ts`

- [ ] **Step 1: 파일 전체를 아래 내용으로 교체**

```ts
import { type Configuration } from 'lint-staged';

const config: Configuration = {
  '*.{ts,tsx,js,jsx}': ['oxfmt --write', 'oxlint --fix'],
};

export default config;
```

CSS/JSON/MD 포매팅은 제거한다 (설계 합의 사항).

---

### Task 5: pnpm install + 구 설정 파일 삭제

**Files:**

- Delete: `eslint.config.ts`, `prettier.config.ts`, `.prettierrc`, `.prettierignore`

- [ ] **Step 1: pnpm install 실행**

```bash
pnpm install
```

`node_modules`에서 ESLint/Prettier 패키지가 제거되고 oxlint/oxfmt가 설치된다.

- [ ] **Step 2: 구 설정 파일 삭제**

```bash
rm eslint.config.ts prettier.config.ts .prettierrc .prettierignore
```

- [ ] **Step 3: 중간 커밋**

```bash
git add -A
git commit -m "chore: oxlint + oxfmt으로 린터·포매터 교체"
```

---

### Task 6: 새 린트 오류 수정

**Files:**

- Modify: `src/**` (oxlint recommended 규칙에서 새로 감지된 파일)

- [ ] **Step 1: 전체 린트 실행 및 오류 목록 확인**

```bash
pnpm lint
```

- [ ] **Step 2: auto-fix 적용**

```bash
pnpm exec oxlint src --fix
```

- [ ] **Step 3: auto-fix로 해결되지 않은 오류 수동 수정**

`pnpm lint` 결과를 다시 확인하고 남은 오류를 파일별로 수정한다.
`typescript/no-explicit-any` 위반이 있다면 타입 가드 또는 제네릭으로 교체한다.

- [ ] **Step 4: 포맷 일괄 적용**

```bash
pnpm fmt
```

- [ ] **Step 5: 타입 체크**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 6: 테스트 실행**

```bash
pnpm test run
```

모든 테스트가 통과해야 한다 (374개).

- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "fix: oxlint recommended 규칙 위반 수정"
```

---

### Task 7: 최종 검증

- [ ] **Step 1: 전체 lint + fmt + tsc + test 통과 확인**

```bash
pnpm lint && pnpm fmt --check && pnpm tsc --noEmit && pnpm test run
```

모두 오류 없이 통과해야 한다.

- [ ] **Step 2: 임시 파일 스테이징 후 pre-commit 훅 동작 확인**

테스트용으로 파일 하나를 살짝 수정·스테이징한 뒤 `git commit`을 시도해 husky → lint-staged → oxfmt + oxlint가 정상 동작하는지 확인한다. 확인 후 amend 또는 reset으로 되돌린다.

- [ ] **Step 3: ESLint/Prettier 관련 파일이 남아 있지 않은지 확인**

```bash
find . -name 'eslint*' -o -name '.eslintrc*' -o -name 'prettier*' -o -name '.prettierrc*' | grep -v node_modules | grep -v docs
```

결과가 없어야 한다.
