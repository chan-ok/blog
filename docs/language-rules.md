> 이 문서의 상위 문서: [agents.md](./agents.md)

# 언어 및 커밋 규칙

## 한글 사용 ⭐

### 지시사항

- **문서 (.md)**: 한국어 필수
- **코드 주석**: 한국어 강력 권장
- **커밋 메시지**: 한국어 필수
- **에러 메시지**: 사용자 대면 메시지는 i18n

## 영어 사용

### 지시사항

- **변수/함수명**: 영어 (camelCase, PascalCase)
- **타입명**: 영어 (PascalCase)

## 예제

```typescript
// ✅ Good - 한국어 주석, 영어 변수명
// 사용자 인증 상태 확인
const isAuthenticated = checkAuth();

// 포스트 목록을 날짜순으로 정렬
const sortedPosts = posts.sort(
  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
);

// ❌ Bad - 영어 주석
// Check user authentication status
const isAuthenticated = checkAuth();
```

## 커밋 메시지 예제

```bash
# ✅ Good - 한국어 커밋 메시지
feat(button): 다크 모드 스타일 추가

- primary variant 색상 적용
- focus-visible 링 개선

# ❌ Bad - 영어 커밋 메시지
feat(button): add dark mode styles
```

## 커밋 규칙

### 형식

```
type(scope): 한국어 제목

- 한국어 본문
- 변경 사항 설명
```

### Type

| Type       | 설명             | 예시                                  |
| ---------- | ---------------- | ------------------------------------- |
| `feat`     | 새 기능          | `feat(post): 태그 필터링 추가`        |
| `fix`      | 버그 수정        | `fix(contact): 이메일 검증 오류 수정` |
| `refactor` | 리팩토링         | `refactor(header): 네비게이션 분리`   |
| `test`     | 테스트 추가/수정 | `test(button): 클릭 테스트 추가`      |
| `docs`     | 문서 수정        | `docs(readme): 설치 가이드 업데이트`  |
| `style`    | 코드 스타일      | `style: Prettier 포맷팅 적용`         |
| `chore`    | 빌드/설정 변경   | `chore(deps): React 19.2.3 업데이트`  |

### Scope 예시

- 기능/컴포넌트: `button`, `post`, `contact`, `header`
- 의존성: `deps`
- 설정: `config`, `vitest`, `storybook`
