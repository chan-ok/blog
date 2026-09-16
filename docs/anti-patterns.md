# 자주 하는 실수와 안티패턴

## 존재하지 않는 구조를 전제로 하기

현재 프로젝트에는 `pages`, `widgets`, 숫자 접두사 레이어, Contact 폼, Storybook script가 없습니다. 과거 문서를 복사해 경로나 명령을 만들지 말고 실제 tree와 `package.json`을 확인합니다.

## 레이어 역방향 import

```typescript
// 잘못된 예: shared가 feature를 앎
import PostCard from '@/features/post/ui/post-card';
```

`shared`는 상위 레이어를 import하지 않습니다. 전체 규칙은 [architecture-rules.md](./architecture-rules.md)를 따릅니다.

## 검증 없는 외부 데이터

- URL 문자열을 이어 붙여 외부 경로를 만들기
- `..`, 중복 인코딩, 절대 경로를 허용하기
- YAML 값을 타입 단언만으로 신뢰하기
- frontmatter 크기와 형식을 제한하지 않기

외부 Markdown은 `markdown-path.ts`, `parse-markdown.ts`, Zod 스키마를 거쳐야 합니다.

## 실행 가능한 원격 콘텐츠

- 원격 MDX를 `eval`, `Function`, 런타임 compiler로 실행하기
- `rehype-raw`를 검토 없이 추가하기
- 정화하지 않은 HTML·SVG를 `dangerouslySetInnerHTML`에 넣기

현재 콘텐츠는 `react-markdown`과 `skipHtml`로 렌더링합니다. Mermaid SVG만 strict 모드와 DOMPurify를 거쳐 삽입합니다.

## 공개성 정책 복제

목록과 상세에서 서로 다른 조건을 직접 작성하면 초안이 한쪽에 노출될 수 있습니다. `isPostVisible`을 사용하고 환경과 surface를 명시합니다. 이 정책을 인증·비밀 보관 수단으로 오해하지 않습니다.

## 무의미한 테스트

- 구현을 import하지 않고 상수끼리 비교하기
- 실제 DOM 대신 CSS 문자열 존재만 검사해 레이아웃을 보장했다고 주장하기
- Node `assert`와 여러 러너 API를 섞기
- 프로젝트 밖 임시 파일을 정식 테스트로 남기기
- 실제 Playwright 설정과 무관한 별도 실행 script를 추가하기

순수 로직과 컴포넌트는 Vitest `expect`, 실제 viewport와 브라우저 동작은 Playwright `expect`로 검증합니다.

## 타입 우회

```typescript
function parse(value: any) {
  return value as Post;
}
```

`any`, 광범위한 type assertion, 무조건적인 non-null assertion은 입력 오류를 숨깁니다. `unknown`에서 타입 가드나 Zod 검증으로 좁힙니다.

## 사용자 변경 덮어쓰기

dirty worktree에서 무관한 파일을 포맷하거나 되돌리지 않습니다. 수정 전후 `git status`와 범위별 diff를 확인하고 요청한 파일만 변경합니다.
