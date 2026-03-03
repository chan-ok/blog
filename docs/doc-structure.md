# 문서 구조 및 기준점

## 개요

이 프로젝트의 문서는 역할별로 기준점이 명확히 구분됩니다.

## 기준점

| 폴더/경로 | 역할 | 설명 |
|-----------|------|------|
| **docs/** | 일반 문서 | 프로젝트 개발 가이드, 아키텍처, 테스팅, Git Flow 등 |
| **.multi-agent/** | 멀티 에이전트 시스템 | tmux + opencode + beads 기반 4종 에이전트 — **절대 1번 기준점** |
| **.opencode/agent/** | 에이전트 프롬프트 | 직접 구축한 에이전트(consultant, task-manager, spec-manager, worker) 프롬프트 — **직접 구축 에이전트 기준점** |
| **.cursor/** | Cursor IDE 설정 | 플러그인 등 에디터 설정 |
| **AGENTS.md** | 에이전트 공통 지침 | beads 규칙, Landing the Plane, 멀티 에이전트 퀵스타트 |

## 멀티 에이전트 문서 위치

멀티 에이전트 시스템 관련 문서는 **.multi-agent/docs/** 에 있습니다.

| 문서 | 설명 |
|------|------|
| [multi-agent-system.md](../.multi-agent/docs/multi-agent-system.md) | 전체 아키텍처, 에이전트 역할, 통신 모델, 명세서 시스템 |
| [multi-agent-vs-claude-code.md](../.multi-agent/docs/multi-agent-vs-claude-code.md) | 상용 제품(Claude Code, Cursor 등) 비교 |
| [multi-agent-changelog.md](../.multi-agent/docs/multi-agent-changelog.md) | 구축 이력 (git 기반) |

## 참고

- [retrospective/2026-03.md](./retrospective/2026-03.md) — 2026-03 문서 구조 통일 회고
