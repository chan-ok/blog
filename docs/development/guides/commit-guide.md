# Git 커밋 가이드

## 📝 Commitlint 규칙

이 프로젝트는 **Conventional Commits** 스펙을 따르는 commitlint를 사용합니다.

### 🎯 기본 규칙

#### 커밋 메시지 형식
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

#### Type 종류

| Type | 설명 | 예시 |
|------|------|------|
| **feat** | 새로운 기능 추가 | `feat: 사용자 로그인 기능 추가` |
| **fix** | 버그 수정 | `fix: 로그인 시 비밀번호 검증 오류 수정` |
| **docs** | 문서 변경 | `docs: API 문서 업데이트` |
| **style** | 코드 포맷팅, 세미콜론 등 | `style: 코드 스타일 정리` |
| **refactor** | 코드 리팩토링 | `refactor: 사용자 인증 로직 개선` |
| **perf** | 성능 개선 | `perf: 이미지 로딩 최적화` |
| **test** | 테스트 추가/수정 | `test: 로그인 컴포넌트 테스트 추가` |
| **chore** | 빌드, 패키지 관리 등 | `chore: 의존성 업데이트` |
| **ci** | CI/CD 관련 변경 | `ci: GitHub Actions 워크플로우 수정` |
| **build** | 빌드 시스템 변경 | `build: Vite 설정 업데이트` |
| **revert** | 이전 커밋 되돌리기 | `revert: feat: 사용자 기능 롤백` |

#### Scope (선택사항)
```
feat(auth): 로그인 기능 구현
fix(editor): 마크다운 렌더링 버그 수정
docs(architecture): 폴더 구조 문서 업데이트
test(components): 공통 컴포넌트 테스트 추가
```

**주요 Scope들:**
- `auth` - 인증 관련
- `editor` - 글 작성/편집 관련
- `components` - UI 컴포넌트
- `api` - API 관련
- `docs` - 문서 관련
- `config` - 설정 관련

### ✅ 좋은 커밋 메시지 예시

#### 1. 기본 형태
```bash
feat: 블로그 글 작성 기능 구현
fix: 로그인 폼 검증 로직 수정
docs: 신입 개발자 온보딩 가이드 추가
```

#### 2. Scope 포함
```bash
feat(auth): 자동 로그인 유지 기능 추가
fix(editor): 마크다운 미리보기 렌더링 오류 수정
refactor(components): PostCard 컴포넌트 성능 최적화
```

#### 3. Body와 Footer 포함
```bash
feat: 다국어 지원 기능 추가

- 한국어/영어 언어 전환 기능
- i18n 라이브러리 도입
- 모든 UI 텍스트 다국화

Closes #123
Breaking change: 기존 텍스트 하드코딩 방식 변경 필요
```

### ❌ 피해야 할 커밋 메시지

```bash
# 너무 짧고 불명확
fix: bug

# 한국어 type 사용 (금지)
기능: 로그인 추가

# 대문자 시작 (지양)
Fix: Login Bug

# 온점 사용 (지양)
feat: Add login feature.

# 과거형 사용 (지양)
feat: Added login feature
```

### 🔧 프로젝트별 특수 규칙

#### 1. 한국어 설명 권장
```bash
# ✅ 권장 - type은 영어, 설명은 한국어
feat: 사용자 인증 시스템 구현
fix: 마크다운 렌더링 버그 수정
docs: 문서 구조 재정리

# ❌ 지양 - 전체 영어 (한국어 프로젝트이므로)
feat: implement user authentication system
```

#### 2. 상세한 설명 권장
```bash
# ✅ 상세한 설명
feat: 블로그 글 자동 저장 기능 구현

- 3초마다 자동으로 임시 저장
- 네트워크 오류 시 로컬 스토리지 백업
- 사용자에게 저장 상태 실시간 표시

# ❌ 너무 간단
feat: 자동저장
```

#### 3. Breaking Change 명시
```bash
feat!: 새로운 API 스키마 적용

BREAKING CHANGE: 기존 블로그 글 API 엔드포인트 변경
- `/api/posts` → `/api/v2/posts`
- 응답 데이터 구조 변경
```

### 🤖 자동 커밋 서명

모든 커밋에는 자동으로 Claude Code 서명이 추가됩니다:

```
🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
```

### 📋 커밋 전 체크리스트

커밋하기 전에 다음을 확인하세요:

- [ ] **Type 확인**: 올바른 conventional type 사용
- [ ] **설명 명확**: 변경 내용이 명확하게 전달되는가
- [ ] **한국어 사용**: 설명은 한국어로 작성
- [ ] **테스트 통과**: 관련 테스트가 모두 통과하는가
- [ ] **문서 업데이트**: 필요시 관련 문서도 함께 업데이트

### 🔍 Commitlint 검증

커밋 시 자동으로 검증됩니다:

```bash
# ✅ 통과하는 커밋
git commit -m "feat: 사용자 프로필 수정 기능 추가"

# ❌ 실패하는 커밋
git commit -m "add profile feature"  # type 없음
git commit -m "기능: 프로필 추가"    # 한국어 type
```

### 💡 팁

1. **원자적 커밋**: 하나의 커밋은 하나의 논리적 변경사항만
2. **현재형 사용**: "추가한다", "수정한다" 형태로
3. **Why보다 What**: 무엇을 변경했는지 명확히
4. **이슈 번호 연결**: `Closes #123`, `Fixes #456` 활용

---

> 💡 **참고**: 이 가이드를 따르면 commitlint 검증을 통과하고, 프로젝트 히스토리 관리가 용이해집니다.