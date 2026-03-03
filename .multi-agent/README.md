# .multi-agent/ 시스템

tmux + opencode + beads 기반 4종 에이전트 시스템입니다.
컨설턴트, 작업관리자, 명세서관리자, 작업자(2명)가 협업하여 beads 이슈 기반 개발을 수행합니다.

## 퀵스타트

```bash
ma start      # tmux 세션 시작 및 모든 에이전트 실행
ma attach     # 실행 중인 세션에 진입
ma stop       # 세션 종료
```

`ma`가 등록되지 않았다면 `./.multi-agent/scripts/ma.sh start` 형식으로 실행하세요.

## ma 명령어

| 명령어 | 설명 |
|--------|------|
| `ma start` | tmux 세션 시작, 7개 window (monitor, consultant, task-manager, spec-manager, worker-1/2, dispatcher) |
| `ma stop` | tmux 세션 종료 |
| `ma pause` | dispatcher 일시중단 (에이전트 자동 트리거 중지) |
| `ma resume` | 일시중단 해제 |
| `ma export` | opencode 세션 대화 기록 내보내기 |
| `ma status` | state.json 기반 세션 및 beads 태스크 상태 조회 |
| `ma attach` | 실행 중인 tmux 세션에 연결 |
| `ma logs` | 오늘의 로그 파일 목록 |

## 디렉터리 구조

```
.multi-agent/
├── config.json          # dispatcher_poll_interval, agent_gap, bd_max_retry 등
├── config/
│   ├── agents.yaml      # 4종 에이전트 정의
│   └── validation-checklist.yaml
├── specs/               # spec-blog-*.yaml (tasks.beads_id ↔ beads 이슈 매핑)
├── templates/spec-template.yaml
├── scripts/
│   ├── ma.sh           # 메인 CLI
│   ├── start.sh        # tmux 7윈도우 생성
│   ├── dispatcher.sh   # beads 폴링 → state.json → tmux send-keys
│   ├── dashboard.sh    # 5-pane 모니터 (overview + 4 에이전트 pane)
│   ├── pause.sh, resume.sh, stop.sh
│   ├── export.sh, cleanup.sh, archive-spec.sh
└── cache/state.json    # dispatcher가 갱신, dashboard/ma status가 읽기 전용
```

## 요구사항

- **tmux** — `brew install tmux`
- **opencode** — [opencode.ai](https://opencode.ai)
- **beads (bd)** — [jamsocket/beads](https://github.com/jamsocket/beads)
- **jq** — state.json 파싱용 (선택, 없으면 대시보드 일부 기능 제한)

## 상세 문서

- [docs/multi-agent-system.md](./docs/multi-agent-system.md) — 전체 아키텍처, 에이전트 역할, 통신 모델, 명세서 시스템
- [docs/multi-agent-vs-claude-code.md](./docs/multi-agent-vs-claude-code.md) — 상용 제품(Claude Code, Cursor 등) 비교
- [docs/multi-agent-changelog.md](./docs/multi-agent-changelog.md) — 구축 이력 (git 기반)
