# 📋 작업 투두리스트

> 프로젝트의 진행 중인 작업과 계획 문서를 관리합니다.

---

## 📂 파일 구조

```
docs/todo/
├── README.md                      # 이 파일 (인덱스)
├── P0-migration-checklist.md      # 마이그레이션 체크리스트 (최우선)
├── P1-migration-plan.md           # 마이그레이션 상세 계획 (참조용)
├── archive/                       # 완료된 작업 보관
│   └── 2026-02-07-migration-complete.md (예시)
└── future/                        # 미래 계획 보관
    └── P2-ui-redesign-plan.md (예시)
```

---

## 🔢 우선순위 정의

| Priority | 의미      | 사용 시나리오                             | 예시                        |
| -------- | --------- | ----------------------------------------- | --------------------------- |
| **P0**   | 최우선    | 매일 확인하며 진행해야 할 작업 체크리스트 | `P0-migration-checklist.md` |
| **P1**   | 참조용    | 구현 방법을 확인할 때 참조하는 상세 문서  | `P1-migration-plan.md`      |
| **P2**   | 선택/미래 | 현재 진행 중인 작업 완료 후 고려할 계획   | `P2-ui-redesign-plan.md`    |

---

## 📋 현재 진행 중인 작업

| Priority | 파일명                      | 설명                                              | 상태       | 시작일     |
| -------- | --------------------------- | ------------------------------------------------- | ---------- | ---------- |
| **P0**   | `P0-migration-checklist.md` | Next.js → TanStack Router 마이그레이션 체크리스트 | 🔄 진행 중 | 2026-02-07 |
| **P1**   | `P1-migration-plan.md`      | 마이그레이션 상세 기술 문서 및 구현 가이드        | 📝 참조용  | 2026-02-07 |

---

## 📖 사용 가이드

### P0 (최우선): 실행 체크리스트

- **목적**: 실제 작업을 진행하며 항목을 체크합니다
- **업데이트**: 매일 확인하며 체크박스 업데이트
- **완료 기준**: 모든 체크박스가 완료되면 `archive/`로 이동

### P1 (참조용): 상세 기술 문서

- **목적**: 구현 방법이 불확실할 때 참조합니다
- **사용 시점**:
  - 기술 스택 선택 고민
  - 구현 예시가 필요할 때
  - 의사결정 배경을 이해할 때

### P2 (선택/미래): 미래 계획

- **목적**: 현재 작업 완료 후 고려할 아이디어
- **위치**: `future/` 폴더에 보관
- **예시**: UI 리디자인, 성능 최적화, 새 기능 추가

---

## ✅ 작업 완료 프로세스

작업이 완료되면:

1. **체크리스트 확인**: 모든 항목이 체크되었는지 확인
2. **Archive로 이동**:
   ```bash
   # 날짜 기반 파일명으로 변경
   mv P0-migration-checklist.md archive/2026-02-07-migration-checklist.md
   mv P1-migration-plan.md archive/2026-02-07-migration-plan.md
   ```
3. **project-log.md 업데이트**: 완료 내용을 프로젝트 로그에 기록
4. **이 README.md 업데이트**: 현재 진행 중인 작업 테이블에서 제거

---

## 🗂️ Archive 폴더 관리

완료된 작업은 `archive/` 폴더에 날짜 기반 파일명으로 보관합니다:

```
archive/
├── 2026-02-07-migration-checklist.md
├── 2026-02-07-migration-plan.md
└── 2026-03-15-ui-redesign-complete.md
```

---

## 🚀 Future 폴더 관리

미래 계획은 `future/` 폴더에 Priority 레벨과 함께 보관합니다:

```
future/
├── P2-ui-redesign-plan.md
├── P3-search-feature-plan.md
└── P3-analytics-integration-plan.md
```

---

## 📚 관련 문서

- [dashboard.md](../dashboard.md) - 마이그레이션 진행 상황 대시보드 📊
- [agents.md](../agents.md) - AI 코딩 에이전트 가이드
- [architecture.md](../architecture.md) - 프로젝트 아키텍처
- [development.md](../development.md) - 개발 환경 설정
- [project-log.md](../project-log.md) - 프로젝트 이력 로그
