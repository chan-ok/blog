# 프로덕션 포스트 공개성 통합 설계

- 작성일: 2026-07-14
- 상태: 승인됨 (구현 전)
- 목표: 테스트용·초안 포스트가 프로덕션 목록과 상세 URL에서 노출되지 않도록 공개성 정책을 한 곳에서 판정한다.

## 1. 배경과 근본 원인

커밋 `d9a1575`의 태그·검색 기능 제거 과정에서 `DEV_ONLY_TAGS`와 이를 사용하던
프로덕션 필터 및 관련 회귀 테스트가 함께 제거되었다. 그 결과 현재 목록 조회는
`published`만 확인하고, 상세 loader는 frontmatter 공개성을 확인하지 않는다.
따라서 `published: true`인 `test`/`draft` 포스트는 프로덕션 목록에 나타나며, 목록에서
숨기더라도 상세 URL을 알면 직접 접근할 수 있다.

## 2. 범위와 성공 조건

이번 변경은 다음 두 노출 지점에 같은 공개성 정책을 적용한다.

1. 포스트 목록: 프로덕션 응답에서 비공개 포스트를 페이지네이션 전에 제거한다.
2. 포스트 상세: 프로덕션에서 비공개 포스트의 직접 URL 접근을 404로 처리한다.

정책은 아래와 같다.

| 환경 | 지점 | 노출 조건 |
| --- | --- | --- |
| prod | 목록·상세 | `published === true`이고 `tags`에 정확히 `test` 또는 `draft`가 없어야 한다. |
| dev | 목록 | 기존 동작을 보존해 `published === true`만 요구한다. `test`/`draft` 태그는 허용한다. |
| dev | 상세 | 로컬 미리보기를 위해 `published: false`, `test`, `draft` 포스트도 허용한다. |

`test`와 `draft`는 대소문자를 변환하지 않는 정확 일치 태그로 취급한다. 빈 태그 배열은
개발 전용 태그가 없는 것으로 본다.

## 3. 아키텍처

`src/features/post/util/post-visibility.ts`에 공개성 판정만 담당하는 순수 helper를 둔다.
helper는 frontmatter의 `published`와 `tags`, 실행 환경, 노출 지점을 입력받고 boolean을
반환한다. 구체적인 API는 다음 의미를 드러내야 한다.

```ts
isPostVisible(frontmatter, {
  isProduction: boolean,
  surface: 'list' | 'detail',
}): boolean
```

helper 내부에서 `import.meta.env`를 읽지 않는다. 각 호출부가 `import.meta.env.PROD` 값을
`isProduction`으로 명시 주입한다. `surface`도 명시 주입해 dev 목록과 상세의 의도적인
차이를 숨기지 않는다. prod에서는 `surface`와 무관하게 동일한 엄격한 조건을 적용한다.

이 경계로 공개성 규칙을 한 파일에서 관리하고, 환경별 분기를 단위 테스트에서 실제
빌드 환경과 독립적으로 검증한다.

## 4. 데이터 흐름

### 4.1 목록

`src/features/post/util/get-posts.ts`의 흐름은 다음 순서를 따른다.

1. locale의 `index.json`을 가져온다.
2. 썸네일 URL을 정규화하고 생성일 역순으로 정렬한다.
3. 각 frontmatter를 `isPostVisible(..., { isProduction: import.meta.env.PROD,
   surface: 'list' })`로 필터링한다.
4. 필터링된 배열을 페이지네이션하고 그 길이를 `total`로 반환한다.

공개성 필터를 페이지네이션보다 먼저 적용해 비공개 글 때문에 페이지 크기나 `total`이
왜곡되지 않게 한다.

### 4.2 상세와 404

`src/app/routes/$locale/posts/$.tsx` loader는 현재와 같이 경로를 검증하고
`getMarkdown(path, BASE_URL)`을 호출한다. 호출이 성공한 직후, 반환된
`markdown.frontmatter`를 `isPostVisible(..., { isProduction: import.meta.env.PROD,
surface: 'detail' })`로 판정한다.

판정 결과가 false이면 loader는 즉시 `throw notFound()` 한다. 이 경우 markdown 데이터와
head 메타데이터를 route에 반환하지 않으며, TanStack Router의 기존 404 처리 흐름을
사용한다. prod의 미게시·`test`·`draft` 포스트는 존재하지 않는 URL처럼 동작하고, dev의
직접 URL 미리보기는 유지된다.

## 5. TDD와 테스트 범위

구현 전에 실패하는 회귀 테스트를 추가하고 RED를 확인한 뒤 최소 구현으로 통과시킨다.

### 순수 helper

- prod: 게시된 일반 포스트만 true이다.
- prod: `published: false`, `test`, `draft` 각각과 복합 태그 사례는 false이다.
- dev 목록: 게시된 일반·`test`·`draft` 포스트는 true이고 미게시 포스트는 false이다.
- dev 상세: 미게시 포스트와 `test`/`draft` 포스트도 true이다.
- 태그가 비어 있거나 생략된 게시 포스트를 올바르게 처리한다.

### 목록

- prod 응답에서 미게시·`test`·`draft` 포스트가 제거된다.
- dev에서는 기존 목록 규칙인 `published === true`를 유지하면서 `test`/`draft`를 보존한다.
- `total`과 페이지 결과는 공개성 필터가 적용된 컬렉션을 기준으로 계산된다.

### 상세

- prod loader는 미게시·`test`·`draft` frontmatter에서 `notFound()`를 던진다.
- prod loader는 공개 포스트 데이터를 정상 반환한다.
- dev loader는 미게시·`test`·`draft` 포스트의 직접 미리보기를 허용한다.

환경 값은 테스트가 전역 빌드 모드에 의존하지 않도록 명시적으로 주입하거나, 호출부의
얇은 경계를 격리해 제어한다.

## 6. 비범위

- 원격 `index.json` 또는 MDX fetch 방식 변경
- `getMarkdown`의 compile/evaluate 파이프라인 리팩터링
- 공개성 판정 전에 원격 MDX fetch나 evaluate를 생략하는 최적화
- CMS·콘텐츠 저장소 구조 및 frontmatter 스키마 변경
- 태그 검색·필터 UI 복원

상세 loader는 요구사항대로 `getMarkdown` 직후 공개성을 판정한다. fetch/evaluate 이전에
frontmatter만 별도로 읽도록 바꾸는 작업은 별도 최적화 과제로 남긴다.

## 7. 검증 조건

완료 선언 전 다음 근거를 모두 확보한다.

1. helper, 목록, 상세 회귀 테스트가 통과한다.
2. 전체 unit test, typecheck, lint, production build가 통과한다.
3. prod 조건에서 일반 게시글은 목록·상세에 노출되고, 미게시·`test`·`draft` 글은 목록에서
   빠지며 상세 접근은 404가 된다.
4. dev 조건에서 목록은 기존 `published` 필터를 유지하고, 미게시·`test`·`draft` 상세 URL
   미리보기가 가능하다.
5. 최종 diff에 원격 fetch/MDX evaluate 리팩터링이나 사용자 작업 파일 등 비범위 변경이
   포함되지 않는다.

이 문서 작성 단계에서는 커밋하거나 푸시하지 않는다. 구현·반복 리뷰·전체 검증이 모두
끝난 뒤 사용자 요청과 외부 작업 경계에 따라 최종 변경을 통합한다.

## 8. 근거 경로

- `src/features/post/util/get-posts.ts:43-53`: 현재 목록은 `published`만 필터링한다.
- `src/app/routes/$locale/posts/$.tsx:19-35`: 상세 loader는 `getMarkdown` 뒤 공개성 판정 없이 데이터를 반환한다.
- `src/entities/markdown/util/get-markdown.ts:26-48,79-86`: 상세 frontmatter를 얻는 현재 MDX 로딩 경계이다.
- `src/entities/markdown/model/model.schema.ts:17-29`: `tags`와 `published`의 frontmatter 스키마이다.
- `vite.config.ts:123-136`: 현재 Vitest unit 프로젝트 설정이다.
- Git commit `d9a1575`: 태그·검색 제거 과정의 `DEV_ONLY_TAGS` 공개성 필터 제거 이력이다.

CodeGraph는 현재 세션에 제공되지 않아 위 경로는 제한 읽기와 Git 이력으로 교차 검증했다.
