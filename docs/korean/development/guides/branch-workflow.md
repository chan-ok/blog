# Git 브랜치 기반 개발 워크플로우

## 🎯 목적

이 문서는 팀 협업과 코드 품질 유지를 위한 Git 브랜치 기반 개발 프로세스를 정의합니다.

## 🚨 핵심 원칙

### 1. main 브랜치 보호
- **main 브랜치에서 직접 작업 금지**
- **main 브랜치는 항상 배포 가능한 상태 유지**
- **모든 변경사항은 Pull Request를 통해서만 병합**

### 2. 기능별 브랜치 분리
- **각 기능, 버그 수정, 문서 작업마다 별도 브랜치 생성**
- **브랜치명은 작업 내용을 명확히 표현**
- **작은 단위로 작업을 나누어 빠른 피드백 사이클 유지**

### 3. 코드 리뷰 필수
- **모든 코드 변경사항은 리뷰 후 병합**
- **자동화된 테스트 통과 필수**
- **문서 업데이트 동시 진행**

## 📋 브랜치 전략

### 브랜치 유형

#### 1. main 브랜치
- **용도**: 프로덕션 배포용 메인 브랜치
- **특징**: 항상 안정적이고 배포 가능한 상태
- **보호**: 직접 커밋 금지, PR을 통해서만 병합

#### 2. feature 브랜치
- **용도**: 새로운 기능 개발
- **네이밍**: `feature/기능명-설명`
- **생명주기**: 기능 완성 후 main으로 병합, 삭제

#### 3. fix 브랜치
- **용도**: 버그 수정
- **네이밍**: `fix/버그명-설명`
- **생명주기**: 수정 완료 후 main으로 병합, 삭제

#### 4. docs 브랜치
- **용도**: 문서 작업
- **네이밍**: `docs/문서명-설명`
- **생명주기**: 문서 완성 후 main으로 병합, 삭제

#### 5. refactor 브랜치
- **용도**: 코드 리팩토링
- **네이밍**: `refactor/대상-설명`
- **생명주기**: 리팩토링 완료 후 main으로 병합, 삭제

#### 6. test 브랜치
- **용도**: 테스트 코드 추가/개선
- **네이밍**: `test/테스트대상-설명`
- **생명주기**: 테스트 완성 후 main으로 병합, 삭제

## 🔧 브랜치 네이밍 규칙

### 패턴
```
{타입}/{간단한-설명}
```

### 규칙
- **영어 소문자 사용**
- **단어 구분은 하이픈(-) 사용**
- **동사로 시작하는 명확한 설명**
- **최대 50자 이내**

### 좋은 브랜치명 예시
```bash
# 기능 개발
feature/user-authentication
feature/blog-post-editor
feature/search-functionality
feature/admin-dashboard
feature/email-notification

# 버그 수정
fix/header-mobile-layout
fix/markdown-rendering
fix/login-form-validation
fix/image-upload-error

# 문서 작업
docs/api-documentation
docs/setup-guide
docs/contribution-guidelines
docs/architecture-overview

# 리팩토링
refactor/shared-components
refactor/api-service-layer
refactor/authentication-logic

# 테스트
test/user-api-endpoints
test/component-unit-tests
test/integration-scenarios
```

### 피해야 할 브랜치명
```bash
# ❌ 나쁜 예시
feature/fix                    # 너무 모호함
user                          # 타입 없음
feature/사용자인증             # 한글 사용
feature/UserAuthentication    # 카멜케이스 사용
feature/user_authentication   # 언더스코어 사용
feature/this-is-a-very-long-branch-name-that-explains-everything # 너무 길음
```

## 🌟 표준 워크플로우

### 1단계: 작업 시작
```bash
# 1. main 브랜치로 이동
git checkout main

# 2. 최신 변경사항 받기
git pull origin main

# 3. 새 기능 브랜치 생성
git checkout -b feature/blog-search

# 4. 브랜치 확인
git branch  # 현재 브랜치 확인
```

### 2단계: 개발 진행
```bash
# 1. 파일 수정 후 변경사항 스테이징
git add src/features/search/

# 2. 의미있는 단위로 커밋
git commit -m "feat: 검색 입력 컴포넌트 기본 구조 구현"

# 3. 추가 개발 진행
git add src/features/search/hooks/
git commit -m "feat: 검색 API 훅 구현"

# 4. 테스트 추가
git add src/features/search/__tests__/
git commit -m "test: 검색 기능 단위 테스트 추가"
```

### 3단계: 정기적 동기화
```bash
# 1. main 브랜치 최신 변경사항 확인
git checkout main
git pull origin main

# 2. 작업 브랜치로 돌아가서 병합
git checkout feature/blog-search
git merge main

# 3. 충돌 해결 (필요시)
# 충돌 파일 수정 후
git add .
git commit -m "resolve: main 브랜치 변경사항 병합"
```

### 4단계: 최종 검증
```bash
# 1. 빌드 테스트
pnpm build

# 2. 단위 테스트 실행
pnpm test

# 3. 린트 검사 (설정된 경우)
pnpm lint

# 4. 타입 체크
pnpm type-check
```

### 5단계: Pull Request 생성
```bash
# 1. 원격 저장소에 브랜치 푸시
git push origin feature/blog-search

# 2. GitHub에서 Pull Request 생성
# - 웹 브라우저에서 GitHub 저장소 접속
# - "Compare & pull request" 버튼 클릭
# - PR 템플릿에 따라 내용 작성
```

### 6단계: 코드 리뷰 및 병합
1. **자체 검토**: PR 생성 후 본인이 먼저 전체 변경사항 검토
2. **동료 리뷰**: 팀원들의 코드 리뷰 요청
3. **피드백 반영**: 리뷰 의견에 따른 코드 수정
4. **최종 승인**: 모든 검토 완료 후 승인
5. **병합**: Squash and merge 또는 Merge commit
6. **브랜치 정리**: 병합 후 로컬/원격 브랜치 삭제

## 📝 Pull Request 가이드

### PR 제목 규칙
```
{타입}: {간단한 설명}

예시:
feat: 블로그 검색 기능 구현
fix: 모바일 헤더 레이아웃 버그 수정
docs: API 문서 업데이트
refactor: 공통 컴포넌트 구조 개선
```

### PR 설명 템플릿
```markdown
## 📝 변경사항 요약
- 구현한 기능이나 수정한 내용을 간단히 설명

## 🎯 작업 내용
- [ ] 기능 A 구현
- [ ] 컴포넌트 B 추가
- [ ] 테스트 C 작성
- [ ] 문서 D 업데이트

## 🧪 테스트 방법
1. 개발 서버 실행: `pnpm dev`
2. 특정 페이지 접속: `/admin/write`
3. 기능 동작 확인: 검색어 입력 후 엔터

## 📸 스크린샷 (UI 변경 시)
- 변경 전/후 스크린샷 첨부

## 🔗 관련 이슈
- Closes #123
- Related to #456

## ✅ 체크리스트
- [ ] 빌드 에러 없음 (`pnpm build`)
- [ ] 테스트 통과 (`pnpm test`)
- [ ] 코드 자체 검토 완료
- [ ] 관련 문서 업데이트
```

## 🛠️ 브랜치 관리 명령어

### 브랜치 생성 및 전환
```bash
# 새 브랜치 생성하고 전환
git checkout -b feature/new-feature

# 기존 브랜치로 전환
git checkout feature/existing-feature

# 브랜치 목록 확인
git branch                    # 로컬 브랜치
git branch -r                 # 원격 브랜치
git branch -a                 # 모든 브랜치
```

### 브랜치 동기화
```bash
# 원격 브랜치 정보 업데이트
git fetch origin

# main 브랜치 최신 상태로 업데이트
git checkout main
git pull origin main

# 현재 브랜치에 main 변경사항 반영
git checkout feature/my-feature
git merge main

# 또는 rebase 사용 (고급)
git rebase main
```

### 브랜치 정리
```bash
# 로컬 브랜치 삭제
git branch -d feature/completed-feature

# 강제 삭제 (병합되지 않은 브랜치)
git branch -D feature/abandoned-feature

# 원격 브랜치 삭제
git push origin --delete feature/completed-feature

# 더 이상 존재하지 않는 원격 브랜치 참조 정리
git remote prune origin
```

## 🚨 문제 상황별 대처법

### 1. 잘못된 브랜치에 커밋한 경우
```bash
# 마지막 커밋을 다른 브랜치로 이동
git checkout correct-branch
git cherry-pick wrong-branch
git checkout wrong-branch
git reset --hard HEAD~1
```

### 2. main 브랜치에 실수로 커밋한 경우
```bash
# 1. 새 브랜치 생성 (현재 상태 보존)
git checkout -b feature/rescue-commits

# 2. main 브랜치를 이전 상태로 되돌리기
git checkout main
git reset --hard HEAD~1  # 마지막 커밋 취소

# 3. 새 브랜치에서 작업 계속
git checkout feature/rescue-commits
```

### 3. 충돌 해결
```bash
# 1. 병합 시 충돌 발생
git merge main
# Auto-merging failed...

# 2. 충돌 파일 확인
git status

# 3. 충돌 해결 후
git add .
git commit -m "resolve: main 브랜치 변경사항 병합"
```

### 4. 브랜치명 변경
```bash
# 로컬 브랜치명 변경
git branch -m old-branch-name new-branch-name

# 원격 브랜치명 변경
git push origin :old-branch-name
git push origin new-branch-name
git push origin -u new-branch-name
```

## 📊 브랜치 전략 비교

### 현재 전략: GitHub Flow
```
main → feature → PR → main
```

**장점:**
- 단순하고 이해하기 쉬움
- 빠른 배포 가능
- 작은 팀에 적합

**단점:**
- 릴리즈 관리 부족
- 핫픽스 처리 복잡

### 대안: Git Flow (대규모 프로젝트용)
```
main → develop → feature → develop → release → main
                     ↓
                  hotfix → main
```

**현재 프로젝트에는 과도하게 복잡하므로 GitHub Flow 유지**

## 🎯 모범 사례

### DO (권장사항)
- ✅ 작업 시작 전 항상 main에서 최신 코드 받기
- ✅ 의미있는 단위로 자주 커밋하기
- ✅ 명확하고 일관된 브랜치명 사용
- ✅ PR 생성 전 자체 코드 검토하기
- ✅ 테스트와 빌드 확인 후 PR 생성
- ✅ 병합 후 브랜치 즉시 삭제하기

### DON'T (금지사항)
- ❌ main 브랜치에서 직접 작업하기
- ❌ 너무 큰 단위의 작업을 한 번에 커밋
- ❌ 모호하거나 일관성 없는 브랜치명
- ❌ 테스트 없이 PR 생성하기
- ❌ 병합된 브랜치 방치하기
- ❌ 충돌 해결 없이 강제 푸시하기

## 🔍 자주 묻는 질문

### Q: 브랜치를 언제 만들어야 하나요?
A: 새로운 작업(기능, 버그 수정, 문서)을 시작하기 전에 항상 새 브랜치를 만드세요.

### Q: 브랜치를 언제 삭제해야 하나요?
A: PR이 병합된 즉시 해당 브랜치를 삭제하세요. GitHub에서 자동 삭제 설정도 가능합니다.

### Q: 충돌이 발생하면 어떻게 하나요?
A: 충돌 파일을 열어서 수동으로 해결한 후, `git add .`와 `git commit`으로 해결을 완료하세요.

### Q: main 브랜치에 실수로 커밋했어요.
A: 즉시 새 브랜치를 만들어 커밋을 옮기고, main을 이전 상태로 되돌리세요.

### Q: 브랜치가 너무 많아졌어요.
A: 정기적으로 병합된 브랜치를 정리하고, `git remote prune origin`으로 오래된 참조를 정리하세요.

---

이 워크플로우를 따라 안전하고 효율적인 협업 개발을 진행하세요! 🚀