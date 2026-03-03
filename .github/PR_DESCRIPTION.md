# develop → main PR

## 📋 요약

tmux + opencode + beads 기반 멀티 에이전트 시스템 v4.0 도입 및 문서 구조 통일

## 🎯 변경 사항

### 멀티 에이전트 시스템 (Phase 1 & 2)

- tmux 기반 4종 에이전트: consultant, task-manager, spec-manager, worker
- `.multi-agent/` 디렉토리 구조 및 프롬프트 4종
- tmux pane 생성 로직 개선
- beads 통합 및 AGENTS.md 업데이트

### 문서

- v3 K8s 기반 아키텍처 설계 문서 7개 아카이브
- tmux 기반 멀티 에이전트 v4.0.0 아키텍처 설계
- 문서 구조 통일 및 `.multi-agent/`로 이관

## 📝 포함된 커밋

- docs: v3 K8s 기반 아키텍처 설계 문서 7개 아카이브
- docs: tmux 기반 멀티 에이전트 시스템 v4.0.0 아키텍처 설계
- chore: beads 통합 및 git-manager TODO 추가
- feat: 멀티 에이전트 Phase 1 - 디렉토리 구조, 프롬프트 4종, 권한 설정 (#66)
- fix(multi-agent): tmux pane 생성 로직 개선 및 Phase 2 완료 (#68)
- docs: 문서 구조 통일 및 멀티 에이전트 문서 .multi-agent/로 이관 (#70)

## ✅ 검증

- [ ] `ma start` / `ma attach` / `ma stop` 정상 동작
- [ ] `bd ready` 등 beads 명령 정상 동작
- [ ] AGENTS.md 규칙 준수
