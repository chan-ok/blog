# Git Commit Guide

## 📝 Commitlint Rules

This project uses commitlint following the **Conventional Commits** specification.

### 🎯 Basic Rules

#### Commit Message Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

#### Type Categories

| Type | Description | Example |
|------|-------------|---------|
| **feat** | New feature | `feat: add user login functionality` |
| **fix** | Bug fix | `fix: resolve password validation error in login` |
| **docs** | Documentation changes | `docs: update API documentation` |
| **style** | Code formatting, semicolons, etc. | `style: clean up code formatting` |
| **refactor** | Code refactoring | `refactor: improve user authentication logic` |
| **perf** | Performance improvements | `perf: optimize image loading` |
| **test** | Add/modify tests | `test: add login component tests` |
| **chore** | Build, package management, etc. | `chore: update dependencies` |
| **ci** | CI/CD related changes | `ci: modify GitHub Actions workflow` |
| **build** | Build system changes | `build: update Vite configuration` |
| **revert** | Revert previous commit | `revert: feat: rollback user feature` |

#### Scope (Optional)
```
feat(auth): implement login functionality
fix(editor): resolve markdown rendering bug
docs(architecture): update folder structure documentation
test(components): add common component tests
```

**Main Scopes:**
- `auth` - Authentication related
- `editor` - Writing/editing related
- `components` - UI components
- `api` - API related
- `docs` - Documentation related
- `config` - Configuration related

### ✅ Good Commit Message Examples

#### 1. Basic Format
```bash
feat: implement blog post creation feature
fix: resolve login form validation logic
docs: add new developer onboarding guide
```

#### 2. With Scope
```bash
feat(auth): add automatic login persistence
fix(editor): resolve markdown preview rendering error
refactor(components): optimize PostCard component performance
```

#### 3. With Body and Footer
```bash
feat: add multi-language support

- Korean/English language switching feature
- Introduce i18n library
- Internationalize all UI text

Closes #123
Breaking change: Existing text hardcoding approach needs to be changed
```

### ❌ Commit Messages to Avoid

```bash
# Too short and unclear
fix: bug

# Using Korean type (prohibited)
기능: add login

# Starting with uppercase (discouraged)
Fix: Login Bug

# Using periods (discouraged)
feat: Add login feature.

# Using past tense (discouraged)
feat: Added login feature
```

### 🔧 Project-Specific Rules

#### 1. Korean Description Recommended
```bash
# ✅ Recommended - English type, Korean description
feat: 사용자 인증 시스템 구현
fix: 마크다운 렌더링 버그 수정
docs: 문서 구조 재정리

# ❌ Discouraged - All English (since this is a Korean project)
feat: implement user authentication system
```

#### 2. Detailed Description Recommended
```bash
# ✅ Detailed description
feat: 블로그 글 자동 저장 기능 구현

- 3초마다 자동으로 임시 저장
- 네트워크 오류 시 로컬 스토리지 백업
- 사용자에게 저장 상태 실시간 표시

# ❌ Too simple
feat: 자동저장
```

#### 3. Breaking Change Specification
```bash
feat!: 새로운 API 스키마 적용

BREAKING CHANGE: 기존 블로그 글 API 엔드포인트 변경
- `/api/posts` → `/api/v2/posts`
- 응답 데이터 구조 변경
```

### 🤖 Automatic Commit Signature

All commits automatically include Claude Code signature:

```
🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
```

### 📋 Pre-Commit Checklist

Check the following before committing:

- [ ] **Type Check**: Use correct conventional type
- [ ] **Clear Description**: Is the change clearly communicated?
- [ ] **Korean Usage**: Description written in Korean
- [ ] **Tests Pass**: Do all related tests pass?
- [ ] **Documentation Update**: Update related documentation if necessary

### 🔍 Commitlint Validation

Automatically validated on commit:

```bash
# ✅ Passing commit
git commit -m "feat: 사용자 프로필 수정 기능 추가"

# ❌ Failing commit
git commit -m "add profile feature"  # No type
git commit -m "기능: 프로필 추가"    # Korean type
```

### 💡 Tips

1. **Atomic Commits**: One commit should contain only one logical change
2. **Present Tense**: Use forms like "adds", "fixes"
3. **What over Why**: Clearly state what was changed
4. **Link Issue Numbers**: Use `Closes #123`, `Fixes #456`

---

> 💡 **Note**: Following this guide will pass commitlint validation and make project history management easier.