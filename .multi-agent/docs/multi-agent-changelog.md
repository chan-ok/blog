# 멀티 에이전트 시스템 구축 이력

`.multi-agent/` 디렉터리 및 관련 스크립트의 git 변경 이력을 정리합니다.
추후 기록·검토용으로 유지합니다.

## 변경 이력 (chronological)

| 날짜 | 커밋 | 설명 |
|------|------|------|
| 2026-02-20 | e27ffdf | **Phase 1**: 디렉토리 구조, 프롬프트 4종(consultant, task-manager, spec-manager, worker), 권한 설정 |
| 2026-02-22 | 2c28caf | **Phase 2~3**: dashboard v2.0.0, config 통합, pause/resume, 에이전트 프롬프트 개선 |
| 2026-02-22 | 4bea6a9 | .gitignore에 queue/ 디렉토리 추가 |
| 2026-02-22 | f27e90b | 파일 기반 메시지 큐 헬퍼 mq.sh 신규 구현 |
| 2026-02-22 | 3f9a293 | overview 루프 1회 후 종료 버그 수정 |
| 2026-02-22 | 5058f8a | **beads LOCK 해소**: bd list를 state.json 캐시로 교체, dashboard/ma status는 state.json만 읽음 |
| 2026-02-22 | dbe0dda | **파일 큐 제거**: dispatcher를 beads 직접 폴링으로 전환, mq.sh/queue/ 불필요 |
| 2026-02-22 | 530b2e3 | start.sh 세션 시작 시간 파일 기록 (/tmp/multi-agent-session-start) |
| 2026-02-22 | 5e9b597 | dashboard overview Done 섹션을 ACTIVITY FEED로 대체 |
| 2026-02-22 | c33342c | dashboard overview 헤더에 git 브랜치, 경과시간, [s: spec선택] 키 힌트 추가 |
| 2026-02-23 | 42568d2 | overview pane 시작 시 블로킹 문제 해결 |

## 주요 전환점

1. **Phase 1 (e27ffdf)** — 기본 구조 확립
   - tmux 기반 4종 에이전트
   - 디렉터리 구조, 권한 설정

2. **Phase 2~3 (2c28caf)** — dashboard, pause/resume
   - dashboard v2.0.0
   - config.json 통합

3. **파일 큐 → beads 폴링 (5058f8a, dbe0dda)** — beads LOCK 해소
   - state.json 캐시 도입
   - dispatcher 단일 bd 호출
   - queue/ 디렉토리 제거

4. **dashboard 개선 (5e9b597, c33342c, 42568d2)** — ACTIVITY FEED, 헤더 정보, 블로킹 수정

## 참고

- [multi-agent-system.md](./multi-agent-system.md) — 현재 아키텍처
- [README.md](../README.md) — 퀵스타트 및 ma 명령어
