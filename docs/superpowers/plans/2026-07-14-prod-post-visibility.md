# Production Post Visibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep test, draft, unpublished, and incomplete-frontmatter posts out of production lists and direct detail URLs while preserving the agreed development preview behavior.

**Architecture:** Add one pure visibility policy helper that accepts the frontmatter, an explicit `isProduction` flag, and an explicit `surface: 'list' | 'detail'`. The list and detail loader call that helper with `import.meta.env.PROD`; the detail loader throws TanStack Router's `notFound()` immediately after loading markdown when the policy denies access. Keep fetching and MDX evaluation unchanged.

**Tech Stack:** TypeScript, React, TanStack Router, Vite `import.meta.env`, Vitest (Node environment), pnpm

## Global Constraints

- Production list and detail visibility require `published === true` and no exact `test` or `draft` tag.
- Missing `published` frontmatter is non-public in production.
- Development lists still require `published === true`, but allow `test` and `draft` tags.
- Development detail routes allow unpublished, missing-`published`, `test`, and `draft` posts for preview.
- The helper must receive both `isProduction: boolean` and `surface: 'list' | 'detail'` explicitly; it must not read environment state itself.
- Both consumers must pass `import.meta.env.PROD`.
- In the detail loader, run the visibility check immediately after `getMarkdown()` and `throw notFound()` before constructing the loader return value.
- Do not refactor the fetch or MDX evaluation pipeline.
- Use Vitest against real policy and consumer code. Mock only `api.get`, `getMarkdown`, and the router `notFound` boundary needed to isolate I/O and 404 behavior.
- Do not add DOM testing dependencies; the configured Vitest environment is `node`.
- Do not modify unrelated files or anything under `_workspace/`.
- Do not create intermediate commits. After every review finding is resolved and the full verification gate passes, create one final commit.

---

### Task 1: Shared post visibility policy

**Files:**
- Create: `src/features/post/util/post-visibility.ts`
- Test: `src/features/post/util/post-visibility.test.ts`

**Interfaces:**
- Consumes: `Frontmatter` from `@/entities/markdown/model/model.schema`
- Produces: `PostVisibilitySurface = 'list' | 'detail'`
- Produces: `PostVisibilityOptions = { isProduction: boolean; surface: PostVisibilitySurface }`
- Produces: `PostVisibilityFrontmatter = Pick<Partial<Frontmatter>, 'published' | 'tags'>`
- Produces: `isPostVisible(frontmatter: PostVisibilityFrontmatter, context: PostVisibilityOptions): boolean`

- [ ] **Step 1: Write the policy matrix as a failing unit test**

Create `src/features/post/util/post-visibility.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { isPostVisible } from './post-visibility';

describe('isPostVisible', () => {
  describe.each(['list', 'detail'] as const)('in production on %s', (surface) => {
    it('shows a published post without reserved tags', () => {
      expect(
        isPostVisible(
          { published: true, tags: ['react'] },
          { isProduction: true, surface },
        ),
      ).toBe(true);
    });

    it.each([undefined, []])(
      'shows a published post when tags are empty or omitted',
      (tags) => {
        expect(
          isPostVisible(
            { published: true, tags },
            { isProduction: true, surface },
          ),
        ).toBe(true);
      },
    );

    it('uses exact case-sensitive tag matching', () => {
      expect(
        isPostVisible(
          { published: true, tags: ['Test', 'DRAFT'] },
          { isProduction: true, surface },
        ),
      ).toBe(true);
    });

    it.each([
      [{ published: false, tags: [] }, 'an unpublished post'],
      [{ tags: [] }, 'a post with missing published frontmatter'],
      [{ published: true, tags: ['test'] }, 'a test post'],
      [{ published: true, tags: ['draft'] }, 'a draft post'],
      [
        { published: true, tags: ['react', 'test'] },
        'a post with a test tag among other tags',
      ],
    ])('hides %s', (frontmatter) => {
      expect(
        isPostVisible(frontmatter, { isProduction: true, surface }),
      ).toBe(false);
    });
  });

  describe('in development', () => {
    it.each([['test'], ['draft']])(
      'shows a published %s post in the list',
      (tag) => {
        expect(
          isPostVisible(
            { published: true, tags: [tag] },
            { isProduction: false, surface: 'list' },
          ),
        ).toBe(true);
      },
    );

    it.each([{ published: false }, {}])(
      'hides an unpublished or incomplete post from the list',
      (frontmatter) => {
        expect(
          isPostVisible(frontmatter, {
            isProduction: false,
            surface: 'list',
          }),
        ).toBe(false);
      },
    );

    it.each([
      { published: false, tags: [] },
      { tags: [] },
      { published: true, tags: ['test'] },
      { published: true, tags: ['draft'] },
    ])('allows preview access on the detail surface', (frontmatter) => {
      expect(
        isPostVisible(frontmatter, {
          isProduction: false,
          surface: 'detail',
        }),
      ).toBe(true);
    });
  });
});
```

- [ ] **Step 2: Run the policy test to verify RED**

Run:

```bash
pnpm test:once -- src/features/post/util/post-visibility.test.ts
```

Expected: FAIL because `./post-visibility` does not exist.

- [ ] **Step 3: Implement the minimal pure policy helper**

Create `src/features/post/util/post-visibility.ts`:

```ts
import type { Frontmatter } from '@/entities/markdown/model/model.schema';

const NON_PUBLIC_TAGS = new Set(['test', 'draft']);

export type PostVisibilitySurface = 'list' | 'detail';

export interface PostVisibilityOptions {
  isProduction: boolean;
  surface: PostVisibilitySurface;
}

export type PostVisibilityFrontmatter = Pick<
  Partial<Frontmatter>,
  'published' | 'tags'
>;

export function isPostVisible(
  frontmatter: PostVisibilityFrontmatter,
  context: PostVisibilityOptions,
): boolean {
  if (context.isProduction) {
    return (
      frontmatter.published === true &&
      !frontmatter.tags?.some((tag) => NON_PUBLIC_TAGS.has(tag))
    );
  }

  if (context.surface === 'list') {
    return frontmatter.published === true;
  }

  return true;
}
```

- [ ] **Step 4: Run the policy test to verify GREEN**

Run:

```bash
pnpm test:once -- src/features/post/util/post-visibility.test.ts
```

Expected: PASS; all production and development list/detail matrix cases pass.

---

### Task 2: Production-safe post listing

**Files:**
- Modify: `src/features/post/util/get-posts.ts`
- Test: `src/features/post/util/get-posts.test.ts`

**Interfaces:**
- Consumes: `isPostVisible(frontmatter, { isProduction, surface })` from Task 1
- Consumes: existing `getPosts(props: GetPostsProps): Promise<PagingPosts>`
- Produces: unchanged `getPosts` signature and pagination contract, with policy-filtered `posts` and `total`

- [ ] **Step 1: Write list regression tests against the real `getPosts` implementation**

Create `src/features/post/util/get-posts.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Frontmatter } from '@/entities/markdown/model/model.schema';
import { api } from '@/shared/api';
import { getPosts } from './get-posts';

vi.mock('@/shared/api', () => ({
  api: { get: vi.fn() },
}));

function createPost(
  title: string,
  overrides: Partial<Frontmatter> = {},
): Frontmatter {
  return {
    title,
    path: ['posts', title.toLowerCase().replaceAll(' ', '-')],
    tags: [],
    createdAt: new Date('2026-07-14T00:00:00.000Z'),
    updatedAt: null,
    published: true,
    ...overrides,
  };
}

function mockApiGet(data: Frontmatter[]) {
  vi.mocked(api.get).mockResolvedValue({
    data,
    axios: { status: 200 } as import('axios').AxiosResponse,
  } as Awaited<ReturnType<typeof api.get>>);
}

describe('getPosts visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv(
      'VITE_GIT_RAW_URL',
      'https://raw.example.test/content',
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('removes unpublished, test, and draft posts in production before pagination', async () => {
    vi.stubEnv('PROD', true);
    mockApiGet([
      createPost('Public'),
      createPost('Unpublished', {
        published: false,
        createdAt: new Date('2026-07-15T00:00:00.000Z'),
      }),
      createPost('Test', {
        tags: ['test'],
        createdAt: new Date('2026-07-16T00:00:00.000Z'),
      }),
      createPost('Draft', {
        tags: ['draft'],
        createdAt: new Date('2026-07-17T00:00:00.000Z'),
      }),
    ]);

    const result = await getPosts({ locale: 'ko', page: 0, size: 1 });

    expect(result.posts.map((post) => post.title)).toEqual(['Public']);
    expect(result.total).toBe(1);
  });

  it('keeps published test and draft posts in development lists', async () => {
    vi.stubEnv('PROD', false);
    mockApiGet([
      createPost('Test', { tags: ['test'] }),
      createPost('Draft', { tags: ['draft'] }),
      createPost('Unpublished', { published: false }),
    ]);

    const result = await getPosts({ locale: 'ko', page: 0, size: 10 });

    expect(result.posts.map((post) => post.title)).toEqual(['Test', 'Draft']);
    expect(result.total).toBe(2);
  });
});
```

- [ ] **Step 2: Run the list regression test to verify RED**

Run:

```bash
pnpm test:once -- src/features/post/util/get-posts.test.ts
```

Expected: FAIL in the production case because the current `.filter((post) => post.published)` still returns published posts tagged `test` and `draft`. The `VITE_GIT_RAW_URL` stub prevents `getPosts` from taking its early empty-result branch, so the observed RED is specifically caused by the missing visibility policy.

- [ ] **Step 3: Route list filtering through the shared helper**

Add this import to `src/features/post/util/get-posts.ts` beside its local post imports:

```ts
import { isPostVisible } from './post-visibility';
```

Replace the existing final list filter:

```ts
.filter((post) => post.published);
```

with:

```ts
.filter((post) =>
  isPostVisible(post, {
    isProduction: import.meta.env.PROD,
    surface: 'list',
  }),
);
```

- [ ] **Step 4: Run helper and list tests to verify GREEN**

Run:

```bash
pnpm test:once -- src/features/post/util/post-visibility.test.ts src/features/post/util/get-posts.test.ts
```

Expected: PASS; production excludes reserved tags before `total` and pagination are calculated, while development keeps published reserved-tag posts.

---

### Task 3: Production detail-route 404 guard

**Files:**
- Modify: `src/app/routes/$locale/posts/$.tsx`
- Test: `src/app/routes/$locale/posts/$.test.ts`

**Interfaces:**
- Consumes: `getMarkdown(path: string, baseURL: string): Promise<MarkdownElement>` and its partial `MarkdownFrontmatter`
- Consumes: `isPostVisible(frontmatter, { isProduction, surface: 'detail' })` from Task 1
- Consumes: TanStack Router `notFound()`
- Produces: unchanged successful loader result `{ frontmatter, markdownPromise, path }`; denied production access throws the router not-found result

- [ ] **Step 1: Write loader regression tests with only I/O and not-found boundaries mocked**

Create `src/app/routes/$locale/posts/$.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  MarkdownElement,
  MarkdownFrontmatter,
} from '@/entities/markdown/util/get-markdown';
import { getMarkdown } from '@/entities/markdown/util/get-markdown';

vi.mock('@/entities/markdown/util/get-markdown', () => ({
  getMarkdown: vi.fn(),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual<
    typeof import('@tanstack/react-router')
  >('@tanstack/react-router');
  return {
    ...actual,
    notFound: () => {
      throw new Error('Not Found');
    },
  };
});

import { Route } from './$';

type Loader = (args: {
  params: { locale: string; _splat: string };
}) => Promise<unknown>;

function createMarkdown(frontmatter: MarkdownFrontmatter): MarkdownElement {
  return {
    frontmatter,
    content: '',
    source: '',
    MDXContent: () => null,
  };
}

function loadPost() {
  const loader = Route.options.loader as Loader;
  return loader({ params: { locale: 'ko', _splat: 'visibility-test' } });
}

describe('post detail loader visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it.each([
    [{ published: false, tags: [] }, 'unpublished'],
    [{ tags: [] }, 'missing-published'],
    [{ published: true, tags: ['test'] }, 'test'],
    [{ published: true, tags: ['draft'] }, 'draft'],
  ])('returns not found for a %s post in production', async (frontmatter) => {
    vi.stubEnv('PROD', true);
    vi.mocked(getMarkdown).mockResolvedValue(createMarkdown(frontmatter));

    await expect(loadPost()).rejects.toThrow('Not Found');
  });

  it('returns the existing loader payload for a public production post', async () => {
    vi.stubEnv('PROD', true);
    const markdown = createMarkdown({
      published: true,
      tags: ['react'],
      title: 'Public post',
    });
    vi.mocked(getMarkdown).mockResolvedValue(markdown);

    await expect(loadPost()).resolves.toMatchObject({
      frontmatter: markdown.frontmatter,
      path: 'ko/visibility-test.mdx',
    });
  });

  it('keeps development preview access for unpublished and reserved-tag posts', async () => {
    vi.stubEnv('PROD', false);
    const markdown = createMarkdown({ published: false, tags: ['test'] });
    vi.mocked(getMarkdown).mockResolvedValue(markdown);

    await expect(loadPost()).resolves.toMatchObject({
      frontmatter: markdown.frontmatter,
      path: 'ko/visibility-test.mdx',
    });
  });
});
```

- [ ] **Step 2: Run the loader regression test to verify RED**

Run:

```bash
pnpm test:once -- 'src/app/routes/$locale/posts/$.test.ts'
```

Expected: FAIL because the current loader returns markdown for production `published: false`, missing-`published`, `test`, and `draft` frontmatter instead of throwing `Not Found`.

- [ ] **Step 3: Guard the loader immediately after markdown retrieval**

Add the shared policy import to `src/app/routes/$locale/posts/$.tsx`:

```ts
import { isPostVisible } from '@/features/post/util/post-visibility';
```

Keep the existing fetch line, then insert the guard directly after it and before the existing `return`:

```ts
const markdown = await getMarkdown(path, BASE_URL);

if (
  !isPostVisible(markdown.frontmatter, {
    isProduction: import.meta.env.PROD,
    surface: 'detail',
  })
) {
  throw notFound();
}

return {
  frontmatter: markdown.frontmatter,
  markdownPromise: Promise.resolve(markdown),
  path,
};
```

- [ ] **Step 4: Run all three focused test files to verify GREEN**

Run:

```bash
pnpm test:once -- src/features/post/util/post-visibility.test.ts src/features/post/util/get-posts.test.ts 'src/app/routes/$locale/posts/$.test.ts'
```

Expected: PASS; both production surfaces deny every non-public category, development list behavior is unchanged, and development detail previews remain accessible.

---

### Task 4: Full verification, iterative review, and single commit

**Files:**
- Review: `src/features/post/util/post-visibility.ts`
- Review: `src/features/post/util/post-visibility.test.ts`
- Review: `src/features/post/util/get-posts.ts`
- Review: `src/features/post/util/get-posts.test.ts`
- Review: `src/app/routes/$locale/posts/$.tsx`
- Review: `src/app/routes/$locale/posts/$.test.ts`
- Review: `docs/superpowers/specs/2026-07-14-prod-post-visibility-design.md`
- Review: `docs/superpowers/plans/2026-07-14-prod-post-visibility.md`

**Interfaces:**
- Consumes: the complete policy, list integration, and detail integration from Tasks 1-3
- Produces: review-clean, fully verified changes and one final commit

- [ ] **Step 1: Run the complete automated verification gate**

Run each command in order:

```bash
pnpm test:once
pnpm typecheck
pnpm lint:error
pnpm build
git diff --check
```

Expected: every command exits `0`; all Vitest tests pass, TypeScript reports no errors, oxlint reports no error-level findings, Vite completes a production build, and Git reports no whitespace errors.

- [ ] **Step 2: Stage only the intended files and review the complete cached diff**

Stage the exact approved set so newly created, previously untracked files are included in the review:

```bash
git add src/features/post/util/post-visibility.ts src/features/post/util/post-visibility.test.ts src/features/post/util/get-posts.ts src/features/post/util/get-posts.test.ts 'src/app/routes/$locale/posts/$.tsx' 'src/app/routes/$locale/posts/$.test.ts' docs/superpowers/specs/2026-07-14-prod-post-visibility-design.md docs/superpowers/plans/2026-07-14-prod-post-visibility.md
git diff --cached --check
git diff --cached --stat
git diff --cached -- src/features/post/util/post-visibility.ts src/features/post/util/post-visibility.test.ts src/features/post/util/get-posts.ts src/features/post/util/get-posts.test.ts 'src/app/routes/$locale/posts/$.tsx' 'src/app/routes/$locale/posts/$.test.ts' docs/superpowers/specs/2026-07-14-prod-post-visibility-design.md docs/superpowers/plans/2026-07-14-prod-post-visibility.md
git status --short
git status --short -- _workspace/ .superpowers/sdd/progress.md
```

Expected review evidence:

```text
The cached stat and body contain exactly the eight approved paths, including every new file
git diff --cached --check reports no whitespace errors
Production list: published true + no test/draft tag
Production detail: published true + no test/draft tag, otherwise notFound
Development list: published true, test/draft allowed
Development detail: unpublished/test/draft/missing-published preview allowed
Both consumers inject import.meta.env.PROD and an explicit surface
No fetch/evaluate refactor
git status shows no staged index status for _workspace/ or .superpowers/sdd/progress.md; untracked ?? output is acceptable because those paths must remain outside the commit
```

- [ ] **Step 3: Resolve every review finding and rerun the full gate until clean**

For each correctness, scope, type, test, lint, build, or diff finding, first add or adjust the narrowest regression assertion that demonstrates it, run the affected focused test to observe RED, make the minimum policy-preserving correction, and rerun the focused test for GREEN. Then repeat all commands from Task 4 Step 1 and the exact staging plus cached-diff review from Step 2 so the index contains the corrected versions.

Expected: zero unresolved review findings and a fresh all-green verification run after the last code change.

- [ ] **Step 4: Create the single final commit only after the clean review**

Stage only the approved implementation and Superpowers artifacts:

```bash
git add src/features/post/util/post-visibility.ts src/features/post/util/post-visibility.test.ts src/features/post/util/get-posts.ts src/features/post/util/get-posts.test.ts 'src/app/routes/$locale/posts/$.tsx' 'src/app/routes/$locale/posts/$.test.ts' docs/superpowers/specs/2026-07-14-prod-post-visibility-design.md docs/superpowers/plans/2026-07-14-prod-post-visibility.md
git diff --cached --check
git diff --cached --stat
git commit -m "fix: hide non-public posts in production"
```

Expected: staged diff contains only the eight approved files, both cached-diff checks succeed, and exactly one new commit is created with message `fix: hide non-public posts in production`.
