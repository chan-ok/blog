# Home Introduction Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the home page introduction with the user-approved value statement in both supported locales.

**Architecture:** Keep the existing `about.introduction` translation key and update only its Korean and Japanese values. No component, route, layout, or styling changes are required.

**Tech Stack:** React Router, TypeScript, JSON locale files, npm scripts.

## Global Constraints

- Preserve all unrelated user changes in the dirty worktree.
- Keep the Korean copy exactly as approved: `손쉬운 정답보다 오래 붙드는 질문을, 그럴듯함보다 사람에게 깊이 닿는 가치를 선택합니다.`
- Provide a natural Japanese translation with the same meaning and one-sentence structure.
- Do not commit, push, or change component behavior.

---

### Task 1: Update localized home introduction

**Files:**
- Modify: `src/shared/locale/locales/ko.json` (`about.introduction`)
- Modify: `src/shared/locale/locales/ja.json` (`about.introduction`)

**Interfaces:**
- Consumes: Existing `about.introduction` lookup in `src/features/post/ui/about-block.tsx`.
- Produces: Updated Korean and Japanese home introduction text without changing the translation key.

- [ ] **Step 1: Replace the Korean value**

Set `about.introduction` to:

```text
손쉬운 정답보다 오래 붙드는 질문을, 그럴듯함보다 사람에게 깊이 닿는 가치를 선택합니다.
```

- [ ] **Step 2: Replace the Japanese value**

Set `about.introduction` to:

```text
安易な正解よりも長く向き合い続ける問いを、もっともらしさよりも人に深く届く価値を選びます。
```

- [ ] **Step 3: Validate the locale JSON**

Run:

```bash
npm run typecheck
```

Expected: the command exits successfully with no JSON or TypeScript errors.

- [ ] **Step 4: Run project quality checks**

Run:

```bash
npm run test:once
npm run lint:error
npm run build
```

Expected: each command exits successfully. If an unrelated pre-existing check fails, report the exact command and failure without changing unrelated files.

- [ ] **Step 5: Review the final diff**

Run:

```bash
git diff -- src/shared/locale/locales/ko.json src/shared/locale/locales/ja.json
git status --short
```

Expected: only the two `about.introduction` values differ in the locale files, and all pre-existing modified files remain untouched.
