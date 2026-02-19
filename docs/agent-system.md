> 이 문서의 상위 문서: [agents.md](./agents.md)

# 에이전트 시스템 상세

이 프로젝트는 v4 멀티 에이전트 시스템을 사용합니다. tmux 기반 경량 아키텍처로 4종 에이전트만 사용합니다.

> **상세 문서**: [architecture/multi-agent-system.md](./architecture/multi-agent-system.md)

## 아키텍처 개요

```
사람 ↔ 컨설턴트 ↔ [작업관리자 + 명세서관리자] ↔ 작업자(최대 3)
```

## v4 에이전트 (4종)

| 에이전트 | 위치 | 역할 | 주요 책임 |
|----------|------|------|-----------|
| **컨설턴트** | Pane 0 | 사람 대면, 요구사항 수집 | 요구사항 구체화, 명세서 초안 작성, 최종 보고 |
| **작업관리자** | Pane 1 | beads 태스크 관리 | 태스크 분해/할당/추적, 블로커 해결, 우선순위 관리 |
| **명세서관리자** | Pane 2 | spec 파일 검증 | 명세서 품질 게이트, FSD/보안/테스트 요구사항 검증 |
| **작업자** | Pane 3~5 | 코드/테스트 작성 | 실제 구현, Git commit, 최대 3개 동시 실행 |

## 통신 모델

**파일 기반 비동기 통신** (watchman 감지):

1. **명세서 파일** (`.multi-agent/specs/*.yaml`) — 작업 정의 및 검증
2. **beads 태스크** (`.beads/tasks.jsonl`) — 태스크 추적 및 할당
3. **상태 파일** (`.multi-agent/status/*.json`) — 에이전트 상태 공유

## beads 워크플로우

```bash
bd list              # 전체 이슈 목록
bd ready             # 블로커 없는 작업 조회
bd update <id> --claim  # 작업 시작 (원자적 할당)
bd close <id>        # 작업 완료
bd sync              # Git 동기화
```

## 시작 방법

```bash
# tmux 세션 시작 (6-pane 레이아웃)
bash scripts/start-multi-agent.sh

# watchman 트리거 설정
bash scripts/setup-watchman.sh
```

## v3 vs v4 비교

| 항목 | v3 (K8s) | v4 (tmux) |
|------|----------|-----------|
| 인프라 | K8s + NATS + PostgreSQL | tmux + watchman + beads |
| 리소스 | 고성능 하드웨어 필요 | 경량 (PC 환경 최적화) |
| 시작 시간 | 느림 (Pod 생성) | 즉시 (pane 생성) |
| 복잡도 | 높음 (클러스터 관리) | 낮음 (파일 기반) |
| 투명성 | 낮음 (로그 조회 필요) | 높음 (실시간 관찰) |
| 에이전트 수 | 9종 | 4종 |

## 마이그레이션 경로

1. **Phase 1** (완료): 디렉토리 구조, 에이전트 프롬프트 4종, opencode.json 권한 설정
2. **Phase 2** (예정): tmux 스크립트 테스트, watchman 트리거 검증
3. **Phase 3** (예정): 실제 기능 개발 시나리오 테스트 (consultant → worker 전체 플로우)
4. **Phase 4** (예정): v3 완전 대체, `.agents/agents/` 내 v3 에이전트 아카이브

→ 자세한 내용: [architecture/multi-agent-system.md](./architecture/multi-agent-system.md)

---

> **Note**: v3 에이전트 시스템 (master-orchestrator 등 9개 에이전트)은 `docs/archive/v3-agent-permissions.md`에 아카이브되었습니다.
