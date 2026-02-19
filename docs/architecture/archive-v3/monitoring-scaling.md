---
title: "실시간 감지 + 오토스케일링 상세 설계"
version: "3.0.0"
date: "2026-02-19"
status: "완료"
related:
  - multi-agent-system.md
  - async-communication.md
  - agent-roles.md
  - k8s-isolation.md
  - spec-system.md
---

# 실시간 감지 + 오토스케일링 상세 설계

## 📋 목차

- [1. 개요 및 설계 원칙](#1-개요-및-설계-원칙)
- [2. Meta Watchman 파일 감지 시스템](#2-meta-watchman-파일-감지-시스템)
- [3. KEDA 오토스케일링 전략](#3-keda-오토스케일링-전략)
- [4. 에이전트 하트비트 및 상태 관리](#4-에이전트-하트비트-및-상태-관리)
- [5. 장애 감지 및 자동 복구](#5-장애-감지-및-자동-복구)
- [6. 스케일링 정책 및 비용 최적화](#6-스케일링-정책-및-비용-최적화)
- [7. OpenCode Plugin 통합 (NATS 핑 브리지)](#7-opencode-plugin-통합-nats-핑-브리지)
- [8. 모니터링 경량화 전략](#8-모니터링-경량화-전략)
- [9. 성능 벤치마크 및 목표](#9-성능-벤치마크-및-목표)
- [10. 운영 가이드](#10-운영-가이드)
- [11. 버전 정보 및 변경 이력](#11-버전-정보-및-변경-이력)

---

## 1. 개요 및 설계 원칙

### 1.1 문서 목적 및 범위

이 문서는 **Meta Watchman 기반 파일 감지 시스템**과 **KEDA 기반 오토스케일링 메커니즘**의 상세 구현 지침을 제공합니다. v3.0.0에서는 **NATS Core 기반 알림 핑 시스템**과 **spec 파일 중심 통신 모델**을 사용합니다.

**범위**:
- Watchman 파일 감지 아키텍처 및 설정 (spec 파일 중심)
- NATS 알림 핑 발행 및 구독
- KEDA NATS ScaledObject 설정 (Worker 0→3)
- 에이전트 하트비트 프로토콜 및 상태 머신
- 장애 감지 및 자동 복구 메커니즘
- Cold Start 최적화 및 비용 효율화
- 모니터링 경량화 (kubectl logs + k9s + NATS 내장 모니터링)

**제외 사항**:
- NATS/PostgreSQL 내부 설계 → `async-communication.md` 참조
- Pod 격리 및 SecurityContext → `k8s-isolation.md` 참조
- 에이전트 역할 상세 → `agent-roles.md` 참조
- 명세서 시스템 상세 → `spec-system.md` 참조

**v3.0.0 주요 변경사항**:
1. **Redis → NATS**: 100~300MB → ~50MB, 알림 핑만 전달
2. **spec 파일 중심**: 상세 정보는 PVC의 spec 파일에 저장
3. **Worker 축소**: 최대 6개 → 최대 3개 (리소스 예산 준수)
4. **모니터링 경량화**: Prometheus/Loki/Jaeger 제거 → kubectl/k9s/NATS 내장

### 1.2 다른 설계 문서와의 관계

```mermaid
graph TD
    MAS[multi-agent-system.md<br/>전체 시스템 아키텍처] --> MS[monitoring-scaling.md<br/>실시간 감지 + 오토스케일링]
    AC[async-communication.md<br/>Redis 통신] --> MS
    AR[agent-roles.md<br/>에이전트 역할] --> MS
    K8S[k8s-isolation.md<br/>Pod 격리] --> MS
    
    MS --> W[Watchman 파일 감지]
    MS --> K[KEDA 오토스케일링]
    MS --> HB[하트비트 관리]
    MS --> FR[장애 복구]
    
    K8S -.참조: 모니터링 인프라.-> MS
    
    style MS fill:#4CAF50,color:#fff
    style MAS fill:#2196F3,color:#fff
    style AC fill:#FF9800,color:#fff
    style AR fill:#9C27B0,color:#fff
    style K8S fill:#F44336,color:#fff
```

**의존 관계**:
- `multi-agent-system.md`: 파일 감지 및 스케일링의 전체 맥락 제공
- `async-communication.md`: NATS 알림 핑 프로토콜 정의 (Watchman 이벤트 발행)
- `agent-roles.md`: 프로젝트 리드의 Worker 할당 전략, Worker 하트비트 설정
- `spec-system.md`: 명세서 파일 중심 통신 모델 (상세 정보 저장 위치)
- `k8s-isolation.md`: Pod 격리 및 NetworkPolicy (섹션 8 모니터링 경량화 참고)

**차별점**:
- `k8s-isolation.md`는 "Pod 격리 관점의 보안"에 초점 (NetworkPolicy, SecurityContext)
- 이 문서는 "실시간 감지 + 오토스케일링 메커니즘"에 초점 (Watchman, KEDA, 하트비트, 장애 복구, 스케일링 정책, 경량 모니터링)

### 1.3 핵심 설계 원칙

#### 1.3.1 이벤트 기반 반응성 (Event-Driven Reactivity)

**정의**: 폴링(Polling) 대신 이벤트(Event)로 파일 변경을 즉시 감지하고 반응합니다.

**적용 사례**:
- 명세서 파일(`specs/active/*.yaml`) 변경 → Watchman 감지 → NATS 알림 핑 발행 → 에이전트가 PVC에서 spec 읽기
- 작업 큐에 항목 추가 → KEDA 감지 (10초 폴링) → Worker Pod 스케일 업

**설계 근거**:
- **즉각성**: 폴링 주기(예: 30초) 없이 변경 즉시 반응 → 알림 핑 발행
- **리소스 효율**: 폴링으로 인한 불필요한 CPU/네트워크 소비 제거
- **확장성**: 파일 수가 증가해도 폴링 부하 없음 (Watchman의 inotify 기반)
- **경량화**: 알림 핑만 전달 (~100 bytes), 상세 정보는 spec 파일에서 읽기

**예외**:
- KEDA는 10초 폴링 사용 (K8s HPA 아키텍처 제약) — 작업 즉시 시작보다 비용 최적화 우선

#### 1.3.2 비용 효율적 스케일링 (Cost-Efficient Scaling)

**정의**: 작업이 없을 때는 Worker Pod를 0개로 축소하여 비용을 최소화합니다.

**적용 사례**:
- 유휴 상태: Worker Pod 0개 → 리소스 비용 0원
- 작업 발생: KEDA가 0 → N 스케일 업 (Cold Start ~30초)
- 작업 완료: 60초 cooldown 후 0개로 축소

**설계 근거**:
- **클라우드 비용 최적화**: 작업이 없는 시간(밤/주말)에도 Pod가 유지되면 비용 낭비
- **개발 환경 적합**: 실시간 반응(100ms 이내) 불필요, Cold Start 30초 허용 가능
- **자동 확장**: 작업 증가 시 자동 스케일 업 (최대 6개)

**트레이드오프**:
- Cold Start 지연: 첫 작업 시작까지 ~30초 소요 (이미지 pull + Init Container)
- 완화 방법: 이미지 프리워밍, Init Container 최적화

#### 1.3.3 자동 장애 복구 (Self-Healing)

**정의**: 에이전트 장애 시 사용자 개입 없이 자동으로 작업을 재할당합니다.

**적용 사례**:
- Worker 하트비트 만료 (TTL 30초) → 할당된 작업 자동 반환 → 다른 Worker 재할당
- Pod Crash (OOM, Panic) → K8s가 자동 재시작 → 하트비트 재개
- Redis 연결 끊김 → 지수 백오프 재연결 (5회 시도)

**설계 근거**:
- **안정성**: 단일 Worker 장애가 전체 시스템 중단으로 이어지지 않음
- **신뢰성**: 작업 유실 방지 (Redis List + Stream의 ACK 메커니즘)
- **운영 부담 감소**: 사용자가 장애를 수동으로 감지하고 복구할 필요 없음

**구현 메커니즘**:
1. 하트비트 만료 감지 (30초 TTL)
2. 작업 재할당 (프로젝트 리드)
3. Pod 재시작 (K8s restartPolicy: Always)
4. 장애 이벤트 발행 (Redis Pub/Sub `agent:error:{agentId}`)

#### 1.3.4 관찰 가능한 확장 (Observable Scaling)

**정의**: 모든 스케일링 이벤트와 장애 복구 과정을 로그/메트릭으로 기록하여 디버깅을 용이하게 합니다.

**적용 사례**:
- KEDA 스케일 업 이벤트 → Prometheus 메트릭 `keda_scaler_active` + 로그 기록
- Worker 하트비트 만료 → JSON 로그 + `agent:error` Pub/Sub 발행
- 작업 재할당 → 구조화된 로그 (taskId, oldWorkerId, newWorkerId, reason)

**설계 근거**:
- **디버깅 용이성**: "작업이 왜 느린가?" → 로그에서 스케일 업 지연, Worker 장애 확인
- **성능 최적화**: 메트릭 분석 → 스케일링 정책 조정 (targetQueueLength, cooldownPeriod)
- **장애 추적**: 분산 추적 (Jaeger) → 사용자 요청부터 Worker 완료까지 전체 흐름 시각화

**도구**:
- Prometheus: 메트릭 수집 (CPU, 메모리, 큐 길이, 스케일링 이벤트)
- Loki: 로그 수집 (JSON 로그, 구조화된 쿼리)
- Jaeger: 분산 추적 (traceId 기반 전체 흐름)

---

## 2. Meta Watchman 파일 감지 시스템

### 2.1 Watchman 아키텍처 개요 (v3.0.0: NATS 알림 핑)

```mermaid
graph TD
    PVC[PVC RWX<br/>EFS/NFS/Longhorn] -->|inotify 이벤트| WM[Watchman Daemon]
    WM -->|구독| WP[Watchman Plugin]
    WP -->|알림 핑 발행| NATS[NATS Core<br/>~50MB]
    
    NATS -->|spec.updated| PL[project-lead Pod]
    NATS -->|spec.updated| CO[coordinator Pod]
    
    PL -->|spec 읽기| PVC
    CO -->|spec 읽기| PVC
    
    PL -->|spec 상태 업데이트| PVC
    CO -->|spec 상태 업데이트| PVC
    
    PVC -.변경 감지 순환.-> WM
    
    subgraph "알림 핑 구조"
        direction LR
        PING["{type, specId, path, timestamp}"]
    end
    
    subgraph "spec 파일 (PVC)"
        SPEC["specs/active/*.yaml<br/>- 상세 정보<br/>- 작업 목록<br/>- 상태"]
    end
    
    NATS -.메시지 예시.-> PING
    PVC -.진실의 원천.-> SPEC
    
    style WM fill:#4CAF50,color:#fff
    style NATS fill:#FF6B6B,color:#fff
    style PVC fill:#2196F3,color:#fff
```

**동작 흐름 (v3.0.0)**:
1. PVC 파일 시스템에서 inotify 이벤트 발생 (spec 파일 생성/수정/삭제)
2. Watchman Daemon이 이벤트 감지 (`.watchmanconfig` 설정 기반)
3. Watchman Plugin이 이벤트 수신
4. **NATS에 알림 핑만 발행** (`{ type: "spec.updated", specId: "feat-123", path: "specs/active/feat-123.yaml", timestamp: "..." }`)
5. 구독 중인 에이전트(project-lead, coordinator)가 핑 수신
6. **에이전트가 PVC에서 spec 파일 직접 읽기** → 상세 정보 확인
7. 작업 처리 후 **spec 파일 상태 업데이트** (PVC에 쓰기)
8. Watchman이 변경 감지 → 순환

**v3.0.0 핵심 변경**:
- ❌ **Redis Pub/Sub 제거**: 100~300MB 메모리, 복잡한 메시지 페이로드
- ✅ **NATS Core 도입**: ~50MB 메모리, 알림 핑만 전달 (경량)
- ✅ **spec 파일 중심**: 상세 정보는 PVC의 YAML 파일에 저장 (진실의 원천)
- ✅ **명확한 책임 분리**: NATS는 "알림", PVC spec 파일은 "데이터"

**설계 근거**:
- **inotify 기반**: 파일 시스템 레벨 이벤트 → 폴링 없이 즉시 감지
- **PVC RWX 필수**: ConfigMap/Secret 볼륨은 inotify 지원 안함 (심볼릭 링크 교체 방식)
- **Watchman 선택 이유**: chokidar보다 성능 우수, K8s 환경 최적화, Meta 프로덕션 검증
- **NATS 선택 이유**: Redis보다 경량 (1/3 메모리), 알림 핑 전달에 최적화, 내장 모니터링

### 2.2 Watchman 설치 및 설정

#### 2.2.1 .watchmanconfig 파일

Watchman은 프로젝트 루트에 `.watchmanconfig` 파일이 필요합니다.

```json
{
  "ignore_dirs": [
    "node_modules",
    ".git",
    "dist",
    ".next",
    "coverage",
    ".turbo"
  ],
  "settle": 500
}
```

**설정 항목**:
- `ignore_dirs`: 감시에서 제외할 디렉토리 (성능 최적화)
- `settle`: 파일 변경 이벤트 안정화 시간 (ms) — 대량 변경 시 debounce

**설계 근거**:
- `node_modules` 제외: npm install 시 수천 개 파일 변경 → 불필요한 이벤트 방지
- `settle: 500`: git checkout 시 여러 파일 동시 변경 → 500ms 내 변경 묶어서 처리

#### 2.2.2 Dockerfile에서 Watchman 설치

```dockerfile
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
FROM node:20-alpine

# Watchman 설치 (Alpine Linux)
RUN apk add --no-cache watchman

# 또는 Debian 기반
# RUN apt-get update && apt-get install -y watchman

WORKDIR /workspace
COPY . .

CMD ["node", "index.js"]
```

**설계 근거**:
- Alpine 이미지 사용: 경량화 (5MB 추가)
- 모든 에이전트 이미지에 포함 (공통 base 이미지)

### 2.3 Pod별 Watchman 감지 대상 (v3.0.0)

| Pod | 감시 경로 | 감시 패턴 | 이벤트 처리 | NATS Subject |
|-----|----------|----------|------------|-------------|
| **gateway** | `/workspace/specs/` | `*.yaml` | spec 변경 → 컨설턴트 알림 | `spec.updated` |
| **coordinator** | `/workspace/specs/` | `*.yaml` | spec 상태 변경 → 작업 재할당 | `spec.updated` |

**v3.0.0 변경사항**:
- **Pod 통합**: doc-manager + project-lead + reviewer + junior → **4개 고정 Pod**
  - `gateway`: consultant + git-manager
  - `coordinator`: spec-manager + project-lead + reviewer
  - `nats`: NATS server (64MB)
  - `postgresql`: PostgreSQL + pgvector (512MB)
- **감시 단순화**: spec 파일만 감시 (명세서 중심 워크플로우)
- **NATS Subject 통합**: 다양한 채널 → `spec.updated` 단일 subject

**설계 근거**:
- **Pod 통합**: 7개 → 4개 (리소스 절약 ~300MB)
- **spec 파일 중심**: 모든 작업은 spec 파일에서 시작 → 단일 감시 경로
- **단일 subject**: 에이전트가 specId 기반으로 필터링 → 채널 관리 불필요

### 2.4 Watchman 구독 TypeScript 코드 예시 (v3.0.0: NATS 알림 핑)

```typescript
// ⚠️ 로직 이해용 예시 코드 — 실제 에이전트는 .agents/agents/*.md 프롬프트로 구현
// watchman-subscriber.ts
import { Client as WatchmanClient } from 'fb-watchman';
import { connect, StringCodec } from 'nats';

interface WatchConfig {
  watchPath: string;
  patterns: string[];
  natsSubject: string;
}

class WatchmanSubscriber {
  private client: WatchmanClient;
  private nats: any;  // NATS connection
  private sc: any;    // StringCodec

  constructor() {
    this.client = new WatchmanClient();
    this.sc = StringCodec();
  }

  async init(): Promise<void> {
    // NATS 연결
    this.nats = await connect({
      servers: process.env.NATS_URL || 'nats://nats.agent-system.svc.cluster.local:4222',
      maxReconnectAttempts: -1,  // 무한 재연결
      reconnectTimeWait: 2000,   // 2초 대기
    });

    console.log('Connected to NATS:', this.nats.getServer());
  }

  async watch(config: WatchConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      // 1. Watchman 능력 확인
      this.client.capabilityCheck(
        { optional: [], required: ['relative_root'] },
        (error) => {
          if (error) {
            reject(error);
            return;
          }

          // 2. 디렉토리 감시 시작
          this.client.command(
            ['watch-project', config.watchPath],
            (error, resp) => {
              if (error) {
                reject(error);
                return;
              }

              const { watch, relative_path } = resp;

              // 3. 구독 설정
              const subscription = {
                // 파일 패턴 필터
                expression: [
                  'anyof',
                  ...config.patterns.map((pattern) => ['match', pattern]),
                ],
                // 반환 필드
                fields: ['name', 'size', 'mtime_ms', 'exists', 'type'],
                // 상대 경로 루트
                relative_root: relative_path,
              };

              // 4. 구독 등록
              this.client.command(
                ['subscribe', watch, 'file-changes', subscription],
                (error) => {
                  if (error) {
                    reject(error);
                  } else {
                    console.log(
                      `Watchman subscription active: ${config.watchPath}`
                    );
                    resolve();
                  }
                }
              );

              // 5. 이벤트 핸들러 등록
              this.client.on('subscription', async (resp) => {
                if (resp.subscription !== 'file-changes') return;

                for (const file of resp.files) {
                  await this.handleFileChange(file, config);
                }
              });
            }
          );
        }
      );
    });
  }

  private async handleFileChange(
    file: any,
    config: WatchConfig
  ): Promise<void> {
    // v3.0.0: 알림 핑만 생성 (경량 메시지)
    const ping = {
      type: file.exists ? 'modified' : 'deleted',
      specId: this.extractSpecId(file.name),
      path: file.name,
      timestamp: new Date().toISOString(),
    };

    // NATS 알림 핑 발행
    this.nats.publish(config.natsSubject, this.sc.encode(JSON.stringify(ping)));

    console.log(
      `[NATS Ping] ${ping.type}: ${ping.path} → ${config.natsSubject}`
    );
  }

  private extractSpecId(path: string): string {
    // specs/active/feat-123.yaml → feat-123
    const match = path.match(/specs\/active\/(.+)\.yaml$/);
    return match ? match[1] : 'unknown';
  }

  async close(): Promise<void> {
    this.client.end();
    await this.nats.close();
  }
}

// 사용 예시 (coordinator Pod)
const subscriber = new WatchmanSubscriber();
await subscriber.init();

await subscriber.watch({
  watchPath: '/workspace/specs/',
  patterns: ['*.yaml'],
  natsSubject: 'spec.updated',
});

// 프로세스 종료 시 정리
process.on('SIGTERM', async () => {
  await subscriber.close();
  process.exit(0);
});
```

**v3.0.0 핵심 변경**:
- ❌ **Redis 제거**: `ioredis` 의존성 제거
- ✅ **NATS 도입**: `nats` 패키지 사용 (`npm install nats`)
- ✅ **알림 핑 구조**: `{ type, specId, path, timestamp }` (100 bytes 이하)
- ✅ **자동 재연결**: NATS 연결 끊김 시 자동 재연결 (`maxReconnectAttempts: -1`)

**핵심 포인트**:
- `capabilityCheck`: Watchman 버전 호환성 확인
- `watch-project`: 프로젝트 루트 감시 시작
- `subscribe`: 필터 기반 이벤트 구독
- `relative_root`: 특정 하위 경로만 감시 (성능 최적화)
- `fields`: 필요한 파일 메타데이터만 요청
- **NATS publish**: `nats.publish(subject, payload)` — Redis PUBLISH보다 단순

### 2.5 파일 변경 → NATS 알림 핑 변환 플로우 (v3.0.0)

```mermaid
sequenceDiagram
    participant FS as File System (PVC)
    participant WM as Watchman Daemon
    participant WP as Watchman Plugin
    participant NATS as NATS Core
    participant CO as coordinator Pod
    participant PVC as PVC (spec 파일)

    FS->>WM: inotify IN_MODIFY (specs/active/feat-123.yaml)
    WM->>WP: File Change Event (name, mtime)
    WP->>WP: 알림 핑 생성 (경량)
    WP->>NATS: PUBLISH spec.updated {type, specId, path, timestamp}
    NATS->>CO: 알림 핑 전달 (구독자)
    CO->>PVC: spec 파일 읽기 (상세 정보)
    CO->>CO: 작업 처리 (명세서 분석, 작업 할당)
    CO->>PVC: spec 상태 업데이트 (status, tasks 등)
    PVC->>WM: inotify IN_MODIFY (순환)
```

**변환 로직 (v3.0.0)**:
1. Watchman 이벤트 수신: `{ name: 'specs/active/feat-123.yaml', exists: true, mtime_ms: 1708249845123 }`
2. 이벤트 타입 판별:
   - `exists: true` + 기존 파일 → `modified`
   - `exists: true` + 신규 파일 → `created`
   - `exists: false` → `deleted`
3. **알림 핑 생성 (경량 메시지)**:
   ```json
   {
     "type": "modified",
     "specId": "feat-123",
     "path": "specs/active/feat-123.yaml",
     "timestamp": "2026-02-18T10:30:45.123Z"
   }
   ```
4. **NATS 발행**: `nats.publish('spec.updated', ping)`
5. **에이전트가 PVC에서 spec 읽기**: `fs.readFileSync('/workspace/specs/active/feat-123.yaml')`
6. **작업 처리 후 spec 상태 업데이트**: `status: approved → in-progress`
7. **Watchman 순환**: spec 파일 변경 감지 → 알림 핑 재발행

**v3.0.0 핵심 차이**:
- ❌ **Redis Pub/Sub**: 상세 정보 포함 (size, mtime, 전체 메타데이터) → 500 bytes+
- ✅ **NATS 알림 핑**: 핵심 정보만 (type, specId, path, timestamp) → **~100 bytes**
- ✅ **spec 파일 중심**: 상세 정보는 PVC에서 읽기 (진실의 원천)
- ✅ **순환 감지**: spec 업데이트 → Watchman 감지 → 다음 에이전트 알림 (워크플로우 연결)

**설계 근거**:
- **경량 메시지**: NATS 메모리 사용량 최소화 (~50MB 유지)
- **네트워크 효율**: 알림 핑만 전송 → 네트워크 대역폭 절약
- **명확한 책임**: NATS는 "알림", PVC는 "데이터 저장소"
- **순환 워크플로우**: spec 파일 업데이트가 다음 단계 트리거

### 2.6 대량 파일 변경 Debounce 전략

**문제**: `git checkout` 시 수백 개 spec 파일 동시 변경 → 이벤트 폭주

**해결**: 500ms 윈도우 내 변경 묶어서 한 번에 처리

```typescript
// ⚠️ 로직 이해용 예시 코드 — 실제 에이전트는 .agents/agents/*.md 프롬프트로 구현
class DebouncedWatchman {
  private pendingChanges: Map<string, FileChangeEvent> = new Map();
  private flushTimer: NodeJS.Timeout | null = null;
  private readonly DEBOUNCE_MS = 500;
  private nats: any;  // NATS connection
  private sc: any;    // StringCodec

  handleFileChange(file: any, natsSubject: string): void {
    const key = file.name;
    
    // 변경 사항 누적
    this.pendingChanges.set(key, {
      type: file.exists ? 'modified' : 'deleted',
      specId: this.extractSpecId(file.name),
      path: file.name,
      timestamp: new Date(file.mtime_ms).toISOString(),
    });

    // 기존 타이머 취소
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }

    // 새 타이머 시작 (500ms 후 flush)
    this.flushTimer = setTimeout(() => {
      this.flushChanges(natsSubject);
    }, this.DEBOUNCE_MS);
  }

  private async flushChanges(natsSubject: string): Promise<void> {
    const changes = Array.from(this.pendingChanges.values());
    
    if (changes.length === 0) return;

    // 일괄 알림 핑 발행
    const batchPing = {
      type: 'batch',
      changes,
      count: changes.length,
      timestamp: new Date().toISOString(),
    };

    this.nats.publish(natsSubject, this.sc.encode(JSON.stringify(batchPing)));

    console.log(`Flushed ${changes.length} spec changes → ${natsSubject}`);
    
    // 초기화
    this.pendingChanges.clear();
    this.flushTimer = null;
  }

  private extractSpecId(path: string): string {
    const match = path.match(/specs\/active\/(.+)\.yaml$/);
    return match ? match[1] : 'unknown';
  }
}
```

**설계 근거**:
- **성능**: 1000개 파일 변경 → 1000개 NATS 메시지 대신 1개 배치 알림 핑
- **안정성**: 파일 시스템 쓰기 완료 후 처리 (settle 시간 대기)
- **정확성**: 같은 파일 여러 번 변경 → 마지막 변경만 유지
- **경량화**: 배치 알림 핑도 specId만 포함 → 상세 정보는 PVC에서 읽기

### 2.7 PVC 호환성 주의사항

> ⚠️ **K8s에서 Watchman 사용 시 필수 요구사항**

| 볼륨 타입 | inotify 지원 | Watchman 호환 | 이유 |
|----------|------------|--------------|-----|
| **PVC (EFS/NFS/Longhorn RWX)** | ✅ 지원 | ✅ 호환 | 실제 파일 시스템 쓰기 → inotify 이벤트 발생 |
| **ConfigMap** | ❌ 미지원 | ❌ 불가 | 심볼릭 링크 교체 방식 → IN_MODIFY 없음 |
| **Secret** | ❌ 미지원 | ❌ 불가 | 심볼릭 링크 교체 방식 → IN_MODIFY 없음 |
| **emptyDir** | ✅ 지원 | ✅ 호환 | 임시 파일 시스템 (Pod 내부) |

**필수 요구사항**:
1. ✅ 모든 에이전트의 공유 파일 시스템은 **PVC RWX**로 마운트
2. ✅ `.watchmanconfig` 파일을 프로젝트 루트에 배치
3. ❌ ConfigMap/Secret으로 명세서 저장 불가

**ConfigMap/Secret 제약 이유**:
- K8s는 ConfigMap/Secret 업데이트 시 원자적(atomic) 교체를 보장하기 위해 심볼릭 링크 방식 사용
- 기존: `/config` → `.data-2024-01-01`
- 업데이트: `/config` → `.data-2024-01-02` (심볼릭 링크 교체)
- inotify는 심볼릭 링크 타겟 변경을 감지하지 못함

**검증 방법**:
```bash
# Pod 내부에서 inotify 이벤트 확인
kubectl exec -it doc-manager-xxx -- sh
apk add inotify-tools
inotifywait -m /workspace/docs/  # PVC RWX
```

### 2.8 설계 근거: 왜 chokidar가 아닌 Watchman인가?

| 항목 | chokidar | Watchman | 선택 이유 |
|------|---------|----------|----------|
| **성능** | 파일 많으면 느림 | 대규모 파일 시스템 최적화 | Watchman ✅ |
| **K8s 호환성** | PVC에서 불안정 | PVC RWX 정상 작동 | Watchman ✅ |
| **메모리 사용** | 파일당 watcher | 공유 daemon | Watchman ✅ |
| **Debounce** | 수동 구현 필요 | `settle` 내장 | Watchman ✅ |
| **검증** | 커뮤니티 | Meta 프로덕션 | Watchman ✅ |
| **설치 복잡도** | `npm install` | 시스템 패키지 | chokidar ✅ |

**결론**: Watchman 선택
- Meta가 내부에서 사용 (React Native, Jest, Mercurial)
- 대규모 파일 시스템(10만+ 파일) 최적화
- K8s PVC 환경에서 안정적 동작 검증

---

## 3. KEDA 오토스케일링 전략 (v3.0.0: NATS Scaler)

### 3.1 KEDA 아키텍처 개요

```mermaid
graph TD
    CO[coordinator] -->|작업 할당| SPEC[spec.yaml 파일<br/>PVC]
    SPEC -->|Watchman 감지| NATS[NATS Core]
    NATS -->|메시지 큐| SUB[NATS Subject<br/>worker.tasks]
    
    SUB -->|큐 길이 확인<br/>10초 폴링| KS[KEDA Scaler<br/>NATS JetStream]
    KS -->|HPA 요청| HPA[Horizontal Pod Autoscaler]
    HPA -->|Pod 생성/삭제| WD[Worker Deployment]
    
    WD --> W1[Worker Pod 1]
    WD --> W2[Worker Pod 2]
    WD -.-> WN[Worker Pod 3<br/>최대]
    
    W1 -->|SUBSCRIBE| SUB
    W2 -->|SUBSCRIBE| SUB
    WN -->|SUBSCRIBE| SUB
    
    W1 -->|spec 읽기/쓰기| SPEC
    
    subgraph "KEDA 제어"
        KS
        HPA
    end
    
    subgraph "작업 전달 (NATS)"
        SUB
    end
    
    subgraph "Worker Fleet (최대 3)"
        W1
        W2
        WN
    end
    
    style KS fill:#4CAF50,color:#fff
    style HPA fill:#FF9800,color:#fff
    style NATS fill:#FF6B6B,color:#fff
    style SPEC fill:#2196F3,color:#fff
```

**동작 흐름 (v3.0.0)**:
1. coordinator가 작업을 **spec 파일에 기록** (`tasks: [...]`)
2. Watchman이 spec 변경 감지 → **NATS 알림 핑 발행** (`worker.tasks`)
3. KEDA Scaler가 10초마다 **NATS Subject 메시지 수 확인**
4. 메시지 수 ≥ targetQueueLength × 현재 Pod 수 → HPA에 스케일 업 요청
5. HPA가 Worker Deployment의 replicas 증가 (최대 3)
6. 새 Worker Pod 시작 → **NATS SUBSCRIBE `worker.tasks`**
7. 알림 핑 수신 → **PVC에서 spec 읽기** → 작업 처리
8. 작업 완료 → **spec 상태 업데이트** (PVC) → 메시지 ACK
9. 60초(cooldownPeriod) 동안 메시지 수 0 유지 → 스케일 다운

**v3.0.0 핵심 변경**:
- ❌ **Redis List 제거**: `tasks:pending` Redis 키 제거
- ✅ **NATS JetStream**: 메시지 큐 + ACK 메커니즘 (Redis Stream과 유사)
- ✅ **KEDA NATS Scaler**: `type: nats-jetstream` 사용
- ✅ **Worker 최대 축소**: 6개 → **3개** (리소스 예산 준수)
- ✅ **spec 파일 중심**: 작업 상세 정보는 spec 파일에 저장

**설계 근거**:
- **KEDA 선택 이유**: K8s 표준 HPA 확장, NATS JetStream 스케일러 공식 지원
- **NATS JetStream 사용**: Redis Stream과 달리 메모리 효율 (디스크 백업 가능)
- **폴링 주기 10초**: 실시간성과 NATS 부하 균형 (KEDA 권장)
- **Worker 3개 제한**: 4개 고정 Pod + Worker 3 = 총 7 Pod (리소스 예산 내)

### 3.2 KEDA ScaledObject 매니페스트 상세 (v3.0.0: NATS Scaler)

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# k8s/keda/scaledobject-worker.yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: worker-scaler
  namespace: agent-system
spec:
  # 1. 스케일 대상 (Worker Deployment)
  scaleTargetRef:
    name: background-dev

  # 2. 스케일링 범위 (v3.0.0: 최대 3개)
  minReplicaCount: 0    # 유휴 시 0개 (비용 최적화)
  maxReplicaCount: 3    # 최대 3개 병렬 처리 (6→3 축소)

  # 3. 스케일 다운 정책
  pollingInterval: 10   # KEDA가 메트릭 확인 주기 (초)
  cooldownPeriod: 60    # 스케일 다운 대기 시간 (초)

  # 4. 0 → 1 스케일 업 동작
  advanced:
    restoreToOriginalReplicaCount: false
    horizontalPodAutoscalerConfig:
      behavior:
        scaleDown:
          stabilizationWindowSeconds: 60
          policies:
            - type: Percent
              value: 100
              periodSeconds: 15
        scaleUp:
          stabilizationWindowSeconds: 0
          policies:
            - type: Percent
              value: 100
              periodSeconds: 15
            - type: Pods
              value: 2    # 한 번에 2개까지 추가 (6→2 축소)
              periodSeconds: 15
          selectPolicy: Max

  # 5. 트리거 (v3.0.0: NATS JetStream)
  triggers:
    - type: nats-jetstream
      metadata:
        # NATS 서버 URL
        natsServerMonitoringEndpoint: "nats.agent-system.svc.cluster.local:8222"
        # JetStream 정보
        account: "$G"            # 기본 계정
        stream: "WORKER_TASKS"   # Stream 이름
        consumer: "worker-group" # Consumer 그룹
        # 스케일링 기준 (메시지 2개당 Pod 1개)
        lagThreshold: "2"
        # 활성화 임계값 (메시지 1개 이상이면 0 → 1 스케일 업)
        activationLagThreshold: "1"
```

**v3.0.0 핵심 변경**:
- ❌ **Redis Scaler 제거**: `type: redis`, `listName`, `listLength` 제거
- ✅ **NATS JetStream Scaler**: `type: nats-jetstream` 사용
- ✅ **maxReplicaCount 축소**: 6 → **3** (리소스 예산 준수)
- ✅ **scaleUp Pods 축소**: 4 → **2** (한 번에 2개까지만 추가)
- ✅ **NATS Monitoring Endpoint**: `:8222` (내장 모니터링 포트)

**핵심 파라미터 해설 (v3.0.0)**:

| 파라미터 | 값 | 의미 | 설계 근거 |
|---------|---|------|----------|
| `minReplicaCount` | 0 | 유휴 시 Pod 0개 | 비용 최적화 (클라우드 비용 0원) |
| `maxReplicaCount` | **3** | 최대 3개 병렬 | 리소스 예산 준수 (4 고정 + 3 Worker = 7 Pod) |
| `pollingInterval` | 10초 | KEDA 메트릭 확인 주기 | KEDA 권장 (실시간성 vs NATS 부하) |
| `cooldownPeriod` | 60초 | 스케일 다운 대기 | 작업 간 짧은 간격 있어도 Pod 유지 |
| `lagThreshold` | 2 | 메시지 2개당 Pod 1개 | CPU/메모리 효율 + 병렬성 균형 |
| `activationLagThreshold` | 1 | 메시지 1개 이상이면 활성화 | 0 → 1 스케일 업 트리거 |

**스케일링 공식 (v3.0.0)**:
```
desiredReplicas = ceil(pendingMessages / lagThreshold)
단, desiredReplicas <= 3 (maxReplicaCount)
```

예시:
- 메시지 수 0 → 0개 Pod
- 메시지 수 1~2 → 1개 Pod
- 메시지 수 3~4 → 2개 Pod
- 메시지 수 5~6 → 3개 Pod (maxReplicaCount 제한)
- 메시지 수 7+ → 3개 Pod (큐에서 대기)

### 3.3 NATS JetStream 설정 (v3.0.0)

**NATS JetStream은 Stream과 Consumer를 사전에 생성해야 합니다.**

```bash
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# NATS CLI로 JetStream 설정

# 1. Stream 생성 (작업 큐)
nats stream add WORKER_TASKS \
  --subjects "worker.tasks" \
  --storage file \
  --retention limits \
  --max-msgs=-1 \
  --max-age=24h \
  --replicas=1

# 2. Consumer 생성 (Worker Pod 그룹)
nats consumer add WORKER_TASKS worker-group \
  --pull \
  --deliver all \
  --ack explicit \
  --max-deliver=-1 \
  --wait=30s

# 3. 확인
nats stream info WORKER_TASKS
nats consumer info WORKER_TASKS worker-group
```

**설정 항목 설명**:

| 항목 | 값 | 의미 |
|------|---|------|
| `--subjects "worker.tasks"` | Subject 패턴 | `worker.tasks`로 발행된 메시지 저장 |
| `--storage file` | 디스크 저장 | 메모리 부족 시 디스크 사용 (Redis보다 안정) |
| `--retention limits` | 보관 정책 | 메시지 제한 기반 (시간/개수) |
| `--max-age=24h` | 최대 보관 시간 | 24시간 후 자동 삭제 |
| `--pull` | Pull 모드 | Worker가 능동적으로 메시지 요청 (BRPOP과 유사) |
| `--ack explicit` | 명시적 ACK | Worker가 처리 완료 후 ACK 전송 필수 |
| `--max-deliver=-1` | 무한 재시도 | 실패 시 무한 재전달 (장애 복구) |

**v3.0.0 장점**:
- ✅ **디스크 백업**: 메모리 부족 시에도 메시지 유실 없음
- ✅ **내장 ACK**: Redis Stream과 달리 NACK 후 자동 재전달
- ✅ **경량**: NATS 서버 ~50MB (Redis ~100~300MB)

### 3.4 스케일링 시나리오별 동작 (v3.0.0: Worker 최대 3)

| NATS 메시지 수 | Worker 수 | KEDA 동작 | 소요 시간 | 설명 |
|--------------|----------|----------|---------|------|
| 0 | 0 | **Idle** (대기) | — | 비용 0원, KEDA만 실행 중 |
| 1~2 | 0 → 1 | **Scale Up** | ~30초 | 이미지 pull + Init Container + 시작 |
| 3~4 | 1 → 2 | **Scale Up** | ~30초 | 추가 Pod 시작 |
| 5~6 | 2 → 3 | **Scale Up** | ~30초 | maxReplicaCount 도달 |
| 7+ | 3 | **Max** (대기) | — | NATS 큐에서 대기 (순차 처리) |
| 0 (60초간) | 3 → 0 | **Scale Down** | 60초 | cooldownPeriod 후 축소 |

**시나리오 1: 기능 3개 + 테스트 3개 요청 (총 6개 작업)**

```
09:00:00 | 사용자 요청 → 명세서 작성 → 승인
09:05:00 | coordinator: 6개 작업을 spec 파일에 기록
         | Watchman: spec 변경 감지 → NATS 알림 핑 발행 (worker.tasks × 6)
09:05:10 | KEDA: NATS 메시지 6개 감지
         | KEDA → HPA: desiredReplicas = ceil(6 / 2) = 3
09:05:15 | K8s: Worker Pod 3개 시작 (이미지 pull)
09:05:45 | Worker 3개 시작 완료 (Cold Start ~30초)
09:05:46 | Worker-1: spec 읽기 → 작업 1 시작
         | Worker-2: spec 읽기 → 작업 2 시작
         | Worker-3: spec 읽기 → 작업 3 시작
09:20:00 | Worker-1: 작업 1 완료 → spec 업데이트 → ACK → 작업 4 시작
         | Worker-2: 작업 2 완료 → spec 업데이트 → ACK → 작업 5 시작
         | Worker-3: 작업 3 완료 → spec 업데이트 → ACK → 작업 6 시작
09:35:00 | 모든 작업 완료 (NATS 메시지 0)
09:35:00 | KEDA: 60초 cooldown 시작
09:36:00 | KEDA → HPA: desiredReplicas = 0
09:36:05 | K8s: Worker Pod 3개 종료
09:36:10 | 비용 0원 상태 복귀
```

**시나리오 2: 유휴 상태 (주말)**

```
토요일 00:00 | NATS 메시지 0, Worker 0개
            | KEDA만 실행 중 (CPU ~10m, Memory ~20Mi)
            | 리소스 비용 거의 0원
일요일 23:59 | 여전히 메시지 0, Worker 0개
            | 48시간 동안 비용 최소화
```

**시나리오 3: 대량 작업 (9개) — maxReplicaCount 제한**

```
10:00:00 | coordinator: 9개 작업 → spec 파일
10:00:05 | Watchman → NATS: worker.tasks × 9
10:00:10 | KEDA: 메시지 9개 감지
10:00:15 | KEDA → HPA: desiredReplicas = ceil(9 / 2) = 5
         | ⚠️ maxReplicaCount = 3 제한 적용
         | 실제: desiredReplicas = 3
10:00:45 | Worker 3개 시작 완료
10:00:46 | 3개 Worker가 병렬로 작업 처리 (작업 1~3)
10:15:00 | 3개 작업 완료 → NATS 메시지 6개 남음
         | Worker 계속 유지 (cooldown 아직)
         | 다음 작업 시작 (작업 4~6)
10:30:00 | 6개 작업 완료 → NATS 메시지 3개 남음
         | 다음 작업 시작 (작업 7~9)
10:45:00 | 모든 작업 완료 → NATS 메시지 0
10:46:00 | 60초 cooldown 후 Worker 0개로 축소
```

**v3.0.0 핵심 변경**:
- ✅ **Worker 최대 3개**: 6 → 3 (리소스 예산 준수)
- ✅ **NATS 메시지 큐**: Redis List → NATS JetStream (경량화)
- ✅ **spec 파일 중심**: 작업 상세 정보는 spec에 저장
- ⚠️ **대량 작업 지연**: 9개 작업 시 3개씩 3번 처리 (총 45분) — 허용 가능 (개발 환경)

### 3.5 Worker Pod 시작 순서 (Cold Start)

```mermaid
sequenceDiagram
    participant KEDA
    participant K8s as Kubernetes API
    participant Node as Worker Node
    participant IC as Init Container
    participant WP as Worker Pod

    KEDA->>K8s: desiredReplicas = 1 (HPA 요청)
    K8s->>Node: Pod 스케줄링
    Node->>Node: 이미지 pull (캐시 없으면 ~20초)
    Node->>IC: Init Container 시작
    IC->>IC: PVC 마운트 확인
    IC->>IC: Redis 연결 테스트
    IC->>IC: .watchmanconfig 존재 확인
    IC->>WP: Init 완료 → Worker 시작
    WP->>WP: OpenCode 초기화 (~5초)
    WP->>WP: 하트비트 시작 (agents:heartbeat:{id})
    WP->>WP: 작업 폴링 시작 (BRPOP tasks:pending)
    WP-->>KEDA: Ready (30초 경과)
```

**단계별 소요 시간**:
1. 이미지 pull: 0~20초 (캐시 여부에 따라)
2. Init Container: 2~5초 (헬스 체크)
3. OpenCode 초기화: 3~5초
4. 총 Cold Start: **30초 내외**

### 3.6 Cold Start 최적화 전략

#### 3.6.1 이미지 프리워밍 (Image Prewarming)

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# k8s/worker/daemonset-warmer.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: worker-image-warmer
  namespace: agent-system
spec:
  selector:
    matchLabels:
      app: worker-warmer
  template:
    metadata:
      labels:
        app: worker-warmer
    spec:
      initContainers:
        # Worker 이미지를 모든 노드에 미리 pull
        - name: pull-worker-image
          image: your-registry/worker:latest
          command: ['sh', '-c', 'echo "Image pulled"']
      containers:
        # 최소 리소스로 대기 (이미지 캐시 유지)
        - name: pause
          image: gcr.io/google_containers/pause:3.2
          resources:
            requests:
              cpu: 1m
              memory: 1Mi
```

**효과**: 이미지 pull 시간 0초 (이미 캐시됨) → Cold Start 10초 단축

#### 3.6.2 Init Container 최적화

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
initContainers:
  - name: init-checks
    image: busybox:1.36
    command:
      - sh
      - -c
      - |
        # PVC 마운트 확인 (1초)
        ls /workspace || exit 1
        
        # NATS 연결 테스트 (1초)
        nc -zv nats.agent-system.svc.cluster.local 4222 || exit 1
        
        # .watchmanconfig 확인 (1초)
        test -f /workspace/.watchmanconfig || exit 1
        
        echo "Init checks passed"
    volumeMounts:
      - name: workspace
        mountPath: /workspace
```

**효과**: Init Container 시간 5초 → 3초 단축

#### 3.6.3 OpenCode 초기화 최적화

```typescript
// ⚠️ 로직 이해용 예시 코드 — 실제 에이전트는 .agents/agents/*.md 프롬프트로 구현
// worker-startup.ts

async function optimizedStartup() {
  // 병렬 초기화
  await Promise.all([
    initializeNATS(),        // 1초
    initializeWatchman(),    // 1초
    loadAgentPrompt(),       // 2초
  ]);
  
  // 순차 초기화 (의존성)
  await startHeartbeat();    // 0.5초
  await subscribeToTasks();  // 0.5초 (NATS SUBSCRIBE)
  
  console.log('Worker ready');
}
```

**효과**: 순차 5초 → 병렬 4초 (1초 단축)

**최종 Cold Start**: 30초 → **20초**

### 3.7 설계 근거: 스케일링 파라미터 결정

#### 3.7.1 왜 minReplicaCount: 0인가?

**장점**:
- ✅ 비용 최적화: 유휴 시 리소스 비용 0원 (클라우드 환경)
- ✅ 리소스 절약: 개발 환경에서 불필요한 Pod 제거

**단점**:
- ❌ Cold Start 지연: 첫 작업 시작까지 ~20초
- ❌ 버스트 트래픽 대응 느림

**결론**: ✅ minReplicaCount: 0 선택
- **이유**: 개발 워크플로우는 실시간성(100ms) 불필요
- 20초 지연 허용 가능 (사용자는 명세서 작성 중)
- 비용 절감이 더 중요 (24시간 실행 vs 필요 시만)

#### 3.7.2 왜 lagThreshold: 2인가? (v3.0.0: targetQueueLength → lagThreshold)

**옵션 비교**:

| lagThreshold | NATS 메시지 6개 시 Pod 수 | 장점 | 단점 |
|--------------|------------------------|------|------|
| 1 (메시지당 1 Pod) | 6개 | 최대 병렬성 | 오버헤드 큼 (Cold Start 6번), 리소스 초과 |
| 2 (메시지당 0.5 Pod) | 3개 | 병렬성 + 효율 균형 | — |
| 3 (메시지당 0.33 Pod) | 2개 | 리소스 절약 | 병렬성 낮음 |

**결론**: ✅ lagThreshold: 2 선택
- **이유**: 병렬성(최대 3 Pod)과 리소스 효율 균형
- CPU/메모리 사용률 60~80% 유지 (최적)
- Cold Start 횟수 최소화 (6번 → 3번)
- **리소스 예산 준수**: 4 고정 Pod + 3 Worker = 총 7 Pod (4코어/8GB 내)

#### 3.7.3 왜 cooldownPeriod: 60초인가?

**옵션 비교**:

| cooldownPeriod | 장점 | 단점 | 시나리오 |
|---------------|------|------|---------|
| 30초 | 빠른 축소 (비용 절감) | 작업 간 짧은 간격 시 불필요한 Cold Start | ❌ 불안정 |
| 60초 | 안정적 | 유휴 시간 증가 (소량 비용) | ✅ 권장 |
| 120초 | 매우 안정적 | 유휴 시간 2배 | ❌ 비용 비효율 |

**결론**: ✅ cooldownPeriod: 60초 선택
- **이유**: 작업 간 간격(30~60초) 고려 → Pod 유지
- Cold Start 회피 (60초 내 다음 작업 오면 기존 Pod 재사용)
- KEDA 권장 설정 (30~300초)

---

## 4. 에이전트 하트비트 및 상태 관리 (v3.0.0: NATS 기반)

### 4.1 하트비트 프로토콜 개요 (v3.0.0)

```mermaid
sequenceDiagram
    participant W as Worker Pod
    participant NATS as NATS Core
    participant PG as PostgreSQL
    participant HM as HealthMonitor<br/>(project-lead)

    W->>NATS: PUBLISH heartbeat.worker-1 {"timestamp": "..."}
    Note over W,NATS: 10초마다 갱신
    
    W->>PG: UPDATE agents SET last_heartbeat = NOW()
    Note over W,PG: 하트비트 타임스탬프 저장
    
    loop 10초마다
        W->>NATS: PUBLISH heartbeat.worker-1 {"timestamp": "..."}
        W->>PG: UPDATE agents SET last_heartbeat = NOW()
    end
    
    Note over HM: 30초마다 하트비트 만료 체크
    
    HM->>PG: SELECT * FROM agents WHERE last_heartbeat < NOW() - INTERVAL '30 seconds'
    PG-->>HM: [] (정상)
    
    Note over W: Pod Crash (OOM)
    
    Note over PG: 30초 경과 → 하트비트 만료
    
    HM->>PG: SELECT * FROM agents WHERE last_heartbeat < NOW() - INTERVAL '30 seconds'
    PG-->>HM: [worker-1] (만료)
    
    HM->>HM: 장애 감지 → 작업 재할당
    HM->>NATS: PUBLISH agent.error {"agentId": "worker-1", ...}
```

**v3.0.0 핵심 변경**:
- ❌ **Redis 제거**: `SET agents:heartbeat:{id} EX 30` 제거
- ✅ **NATS 알림**: `PUBLISH heartbeat.{agentId}` (실시간 알림용)
- ✅ **PostgreSQL 저장**: `agents` 테이블에 `last_heartbeat` 저장 (영구 기록)
- ✅ **SQL 쿼리 기반 체크**: `WHERE last_heartbeat < NOW() - INTERVAL '30 seconds'`

**핵심 메커니즘**:
1. Worker가 10초마다 하트비트 발행 (NATS + PostgreSQL)
2. HealthMonitor가 30초마다 PostgreSQL 쿼리로 만료 체크
3. 하트비트 만료 → 장애 판정 → 작업 재할당
4. K8s가 Pod 재시작 → 하트비트 재개

**설계 근거**:
- **NATS 알림**: 실시간 하트비트 모니터링 (선택적, 로깅용)
- **PostgreSQL 저장**: 영구 기록 + 시행착오 DB 통합
- **SQL 쿼리**: TTL 없어도 타임스탬프 비교로 만료 판정
- **경량화**: Redis 제거 (~100MB 절약)

### 4.2 에이전트 상태 머신

```mermaid
stateDiagram-v2
    [*] --> online: Pod 시작
    online --> busy: 작업 수신
    busy --> idle: 작업 완료
    idle --> busy: 작업 수신
    busy --> error: 작업 실패
    error --> idle: 에러 복구
    
    online --> offline: 하트비트 만료 (30초)
    busy --> offline: 하트비트 만료
    idle --> offline: 하트비트 만료
    error --> offline: 하트비트 만료
    
    offline --> online: Pod 재시작
    
    note right of online: 하트비트 발행 중<br/>작업 대기
    note right of busy: 하트비트 발행 중<br/>작업 실행 중
    note right of idle: 하트비트 발행 중<br/>다음 작업 대기
    note right of error: 하트비트 발행 중<br/>에러 상태
    note right of offline: 하트비트 만료<br/>작업 재할당
```

**상태 전이 조건 (v3.0.0)**:

| 현재 상태 | 이벤트 | 다음 상태 | 액션 |
|----------|-------|----------|-----|
| `online` | NATS 작업 알림 수신 | `busy` | PostgreSQL `agents.status` 업데이트 |
| `busy` | 작업 완료 | `idle` | spec 파일 상태 업데이트 (PVC) |
| `idle` | 작업 수신 | `busy` | — |
| `busy` | 작업 실패 | `error` | NATS 에러 알림 발행 |
| `error` | 복구 성공 | `idle` | 다음 작업 대기 |
| `*` | 하트비트 만료 | `offline` | 작업 재할당 + Pod 재시작 |
| `offline` | Pod 재시작 | `online` | 하트비트 재개 |

### 4.3 PostgreSQL 하트비트 스키마 (v3.0.0)

#### 4.3.1 agents 테이블

```sql
-- ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
CREATE TABLE agents (
  id VARCHAR(255) PRIMARY KEY,           -- 에이전트 ID (예: worker-1)
  role VARCHAR(50) NOT NULL,             -- 역할 (worker, project-lead, ...)
  status VARCHAR(20) NOT NULL,           -- 상태 (online, busy, idle, error, offline)
  last_heartbeat TIMESTAMP NOT NULL,     -- 마지막 하트비트 타임스탬프
  current_task_id VARCHAR(255),          -- 현재 작업 ID (NULL 가능)
  pod_name VARCHAR(255),                 -- K8s Pod 이름
  node_name VARCHAR(255),                -- K8s 노드 이름
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 하트비트 만료 체크용 인덱스
CREATE INDEX idx_agents_last_heartbeat ON agents(last_heartbeat);

-- 상태별 필터링용 인덱스
CREATE INDEX idx_agents_status ON agents(status);
```

**예시 쿼리**:
```sql
-- ⚠️ 로직 이해용 예시 — 실제 쿼리는 구현 Phase에서 확정
-- 하트비트 갱신
UPDATE agents 
SET last_heartbeat = NOW(), 
    status = 'busy',
    current_task_id = 'task-123',
    updated_at = NOW()
WHERE id = 'worker-1';

-- 상태 조회
SELECT * FROM agents WHERE id = 'worker-1';

-- 하트비트 만료 체크 (30초 이상 경과)
SELECT * FROM agents 
WHERE last_heartbeat < NOW() - INTERVAL '30 seconds'
  AND status != 'offline';
```

### 4.4 하트비트 발신 코드 예시 (v3.0.0)

```typescript
// ⚠️ 로직 이해용 예시 코드 — 실제 에이전트는 .agents/agents/*.md 프롬프트로 구현
// agent-heartbeat.ts
import { Pool } from 'pg';
import { connect, StringCodec } from 'nats';

interface HeartbeatConfig {
  agentId: string;
  role: string;
  interval: number;  // 갱신 주기 (ms)
}

class AgentHeartbeat {
  private db: Pool;
  private nats: any;
  private sc: any;
  private config: HeartbeatConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private failureCount: number = 0;
  private readonly MAX_FAILURES = 3;

  constructor(config: HeartbeatConfig) {
    this.config = config;
    this.db = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    this.sc = StringCodec();
  }

  async init(): Promise<void> {
    // NATS 연결
    this.nats = await connect({
      servers: process.env.NATS_URL || 'nats://nats.agent-system.svc.cluster.local:4222',
      maxReconnectAttempts: -1,
      reconnectTimeWait: 2000,
    });

    console.log('Heartbeat service initialized');
  }

  start(): void {
    // 즉시 하트비트 전송
    this.sendHeartbeat();

    // 주기적 갱신
    this.intervalId = setInterval(async () => {
      try {
        await this.sendHeartbeat();
        this.failureCount = 0;  // 성공 시 카운터 초기화
      } catch (error) {
        this.handleFailure(error);
      }
    }, this.config.interval);

    console.log(`Heartbeat started for ${this.config.agentId}`);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log(`Heartbeat stopped for ${this.config.agentId}`);
    }
  }

  private async sendHeartbeat(): Promise<void> {
    const now = new Date();

    // PostgreSQL에 하트비트 저장
    await this.db.query(
      `INSERT INTO agents (id, role, status, last_heartbeat, pod_name, node_name, updated_at)
       VALUES ($1, $2, 'online', $3, $4, $5, $3)
       ON CONFLICT (id) 
       DO UPDATE SET 
         last_heartbeat = EXCLUDED.last_heartbeat,
         status = CASE WHEN agents.status = 'offline' THEN 'online' ELSE agents.status END,
         pod_name = EXCLUDED.pod_name,
         node_name = EXCLUDED.node_name,
         updated_at = EXCLUDED.updated_at`,
      [
        this.config.agentId,
        this.config.role,
        now,
        process.env.POD_NAME || 'unknown',
        process.env.NODE_NAME || 'unknown',
      ]
    );

    // NATS 알림 (선택적, 실시간 모니터링용)
    this.nats.publish(
      `heartbeat.${this.config.agentId}`,
      this.sc.encode(JSON.stringify({
        agentId: this.config.agentId,
        timestamp: now.toISOString(),
      }))
    );

    console.log(`Heartbeat sent: ${this.config.agentId} at ${now.toISOString()}`);
  }

  private handleFailure(error: any): void {
    this.failureCount++;
    console.error(
      `Heartbeat failed (${this.failureCount}/${this.MAX_FAILURES}):`,
      error
    );

    if (this.failureCount >= this.MAX_FAILURES) {
      console.error('Max heartbeat failures reached, exiting...');
      process.exit(1);  // Pod 재시작 트리거
    }
  }

  async close(): Promise<void> {
    this.stop();
    await this.db.end();
    await this.nats.close();
  }
}

// 사용 예시 (Worker Pod)
const heartbeat = new AgentHeartbeat({
  agentId: process.env.AGENT_ID || 'worker-1',
  role: 'worker',
  interval: 10000,  // 10초마다 갱신
});

await heartbeat.init();
heartbeat.start();

// 프로세스 종료 시 하트비트 중지
process.on('SIGTERM', async () => {
  await heartbeat.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await heartbeat.close();
  process.exit(0);
});
```

**v3.0.0 핵심 변경**:
- ❌ **Redis 제거**: `SET agents:heartbeat:{id} EX 30` 제거
- ✅ **PostgreSQL**: `INSERT ... ON CONFLICT` (upsert) 사용
- ✅ **NATS 알림**: 실시간 모니터링용 (선택적)
- ✅ **영구 저장**: 하트비트 이력을 DB에 저장 (시행착오 분석)

### 4.5 하트비트 모니터링 코드 예시 (v3.0.0)

```typescript
// ⚠️ 로직 이해용 예시 코드 — 실제 에이전트는 .agents/agents/*.md 프롬프트로 구현
// health-monitor.ts
import { Pool } from 'pg';
import { connect, StringCodec } from 'nats';

class HealthMonitor {
  private db: Pool;
  private nats: any;
  private sc: any;
  private readonly CHECK_INTERVAL = 30000;  // 30초마다 체크
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.db = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    this.sc = StringCodec();
  }

  async init(): Promise<void> {
    this.nats = await connect({
      servers: process.env.NATS_URL || 'nats://nats.agent-system.svc.cluster.local:4222',
    });
    console.log('Health monitor initialized');
  }

  start(): void {
    this.intervalId = setInterval(async () => {
      await this.checkAllAgents();
    }, this.CHECK_INTERVAL);

    console.log('Health monitor started');
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async checkAllAgents(): Promise<void> {
    // 하트비트 만료된 에이전트 조회 (30초 이상 경과)
    const result = await this.db.query(
      `SELECT id, role, status, current_task_id, last_heartbeat
       FROM agents
       WHERE last_heartbeat < NOW() - INTERVAL '30 seconds'
         AND status != 'offline'`
    );

    for (const agent of result.rows) {
      await this.handleAgentFailure(agent);
    }
  }

  private async handleAgentFailure(agent: any): Promise<void> {
    console.error(`Agent ${agent.id} heartbeat expired, marking as offline`);

    // 1. 상태를 offline으로 변경
    await this.db.query(
      `UPDATE agents SET status = 'offline', updated_at = NOW() WHERE id = $1`,
      [agent.id]
    );

    // 2. 할당된 작업 조회 (spec 파일에서)
    const specPath = `/workspace/specs/active/${agent.current_task_id}.yaml`;
    // (여기서 spec 파일을 읽어 작업 목록 확인)

    // 3. 작업을 다른 Worker에 재할당 (spec 파일 업데이트)
    // (spec 파일의 assignedTo 필드를 다른 Worker로 변경)

    console.warn(`Tasks reassigned from ${agent.id}`);

    // 4. NATS 장애 이벤트 발행
    this.nats.publish(
      'agent.error',
      this.sc.encode(JSON.stringify({
        agentId: agent.id,
        role: agent.role,
        error: 'Heartbeat timeout',
        timestamp: new Date().toISOString(),
        lastHeartbeat: agent.last_heartbeat,
      }))
    );
  }

  async close(): Promise<void> {
    this.stop();
    await this.db.end();
    await this.nats.close();
  }
}

// 사용 예시 (coordinator Pod - project-lead)
const monitor = new HealthMonitor();
await monitor.init();
monitor.start();

process.on('SIGTERM', async () => {
  await monitor.close();
  process.exit(0);
});
```

**v3.0.0 핵심 변경**:
- ❌ **Redis 제거**: `EXISTS agents:heartbeat:{id}`, `KEYS agents:status:*` 제거
- ✅ **PostgreSQL 쿼리**: `WHERE last_heartbeat < NOW() - INTERVAL '30 seconds'`
- ✅ **spec 파일 기반 재할당**: Redis 작업 큐 대신 spec 파일 업데이트
- ✅ **NATS 이벤트**: 장애 알림 발행

### 4.6 Pod별 하트비트 설정 (v3.0.0)

| Pod | 갱신 주기 | 만료 판정 | 장애 판정 | 복구 방법 | 설계 근거 |
|-----|----------|----------|----------|---------|----------|
| **gateway** | 10초 | 30초 | 3회 실패 | K8s 재시작 | consultant + git-manager 멀티 컨테이너 |
| **coordinator** | 10초 | 30초 | 3회 실패 | K8s 재시작 + 작업 재할당 | spec-manager + project-lead + reviewer |
| **nats** | N/A | N/A | liveness probe | K8s 재시작 | NATS 자체 모니터링 |
| **postgresql** | N/A | N/A | liveness probe | K8s 재시작 | PostgreSQL 자체 모니터링 |
| **Worker** | 10초 | 30초 | 3회 실패 | spec 재할당 + Pod 재시작 | ⚠️ 작업 유실 방지 필요 |

**v3.0.0 핵심 변경**:
- ✅ **Pod 통합**: 7개 → 4개 고정 Pod
- ✅ **Worker TTL 통일**: 5초/15초 → **10초/30초** (PostgreSQL 부하 감소)
- ✅ **spec 파일 기반**: 작업 재할당은 spec 파일 업데이트로 처리

**Worker 특별 처리 이유**:
- **작업 재할당**: spec 파일의 `assignedTo` 필드를 다른 Worker로 변경
- **빠른 감지**: 하트비트 만료 시 즉시 재할당 → 작업 유실 방지

### 4.7 설계 근거: 하트비트 파라미터 결정

#### 4.7.1 왜 하트비트 주기가 10초인가?

**옵션 비교**:

| 갱신 주기 | 장점 | 단점 | 결론 |
|----------|------|------|------|
| 5초 | 빠른 장애 감지 | PostgreSQL 부하 증가 (2배) | ❌ 오버헤드 |
| 10초 | 장애 감지 + 부하 균형 | — | ✅ 권장 (모든 Pod) |
| 30초 | PostgreSQL 부하 최소 | 장애 감지 느림 (30초) | ❌ 느림 |

**결론**: ✅ 10초 선택
- **이유**: 장애 감지 10~30초 (만료 30초) → 허용 가능
- PostgreSQL 부하 적정 (에이전트 7개 × 6req/min = 0.7req/sec)
- 업계 표준 (K8s livenessProbe: 10초)

#### 4.7.2 왜 v3.0.0에서 Worker TTL을 15초→30초로 늘렸나?

**v1 설정 (Redis)**:
- Worker: 5초 갱신 + 15초 TTL
- 이유: 작업 유실 방지 → 빠른 장애 감지

**v3.0.0 변경 (PostgreSQL)**:
- Worker: **10초 갱신 + 30초 만료**
- 이유: PostgreSQL은 TTL 없음 → 쿼리 부하 감소 우선
- Worker 최대 3개 → 부하 감소
- 장애 감지 10~30초 → 여전히 허용 가능 (개발 환경)

**결론**: ✅ Worker도 10초/30초 통일
- **이유**: PostgreSQL 쿼리 부하 최소화
- spec 파일 기반 재할당 → Redis 작업 큐보다 유연
- Worker 수 축소 (6→3) → 장애 빈도 감소

---

## 5. 장애 감지 및 자동 복구

### 5.1 장애 유형 분류

```mermaid
graph TD
    F[장애 발생] --> T1{유형 분류}
    
    T1 -->|Pod 레벨| F1[Worker Pod 크래시]
    T1 -->|통신 레벨| F2[NATS 연결 끊김]
    T1 -->|데이터 레벨| F3[PostgreSQL 장애]
    T1 -->|스토리지 레벨| F4[PVC 마운트 실패]
    T1 -->|네트워크 레벨| F5[네트워크 파티션]
    
    F1 --> R1[K8s 자동 재시작]
    F2 --> R2[Circuit Breaker + 재연결]
    F3 --> R3[spec 파일 폴백 모드]
    F4 --> R4[Init Container 실패 → 재스케줄]
    F5 --> R5[격리 모드 + 재연결 시도]
    
    R1 --> H[하트비트 복구]
    R2 --> H
    R3 --> H
    R4 --> H
    R5 --> H
    
    H --> OK[정상 운영 복귀]
    
    style F fill:#F44336,color:#fff
    style OK fill:#4CAF50,color:#fff
```

**v3.0.0 핵심 변경**:
- ❌ **Redis 제거**: Redis 연결 끊김 제거
- ✅ **NATS 연결 끊김**: NATS 자동 재연결 (내장 기능)
- ✅ **spec 파일 폴백**: PostgreSQL 장애 시 PVC spec 파일만으로 운영

**장애 분류 기준**:
- **Pod 레벨**: 프로세스 종료, OOMKilled, CrashLoopBackOff
- **통신 레벨**: NATS/PostgreSQL 연결 끊김, 타임아웃
- **데이터 레벨**: 데이터베이스 다운, 쿼리 실패
- **스토리지 레벨**: PVC 마운트 실패, 디스크 가득 참
- **네트워크 레벨**: NetworkPolicy 차단, DNS 해결 실패

### 5.2 장애 유형별 대응 테이블 (v3.0.0)

| 장애 유형 | 감지 방법 | RTO | RPO | 자동 대응 | 수동 대응 | 설계 근거 |
|----------|-----------|-----|-----|-----------|-----------|----------|
| **Worker Pod 크래시** | 하트비트 만료 (30초) | 1분 | 0 | spec 재할당 + K8s 재시작 | — | 하트비트 PostgreSQL 쿼리 |
| **NATS 연결 끊김** | 연결 실패 (1초) | 30초 | 0 | Circuit Breaker + 자동 재연결 | NATS 재시작 | NATS 내장 재연결 |
| **PostgreSQL 장애** | 쿼리 실패 (5초) | 15분 | 5분 | spec 파일 폴백 + 읽기 전용 모드 | DB 복원 | PVC spec이 진실의 원천 |
| **PVC 마운트 실패** | Init Container 실패 | 5분 | 0 | K8s 재스케줄 (다른 노드) | PVC 수동 복구 | Init Container가 사전 검증 |
| **네트워크 파티션** | 타임아웃 (30초) | 30분 | 0 | 격리 모드 (spec 파일만) | 네트워크 복구 | NetworkPolicy 검증 필요 |

**RTO (Recovery Time Objective)**: 장애 발생 후 서비스 복구까지 목표 시간
**RPO (Recovery Point Objective)**: 데이터 유실 허용 시간

**v3.0.0 설계 근거**:
- **RTO 1분 (Worker)**: 사용자 대기 시간 최소화 + spec 재할당
- **RPO 0 (NATS)**: 메시지 큐 내장 영속성 (JetStream)
- **RPO 5분 (PostgreSQL)**: spec 파일이 진실의 원천 → DB는 시행착오 기록용
- **NATS 자동 재연결**: `maxReconnectAttempts: -1` (무한 재연결)

### 5.3 Worker 장애 시 spec 재할당 메커니즘 상세 (v3.0.0)

#### 5.3.1 spec 재할당 플로우

```mermaid
sequenceDiagram
    participant W as Worker Pod
    participant NATS as NATS Core
    participant PVC as PVC (spec 파일)
    participant PG as PostgreSQL
    participant HM as HealthMonitor<br/>(project-lead)
    participant W2 as 다른 Worker

    W->>NATS: SUBSCRIBE worker.tasks
    NATS->>W: 알림 핑 수신 (specId: feat-123)
    W->>PVC: spec 파일 읽기 (feat-123.yaml)
    W->>PG: UPDATE agents SET status='busy', current_task_id='feat-123'
    
    Note over W: Pod Crash (OOMKilled)
    
    Note over PG: 30초 경과 → 하트비트 만료
    
    HM->>PG: SELECT * FROM agents WHERE last_heartbeat < NOW() - '30s'
    PG-->>HM: [worker-1] (만료)
    
    HM->>HM: 장애 감지
    HM->>PVC: spec 파일 읽기 (feat-123.yaml)
    HM->>PVC: spec 파일 업데이트 (assignedTo: worker-1 → null)
    HM->>NATS: PUBLISH worker.tasks {specId: feat-123}
    
    HM->>NATS: PUBLISH agent.error {agentId: worker-1}
    
    Note over W2: 새 Worker 또는 기존 Worker
    
    NATS->>W2: 알림 핑 수신 (specId: feat-123)
    W2->>PVC: spec 파일 읽기
    W2->>PVC: spec 파일 업데이트 (assignedTo: worker-2)
    W2->>W2: 작업 실행
```

**v3.0.0 핵심 메커니즘**:
1. Worker가 NATS SUBSCRIBE (`worker.tasks`)
2. 알림 핑 수신 → PVC에서 spec 파일 읽기
3. PostgreSQL에 상태 업데이트 (`status='busy'`)
4. Pod Crash → 하트비트 만료 (30초)
5. HealthMonitor가 PostgreSQL 쿼리로 만료 감지
6. **spec 파일에서 `assignedTo` 필드 제거** (재할당 가능하게 변경)
7. NATS 알림 핑 재발행 (`worker.tasks`)
8. 다른 Worker가 재할당받음

**v1과의 차이**:
- ❌ **Redis 작업 큐 제거**: `BRPOP tasks:pending`, `LPUSH tasks:active:{id}`
- ✅ **spec 파일 중심**: 작업 상세 정보는 PVC spec 파일에만 저장
- ✅ **NATS 알림 핑**: 재할당 시 알림 핑만 재발행 (경량)
- ✅ **PostgreSQL 하트비트**: TTL 없이 타임스탬프 비교

#### 5.3.2 작업 중복 방지 메커니즘 (v3.0.0)

**문제**: Worker-1 크래시 → spec 재할당 → Worker-2 할당 → Worker-1 재시작 → 중복 실행?

**해결**: spec 파일의 `assignedTo` + PostgreSQL `current_task_id` 이중 검증

```typescript
// ⚠️ 로직 이해용 예시 코드 — 실제 에이전트는 .agents/agents/*.md 프롬프트로 구현
class SpecReassignmentManager {
  async reassignTasksFromFailedWorker(workerId: string): Promise<void> {
    // 1. PostgreSQL에서 Worker가 처리 중이던 spec 조회
    const result = await this.db.query(
      `SELECT current_task_id FROM agents WHERE id = $1 AND current_task_id IS NOT NULL`,
      [workerId]
    );

    if (result.rows.length === 0) {
      console.log(`No active tasks for ${workerId}`);
      return;
    }

    const specId = result.rows[0].current_task_id;
    const specPath = `/workspace/specs/active/${specId}.yaml`;

    // 2. spec 파일 읽기
    const specContent = await fs.readFile(specPath, 'utf-8');
    const spec = yaml.parse(specContent);

    // 3. assignedTo 필드 제거 (재할당 가능하게)
    if (spec.assignedTo === workerId) {
      delete spec.assignedTo;
      spec.status = 'pending';  // 상태를 pending으로 변경
      spec.updatedAt = new Date().toISOString();

      // 4. spec 파일 업데이트 (원자적 쓰기)
      const tmpPath = `${specPath}.tmp`;
      await fs.writeFile(tmpPath, yaml.stringify(spec), 'utf-8');
      await fs.rename(tmpPath, specPath);  // 원자적 교체

      console.warn(`Reassigned spec ${specId} from ${workerId}`);

      // 5. NATS 알림 핑 재발행
      this.nats.publish(
        'worker.tasks',
        this.sc.encode(JSON.stringify({
          type: 'reassigned',
          specId,
          path: specPath,
          timestamp: new Date().toISOString(),
        }))
      );

      // 6. PostgreSQL 상태 업데이트
      await this.db.query(
        `UPDATE agents SET current_task_id = NULL, status = 'offline' WHERE id = $1`,
        [workerId]
      );

      // 7. NATS 장애 이벤트 발행
      this.nats.publish(
        'agent.error',
        this.sc.encode(JSON.stringify({
          workerId,
          error: 'Heartbeat timeout',
          reassignedSpec: specId,
          timestamp: new Date().toISOString(),
        }))
      );
    }
  }
}
```

**v3.0.0 중복 방지 메커니즘**:
- ✅ **spec 파일 잠금**: `assignedTo` 필드로 Worker 할당 표시
- ✅ **PostgreSQL 검증**: `current_task_id`로 이중 확인
- ✅ **원자적 파일 쓰기**: `writeFile + rename` (심볼릭 링크 교체)
- ✅ **상태 전이**: `in-progress` → `pending` → 다른 Worker가 `in-progress`
- ❌ **Lua 스크립트 불필요**: spec 파일이 단일 진실의 원천

**Lua 스크립트 대신 spec 파일 사용 이유**:
- Redis 제거 → Lua 스크립트 불필요
- spec 파일 쓰기는 원자적 (파일 시스템 보장)
- 명확한 상태 추적 (Git으로 이력 관리 가능)

### 5.4 Circuit Breaker 패턴 상세 (v3.0.0: NATS/PostgreSQL)

#### 5.4.1 Circuit Breaker 상태 머신

```mermaid
stateDiagram-v2
    [*] --> Closed: 초기 상태
    
    Closed --> Open: 연속 5회 실패
    Open --> HalfOpen: 30초 경과
    HalfOpen --> Closed: 1회 성공
    HalfOpen --> Open: 1회 실패
    
    note right of Closed: 정상 동작<br/>모든 요청 허용
    note right of Open: 차단 상태<br/>모든 요청 즉시 실패
    note right of HalfOpen: 테스트 모드<br/>1회 시도 허용
```

**상태별 동작 (v3.0.0)**:

| 상태 | 동작 | 전이 조건 | 목적 |
|------|------|----------|------|
| **Closed** | 모든 요청 허용 | 연속 5회 실패 → Open | 정상 운영 |
| **Open** | 모든 요청 즉시 실패 | 30초 경과 → HalfOpen | NATS/PostgreSQL 과부하 방지 |
| **HalfOpen** | 1회 시도 허용 | 성공 → Closed, 실패 → Open | 복구 확인 |

**v3.0.0 적용 대상**:
- ✅ **NATS 연결**: NATS 장애 시 Circuit Breaker (단, NATS 자체 재연결 우선)
- ✅ **PostgreSQL 연결**: DB 장애 시 Circuit Breaker + spec 파일 폴백
- ❌ **Redis 제거**: Redis Circuit Breaker 불필요

#### 5.4.2 Circuit Breaker 구현 예시 (v3.0.0)

```typescript
// ⚠️ 로직 이해용 예시 코드 — 실제 에이전트는 .agents/agents/*.md 프롬프트로 구현
type CircuitState = 'closed' | 'open' | 'half-open';

class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  
  private readonly FAILURE_THRESHOLD = 5;     // 5회 실패
  private readonly TIMEOUT = 30000;           // 30초
  private readonly HALF_OPEN_REQUESTS = 1;    // 1회 시도
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // 1. Open 상태: 즉시 실패
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.TIMEOUT) {
        // 30초 경과 → HalfOpen 전이
        this.state = 'half-open';
        console.log('Circuit breaker: Open → HalfOpen');
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      // 2. 요청 실행
      const result = await fn();
      
      // 3. 성공 → Closed 전이
      this.onSuccess();
      return result;
      
    } catch (error) {
      // 4. 실패 → 카운트 증가
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess(): void {
    this.failureCount = 0;
    
    if (this.state === 'half-open') {
      this.state = 'closed';
      console.log('Circuit breaker: HalfOpen → Closed');
    }
  }
  
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.FAILURE_THRESHOLD) {
      this.state = 'open';
      console.error('Circuit breaker: Closed → Open');
    }
    
    if (this.state === 'half-open') {
      this.state = 'open';
      console.error('Circuit breaker: HalfOpen → Open');
    }
  }
  
  getState(): CircuitState {
    return this.state;
  }
}

// v3.0.0: PostgreSQL 연결용 Circuit Breaker
const pgCircuitBreaker = new CircuitBreaker();

async function safeDbQuery<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await pgCircuitBreaker.execute(fn);
  } catch (error) {
    if (error.message === 'Circuit breaker is OPEN') {
      // Circuit Open → spec 파일 폴백
      console.warn('PostgreSQL circuit is open, using spec file fallback');
      throw new Error('DB_UNAVAILABLE');
    }
    throw error;
  }
}

// Worker에서 하트비트 업데이트 (PostgreSQL)
async function updateHeartbeat(agentId: string): Promise<void> {
  try {
    await safeDbQuery(async () => {
      await db.query(
        `UPDATE agents SET last_heartbeat = NOW() WHERE id = $1`,
        [agentId]
      );
    });
  } catch (error) {
    if (error.message === 'DB_UNAVAILABLE') {
      // PostgreSQL 장애 시: spec 파일만으로 운영 (하트비트는 선택적)
      console.warn('Heartbeat skipped, DB unavailable');
      // Worker는 계속 작업 처리 (spec 파일 기반)
    } else {
      throw error;
    }
  }
}

// v3.0.0: NATS는 내장 재연결 사용 (Circuit Breaker 선택적)
// NATS 연결 시 maxReconnectAttempts: -1 설정으로 자동 재연결
const nats = await connect({
  servers: 'nats://nats.agent-system.svc.cluster.local:4222',
  maxReconnectAttempts: -1,  // 무한 재연결
  reconnectTimeWait: 2000,   // 2초 대기
  reconnectJitter: 1000,      // 재연결 jitter
});
```

**v3.0.0 설계 근거**:
- **5회 실패 임계값**: 일시적 네트워크 문제 vs 실제 장애 구분
- **30초 타임아웃**: PostgreSQL 재시작 시간 고려
- **1회 HalfOpen 시도**: 빠른 복구 확인
- **NATS 내장 재연결 우선**: Circuit Breaker보다 NATS 자체 재연결 신뢰
- **PostgreSQL Circuit Breaker 필수**: DB 장애 시 spec 파일 폴백 모드 전환
- **spec 파일 폴백**: PostgreSQL 없어도 Worker는 spec 파일만으로 작업 처리 가능

### 5.5 K8s Liveness/Readiness Probe 설정

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# k8s/worker/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: worker-dev
spec:
  template:
    spec:
      containers:
        - name: worker
          image: your-registry/worker:latest
          ports:
            - name: http
              containerPort: 3000
            - name: metrics
              containerPort: 9090
          
          # Liveness Probe: Pod 재시작 트리거
          livenessProbe:
            httpGet:
              path: /health/live
              port: http
            initialDelaySeconds: 30    # 초기 시작 시간
            periodSeconds: 10          # 10초마다 체크
            timeoutSeconds: 5          # 5초 타임아웃
            failureThreshold: 3        # 3회 실패 → 재시작
          
          # Readiness Probe: 트래픽 수신 여부
          readinessProbe:
            httpGet:
              path: /health/ready
              port: http
            initialDelaySeconds: 10
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 2        # 2회 실패 → 트래픽 제외
```

### 5.5 K8s Liveness/Readiness Probe 설정 (v3.0.0)

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# k8s/worker/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: background-dev
spec:
  template:
    spec:
      containers:
        - name: worker
          image: your-registry/worker:latest
          ports:
            - name: http
              containerPort: 3000
            - name: metrics
              containerPort: 9090
          
          # Liveness Probe: Pod 재시작 트리거
          livenessProbe:
            httpGet:
              path: /health/live
              port: http
            initialDelaySeconds: 30    # 초기 시작 시간
            periodSeconds: 10          # 10초마다 체크
            timeoutSeconds: 5          # 5초 타임아웃
            failureThreshold: 3        # 3회 실패 → 재시작
          
          # Readiness Probe: 트래픽 수신 여부
          readinessProbe:
            httpGet:
              path: /health/ready
              port: http
            initialDelaySeconds: 10
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 2        # 2회 실패 → 트래픽 제외
```

**헬스 체크 엔드포인트 구현 (v3.0.0)**:

```typescript
// ⚠️ 로직 이해용 예시 코드 — 실제 에이전트는 .agents/agents/*.md 프롬프트로 구현
import express from 'express';
import { Pool } from 'pg';
import { connect } from 'nats';

const app = express();
const db = new Pool({ connectionString: process.env.DATABASE_URL });
let nats: any;

// NATS 연결 초기화
(async () => {
  nats = await connect({
    servers: process.env.NATS_URL || 'nats://nats.agent-system.svc.cluster.local:4222',
  });
})();

// Liveness: 프로세스 살아있는지 (기본 체크)
app.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Readiness: NATS + PostgreSQL + PVC 확인
app.get('/health/ready', async (req, res) => {
  const checks = {
    nats: false,
    postgresql: false,
    pvc: false,
  };
  
  try {
    // NATS 연결 확인
    if (nats && !nats.isClosed()) {
      checks.nats = true;
    }
    
    // PostgreSQL 연결 확인
    await db.query('SELECT 1');
    checks.postgresql = true;
    
    // PVC 마운트 확인
    const fs = require('fs');
    fs.accessSync('/workspace', fs.constants.R_OK);
    checks.pvc = true;
    
    // 모두 성공 → 200 OK
    if (checks.nats && checks.postgresql && checks.pvc) {
      res.status(200).json({ status: 'ready', checks });
    } else {
      res.status(503).json({ status: 'not ready', checks });
    }
    
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      checks,
      error: error.message,
    });
  }
});

app.listen(3000);
```

**v3.0.0 핵심 변경**:
- ❌ **Redis 체크 제거**: `await redis.ping()` 제거
- ✅ **NATS 체크**: `nats.isClosed()` (NATS 연결 상태)
- ✅ **PostgreSQL 체크**: `SELECT 1` (DB 연결 상태)
- ✅ **PVC 마운트**: spec 파일 접근 가능 여부

**Probe 설정 근거**:

| 파라미터 | Liveness | Readiness | 이유 |
|---------|----------|-----------|------|
| `initialDelaySeconds` | 30초 | 10초 | Liveness: 애플리케이션 초기화 대기<br/>Readiness: NATS/PostgreSQL 연결만 확인 |
| `periodSeconds` | 10초 | 5초 | Readiness는 더 자주 체크 (트래픽 제외) |
| `failureThreshold` | 3회 | 2회 | Liveness: 재시작 전 충분한 재시도<br/>Readiness: 빠른 트래픽 제외 |

### 5.6 설계 근거: 왜 자동 복구가 중요한가?

#### 5.6.1 무인 운영 시나리오

**시나리오**: 주말에 사용자가 명세서 승인 → 자동 작업 실행

```
토요일 10:00 | 사용자: 명세서 승인
            | coordinator (project-lead): 6개 작업을 spec 파일에 기록
            | Watchman: spec 변경 감지 → NATS 알림 핑 발행
            | KEDA: NATS 메시지 6개 감지 → Worker 3개 스케일 업

토요일 10:30 | Worker-1: 작업 실행 중 OOMKilled (메모리 부족)
            | ❌ 자동 복구 없음 → 작업 유실 → 월요일 발견
            | ✅ 자동 복구 있음 → 하트비트 만료 → spec 재할당 → 다른 Worker 처리

토요일 11:00 | 모든 작업 완료 (자동 복구 덕분)
월요일 09:00 | 사용자: 결과물 확인 → 만족
```

**결과**:
- 자동 복구 없음 → 48시간 지연 (주말 무인 상태)
- 자동 복구 있음 → 30분 내 복구 (사용자 모름)

#### 5.6.2 비용 절감 효과 (v3.0.0)

**시나리오**: NATS 일시적 장애 (30초)

```
NATS 다운 (30초)
├─ ❌ 자동 복구 없음
│   ├─ Worker 3개 모두 크래시
│   ├─ KEDA: Worker 0개로 축소
│   ├─ NATS 복구 후에도 Worker 0개 유지
│   └─ 다음 작업 시 Cold Start 30초 × 3번 = 1.5분 지연
│
└─ ✅ NATS 자동 재연결 + Circuit Breaker
    ├─ Worker: NATS 재연결 시도 (내장 기능)
    ├─ PostgreSQL Circuit Open → spec 파일 폴백
    ├─ NATS 복구 감지 → Circuit Closed
    ├─ Worker 계속 실행 (재시작 불필요)
    └─ 지연 30초만 (Cold Start 회피)
```

**v3.0.0 비용 절감**:
- Cold Start 회피 → 사용자 대기 시간 감소
- Worker 재시작 횟수 감소 → 이미지 pull 트래픽 감소
- NATS 자동 재연결 → Redis보다 안정적 (내장 기능)
- spec 파일 폴백 → PostgreSQL 장애 시에도 작업 처리 가능

---

## 6. 스케일링 정책 및 비용 최적화 (v3.0.0)

### 6.1 시간대별 스케일링 전략 (v3.0.0 제외)

**v3.0.0에서는 시간대별 스케일링 제외**:
- 이유: 개발 환경 우선, 단순화
- Worker 최대 3개로 충분 (복잡한 스케줄링 불필요)
- 필요 시 v4에서 추가 검토

**v3.0.0 스케일링 전략**:
- ✅ **단순 정책**: NATS 메시지 수 기반, 0→3 스케일링
- ✅ **고정 파라미터**: lagThreshold=2, cooldownPeriod=60초
- ❌ **시간대별 정책 제외**: CronSchedule 트리거 미사용

### 6.2 비용 최적화 체크리스트 (v3.0.0)

| 항목 | v1 (Redis) | v3.0.0 (NATS) | 절감 효과 |
|------|-----------|--------------|----------|
| **메시지 큐 메모리** | Redis 100~300MB | NATS ~50MB | **~150MB 절약** |
| **Worker 최대 수** | 6개 | 3개 | **~900MB 절약** (300MB × 3) |
| **고정 Pod 수** | 7개 | 4개 | **~900MB 절약** (300MB × 3) |
| **모니터링 스택** | Prometheus+Loki+Grafana (1GB+) | kubectl+k9s+NATS 내장 | **~1GB 절약** |
| **총 메모리 절약** | — | — | **~3GB 절약** |

**v3.0.0 리소스 예산 (4코어/8GB 기준)**:

```
고정 Pod (4개):
├─ gateway (consultant + git-manager): 256MB × 2 = 512MB
├─ coordinator (spec-manager + project-lead + reviewer): 256MB × 3 = 768MB
├─ nats: 64MB
└─ postgresql: 512MB
총: ~1.85GB

Worker (0→3):
└─ background-dev: 300MB × 0~3 = 0~900MB

최대 메모리: 1.85GB + 900MB = 2.75GB (8GB 중 34%)
여유 메모리: ~5.25GB (OS + 버퍼)
```

**v3.0.0 비용 최적화 달성**:
- ✅ **메모리 34%만 사용**: 8GB 중 2.75GB
- ✅ **Worker 0개 시**: 1.85GB만 사용 (23%)
- ✅ **모니터링 경량화**: 외부 스택 불필요
- ✅ **NATS 경량**: Redis 대비 1/3 메모리

---

### 6.3 비용 계산 예시 (v3.0.0)

#### 6.3.1 리소스 사용량 (v3.0.0 기준)

**항시 실행 Pod (v3.0.0 - 4개 고정)**:

| Pod | 컨테이너 | CPU Requests | Memory Requests | 개수 | 총 CPU | 총 Memory |
|-----|---------|--------------|----------------|------|--------|-----------|
| gateway | consultant + git-manager | 100m × 2 | 256Mi × 2 | 1 | 0.2 | 0.5Gi |
| coordinator | spec-manager + project-lead + reviewer | 100m × 3 | 256Mi × 3 | 1 | 0.3 | 0.75Gi |
| nats | nats-server | 50m | 64Mi | 1 | 0.05 | 0.0625Gi |
| postgresql | postgres + pgvector | 200m | 512Mi | 1 | 0.2 | 0.5Gi |
| **합계** | — | — | — | 4 | **0.75** | **1.8125Gi** |

**Worker Pod (KEDA - v3.0.0)**:

| Pod | 컨테이너 | CPU Requests | Memory Requests | 최대 개수 | 최대 CPU | 최대 Memory |
|-----|---------|--------------|----------------|----------|---------|------------|
| Worker | background-dev | 200m | 300Mi | 3 | 0.6 | 0.9Gi |

**총 리소스 (최대 부하 - v3.0.0)**:
- CPU: 0.75 (고정) + 0.6 (Worker 3개) = **1.35 코어**
- Memory: 1.8125Gi (고정) + 0.9Gi (Worker 3개) = **2.7125Gi**

#### 6.3.2 비용 시뮬레이션 (v3.0.0 기준)

**전제 조건**:
- 클라우드: Google Kubernetes Engine (GKE)
- 노드 타입: e2-standard-4 (4 vCPU, 16GB RAM)
- 가격: $0.134/시간 (서울 리전)
- 월 730시간

**시나리오 1: 항시 실행 (Worker 3개 고정)**

```
리소스 사용: CPU 1.35코어, Memory 2.71Gi
노드 수: 1개 (e2-standard-4 충분)
월 비용: 1 × $0.134 × 730 = $97.82/월
CPU 사용률: 1.35 / 4 = 34%
```

**시나리오 2: KEDA 오토스케일링 (Worker 0~3)**

```
업무 시간 (10시간/일 × 5일 = 50시간/주)
├─ Worker 평균 1.5개
├─ CPU 0.75 + 0.3 = 1.05코어
└─ 노드 1개

야간/주말 (168 - 50 = 118시간/주)
├─ Worker 평균 0개
├─ CPU 0.75코어
└─ 노드 1개

월 비용: 1 × $0.134 × 730 = $97.82/월
(노드 수 동일 → 비용 동일)

✅ CPU 사용률 향상:
- 항시 실행: 1.35 / 4 = 34%
- 오토스케일링: 평균 0.9 / 4 = 22.5% (효율)
```

**시나리오 3: Spot/Preemptible 노드 (Worker 전용)**

```
고정 Pod (4개): 일반 노드
Worker Pod (KEDA): Spot 노드 (70% 할인)

고정 노드 (1개): $97.82/월
Worker Spot 노드 (필요 시만):
├─ 업무 시간 50시간/주 × 4주 = 200시간/월
├─ Spot 가격: $0.134 × 0.3 = $0.040/시간
└─ Worker 비용: 200 × $0.040 = $8.00/월

총 비용: $97.82 + $8.00 = $105.82/월
```

**비용 절감 요약 (v3.0.0)**:

| 시나리오 | 월 비용 | Worker 비용 | 절감률 | 특징 |
|---------|--------|-----------|-------|------|
| 항시 실행 (Worker 3개) | $97.82 | — | 0% (기준) | CPU 34% 사용 |
| KEDA (0~3, 일반 노드) | $97.82 | — | 0% | CPU 22.5% 평균 (효율) |
| KEDA + Spot 노드 | $105.82 | $8.00 | **92% Worker 절감** | Spot 중단 가능 |

**v3.0.0 결론**: 
- ✅ KEDA + Spot 노드 조합이 최적 (Worker만 Spot)
- ✅ CPU 사용률 개선 + Worker 비용 92% 절감
- ✅ v1 대비 리소스 효율 대폭 개선 (3.65코어 → 1.35코어)
- ⚠️ Spot 중단 대비 자동 재할당 필요 (하트비트로 해결)

### 6.4 리소스 최적화 전략 (v3.0.0)

#### 6.4.1 이미지 경량화 (Alpine + Multi-Stage Build)

**Before (Debian 기반)**: 850MB

```dockerfile
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["node", "dist/index.js"]
```

**After (Alpine 기반)**: 180MB

```dockerfile
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# Dockerfile

# Stage 1: 빌드
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Stage 2: 실행 (경량화)
FROM node:20-alpine
WORKDIR /app

# Watchman 설치 (Alpine)
RUN apk add --no-cache watchman

# 빌드 결과물만 복사
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

USER node
CMD ["node", "dist/index.js"]
```

**효과**:
- 이미지 크기: 850MB → 180MB (79% 감소)
- 이미지 pull 시간: 60초 → 15초 (Cold Start 45초 단축)
- 레지스트리 비용: 79% 감소

#### 6.4.2 npm 캐시 PVC 활용

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# k8s/worker/deployment.yaml
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      volumes:
        - name: npm-cache
          persistentVolumeClaim:
            claimName: npm-cache-pvc  # 10Gi, ReadWriteMany
      
      initContainers:
        - name: npm-cache-warmer
          image: node:20-alpine
          command:
            - sh
            - -c
            - |
              # npm 캐시 디렉토리 설정
              npm config set cache /cache/.npm
              
              # package.json 기반 사전 설치
              cd /app
              npm ci
          volumeMounts:
            - name: npm-cache
              mountPath: /cache
            - name: workspace
              mountPath: /app
              readOnly: true
```

**효과**:
- npm install 시간: 60초 → 5초 (캐시 히트 시)
- Cold Start 단축: 55초

#### 6.4.3 Spot/Preemptible 노드 (Worker 전용)

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# k8s/worker/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: worker-dev
spec:
  template:
    spec:
      # Spot 노드에만 스케줄링
      nodeSelector:
        cloud.google.com/gke-preemptible: "true"
      
      # Spot 중단 시 재스케줄링
      tolerations:
        - key: cloud.google.com/gke-preemptible
          operator: Equal
          value: "true"
          effect: NoSchedule
      
      # 우선순위 낮음 (고정 Pod 우선)
      priorityClassName: low-priority
```

**GKE NodePool 설정** (Terraform):

```hcl
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
resource "google_container_node_pool" "worker_spot" {
  name       = "worker-spot-pool"
  cluster    = google_container_cluster.primary.name
  node_count = 0  # KEDA가 자동 스케일링
  
  autoscaling {
    min_node_count = 0
    max_node_count = 3
  }
  
  node_config {
    preemptible  = true  # Spot 노드
    machine_type = "e2-standard-2"
    
    labels = {
      workload = "worker"
    }
    
    taint {
      key    = "workload"
      value  = "worker"
      effect = "NO_SCHEDULE"
    }
  }
}
```

**Spot 중단 대응**:
1. Spot 노드 중단 (30초 전 알림)
2. K8s가 Worker Pod를 다른 노드로 재스케줄
3. 하트비트 만료 → 작업 재할당
4. 자동 복구 (사용자 모름)

---

## 7. OpenCode Plugin 통합 (Watchman Bridge - v3.0.0)

### 7.1 OpenCode Plugin 시스템 개요 (v3.0.0)

```
.opencode/plugins/
├── package.json                # Plugin 의존성
├── tsconfig.json               # TypeScript 설정
├── watchman-bridge.ts          # Watchman 이벤트 → NATS (v3.0.0)
├── heartbeat-plugin.ts         # 하트비트 발신 (PostgreSQL + NATS)
├── queue-consumer.ts           # NATS 작업 큐 소비 (Worker용, v3.0.0)
└── custom-tools.ts             # OpenCode 커스텀 도구 등록
```

**Plugin 실행 환경**:
- OpenCode Pod 내부 (컨설턴트와 동일 프로세스)
- Node.js 런타임
- 환경변수 참조 (NATS_URL, POSTGRES_URL, AGENT_ID 등)

**v3.0.0 변경사항**:
- ❌ Redis 제거 → ✅ NATS Core
- ✅ NATS Pub/Sub로 알림 전달
- ✅ PostgreSQL로 하트비트 상태 저장
- ✅ spec 파일에서 상세 정보 읽기

### 7.2 Watchman Bridge Plugin 상세 (v3.0.0)

```typescript
// ⚠️ 로직 이해용 예시 코드 — 실제 에이전트는 .agents/agents/*.md 프롬프트로 구현
// .opencode/plugins/watchman-bridge.ts

import { Plugin } from '@opencode/sdk';
import watchman from 'fb-watchman';
import { connect, StringCodec } from 'nats';

interface WatchConfig {
  path: string;
  patterns: string[];
  subject: string;  // v3.0.0: channel → subject
}

export default class WatchmanBridgePlugin implements Plugin {
  name = 'watchman-bridge';
  version = '3.0.0';
  
  private client: watchman.Client;
  private nc: any; // NATS connection
  private sc = StringCodec();
  private watches: Map<string, WatchConfig> = new Map();
  
  async onLoad(context: any): Promise<void> {
    console.log('[v3.0.0] Loading Watchman Bridge Plugin...');
    
    // NATS 연결 (자동 재연결)
    this.nc = await connect({
      servers: process.env.NATS_URL || 'nats://nats:4222',
      maxReconnectAttempts: -1, // 무제한 재시도
      reconnectTimeWait: 1000,   // 1초 대기
    });
    
    console.log('Connected to NATS:', this.nc.getServer());
    
    // Watchman 클라이언트 초기화
    this.client = new watchman.Client();
    
    // Pod 타입별 감시 설정
    const podType = process.env.POD_TYPE || 'opencode';
    await this.setupWatches(podType);
    
    console.log('[v3.0.0] Watchman Bridge Plugin loaded');
  }
  
  private async setupWatches(podType: string): Promise<void> {
    const configs: Record<string, WatchConfig[]> = {
      'gateway': [
        {
          path: '/workspace/docs/',
          patterns: ['*.md', '*.yaml'],
          subject: 'spec.doc.updated',  // v3.0.0: NATS subject
        },
      ],
      'coordinator': [
        {
          path: '/workspace/specs/',
          patterns: ['*.yaml'],
          subject: 'spec.status.changed',
        },
        {
          path: '/workspace/src/',
          patterns: ['*.ts', '*.tsx'],
          subject: 'review.file.changed',
        },
      ],
    };
    
    const watchConfigs = configs[podType] || [];
    
    for (const config of watchConfigs) {
      await this.watchDirectory(config);
    }
  }
  
  private async watchDirectory(config: WatchConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.command(['watch-project', config.path], (error, resp) => {
        if (error) {
          reject(error);
          return;
        }
        
        const { watch, relative_path } = resp;
        
        const subscription = {
          expression: [
            'anyof',
            ...config.patterns.map((p) => ['match', p, 'wholename']),
          ],
          fields: ['name', 'size', 'mtime_ms', 'exists', 'type'],
          relative_root: relative_path,
        };
        
        this.client.command(
          ['subscribe', watch, `watch-${config.path}`, subscription],
          (error) => {
            if (error) {
              reject(error);
            } else {
              console.log(`[v3.0.0] Watching ${config.path} → ${config.subject}`);
              resolve();
            }
          }
        );
      });
    });
    
    // 이벤트 핸들러 등록
    this.client.on('subscription', async (resp) => {
      if (resp.subscription.startsWith('watch-')) {
        for (const file of resp.files) {
          await this.handleFileChange(file, config.subject);
        }
      }
    });
  }
  
  private async handleFileChange(file: any, subject: string): Promise<void> {
    // v3.0.0: 경량 알림 (상세 정보는 spec 파일에 있음)
    const notification = {
      type: file.exists ? 'modified' : 'deleted',
      path: file.name,
      timestamp: new Date().toISOString(),
    };
    
    // NATS Pub/Sub 발행 (100 bytes 이하)
    this.nc.publish(subject, this.sc.encode(JSON.stringify(notification)));
    
    console.log(`[v3.0.0] ${notification.type}: ${notification.path} → ${subject}`);
  }
  
  async onUnload(): Promise<void> {
    this.client.end();
    await this.nc.drain();
    console.log('[v3.0.0] Watchman Bridge Plugin unloaded');
  }
}
```

**v3.0.0 주요 변경**:
- ✅ `connect()` from `nats` (Redis 대신)
- ✅ `maxReconnectAttempts: -1` (자동 재연결)
- ✅ `nc.publish(subject, data)` (Redis Pub/Sub 대신)
- ✅ 경량 notification (100 bytes 이하, 상세 정보는 spec 파일)

### 7.3 Heartbeat Plugin 상세 (v3.0.0)

```typescript
// ⚠️ 로직 이해용 예시 코드 — 실제 에이전트는 .agents/agents/*.md 프롬프트로 구현
// .opencode/plugins/heartbeat-plugin.ts

import { Plugin } from '@opencode/sdk';
import { connect, StringCodec } from 'nats';
import { Pool } from 'pg';

export default class HeartbeatPlugin implements Plugin {
  name = 'heartbeat';
  version = '3.0.0';
  
  private nc: any; // NATS connection
  private pool: Pool; // PostgreSQL connection pool
  private sc = StringCodec();
  private agentId: string;
  private interval: number;
  private intervalId: NodeJS.Timeout | null = null;
  
  async onLoad(context: any): Promise<void> {
    console.log('[v3.0.0] Loading Heartbeat Plugin...');
    
    // NATS 연결
    this.nc = await connect({
      servers: process.env.NATS_URL || 'nats://nats:4222',
      maxReconnectAttempts: -1,
      reconnectTimeWait: 1000,
    });
    
    // PostgreSQL 연결
    this.pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      max: 5, // 연결 풀 크기
    });
    
    // 환경변수에서 설정 읽기
    this.agentId = process.env.AGENT_ID || 'unknown';
    this.interval = parseInt(process.env.HEARTBEAT_INTERVAL || '10000'); // 10초
    
    // 하트비트 시작
    this.startHeartbeat();
    
    console.log(
      `[v3.0.0] Heartbeat started: ${this.agentId} (${this.interval}ms)`
    );
  }
  
  private startHeartbeat(): void {
    // 즉시 하트비트 전송
    this.sendHeartbeat();
    
    // 주기적 갱신
    this.intervalId = setInterval(() => {
      this.sendHeartbeat();
    }, this.interval);
  }
  
  private async sendHeartbeat(): Promise<void> {
    const now = new Date();
    
    try {
      // PostgreSQL에 하트비트 저장 (upsert)
      await this.pool.query(
        `INSERT INTO agent_heartbeats (agent_id, last_heartbeat, status)
         VALUES ($1, $2, 'active')
         ON CONFLICT (agent_id)
         DO UPDATE SET last_heartbeat = $2, status = 'active'`,
        [this.agentId, now]
      );
      
      // NATS로 하트비트 알림 발행 (경량 핑)
      const notification = {
        agentId: this.agentId,
        timestamp: now.toISOString(),
      };
      this.nc.publish(
        `heartbeat.${this.agentId}`,
        this.sc.encode(JSON.stringify(notification))
      );
      
      console.log(`[v3.0.0] Heartbeat: ${this.agentId} at ${now.toISOString()}`);
    } catch (error) {
      console.error('[v3.0.0] Heartbeat failed:', error);
      // Circuit Breaker: PostgreSQL 실패 시 spec 파일 폴백
      // (실제 구현에서는 Circuit Breaker 로직 추가)
    }
  }
  
  async onUnload(): Promise<void> {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    await this.nc.drain();
    await this.pool.end();
    console.log('[v3.0.0] Heartbeat Plugin unloaded');
  }
}
```

**v3.0.0 주요 변경**:
- ✅ PostgreSQL `agent_heartbeats` 테이블에 저장 (Redis TTL 대신)
- ✅ UPSERT로 하트비트 갱신 (`ON CONFLICT DO UPDATE`)
- ✅ NATS로 경량 알림 발행 (`heartbeat.{agentId}`)
- ✅ 연결 풀 사용 (`max: 5`)
- ❌ Redis SET/EXPIRE 제거

### 7.4 Queue Consumer Plugin (Worker용 - v3.0.0)

```typescript
// ⚠️ 로직 이해용 예시 코드 — 실제 에이전트는 .agents/agents/*.md 프롬프트로 구현
// .opencode/plugins/queue-consumer.ts

import { Plugin } from '@opencode/sdk';
import { connect, StringCodec, JetStreamClient } from 'nats';
import * as fs from 'fs/promises';
import * as yaml from 'js-yaml';

export default class QueueConsumerPlugin implements Plugin {
  name = 'queue-consumer';
  version = '3.0.0';
  
  private nc: any; // NATS connection
  private js: JetStreamClient; // JetStream client
  private sc = StringCodec();
  private workerId: string;
  private consuming: boolean = false;
  
  async onLoad(context: any): Promise<void> {
    console.log('[v3.0.0] Loading Queue Consumer Plugin...');
    
    // NATS 연결
    this.nc = await connect({
      servers: process.env.NATS_URL || 'nats://nats:4222',
      maxReconnectAttempts: -1,
      reconnectTimeWait: 1000,
    });
    
    // JetStream 클라이언트
    this.js = this.nc.jetstream();
    
    this.workerId = process.env.AGENT_ID || 'worker-unknown';
    
    // 작업 소비 시작
    this.consuming = true;
    this.consumeTasks();
    
    console.log(`[v3.0.0] Queue Consumer started: ${this.workerId}`);
  }
  
  private async consumeTasks(): Promise<void> {
    // JetStream Consumer 구독
    const consumer = await this.js.consumers.get('TASKS', 'worker-consumer');
    const messages = await consumer.consume();
    
    for await (const msg of messages) {
      if (!this.consuming) break;
      
      try {
        // v3.0.0: NATS 메시지는 경량 알림만 (spec ID)
        const notification = JSON.parse(this.sc.decode(msg.data));
        const specId = notification.specId;
        
        // spec 파일에서 상세 정보 읽기
        const task = await this.loadTaskFromSpec(specId);
        
        // 작업 처리
        await this.handleTask(task);
        
        // ACK 전송
        msg.ack();
        
      } catch (error) {
        console.error('[v3.0.0] Task consumption error:', error);
        
        // NAK (재시도)
        msg.nak();
        
        // Circuit Breaker: NATS 실패 시 spec 파일 폴백
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }
  
  private async loadTaskFromSpec(specId: string): Promise<any> {
    // v3.0.0: PVC에서 spec 파일 읽기 (단일 진실 소스)
    const specPath = `/workspace/specs/${specId}.yaml`;
    const content = await fs.readFile(specPath, 'utf-8');
    const spec = yaml.load(content) as any;
    
    return {
      id: spec.metadata.id,
      type: spec.spec.type,
      content: spec.spec.content,
      status: spec.status.phase,
    };
  }
  
  private async handleTask(task: any): Promise<void> {
    console.log(`[v3.0.0] Task received: ${task.id}`);
    
    try {
      // 1. spec 파일 상태 업데이트 (active)
      await this.updateSpecStatus(task.id, 'active', {
        workerId: this.workerId,
        startedAt: new Date().toISOString(),
      });
      
      // 2. NATS로 시작 알림
      this.nc.publish(
        `task.started.${task.id}`,
        this.sc.encode(JSON.stringify({ taskId: task.id, workerId: this.workerId }))
      );
      
      // 3. 작업 실행 (OpenCode API 호출)
      // context.executeTask(task) 등
      
      console.log(`[v3.0.0] Task completed: ${task.id}`);
      
      // 4. spec 파일 상태 업데이트 (completed)
      await this.updateSpecStatus(task.id, 'completed', {
        completedAt: new Date().toISOString(),
      });
      
      // 5. NATS로 완료 알림
      this.nc.publish(
        `task.completed.${task.id}`,
        this.sc.encode(JSON.stringify({ taskId: task.id }))
      );
      
    } catch (error) {
      console.error(`[v3.0.0] Task failed: ${task.id}`, error);
      
      // 6. spec 파일 상태 업데이트 (failed)
      await this.updateSpecStatus(task.id, 'failed', {
        error: error.message,
        failedAt: new Date().toISOString(),
      });
      
      // 7. NATS로 실패 알림 (재할당 트리거)
      this.nc.publish(
        `task.failed.${task.id}`,
        this.sc.encode(JSON.stringify({ taskId: task.id, error: error.message }))
      );
    }
  }
  
  private async updateSpecStatus(specId: string, phase: string, data: any): Promise<void> {
    // v3.0.0: spec 파일 직접 업데이트 (단일 진실 소스)
    const specPath = `/workspace/specs/${specId}.yaml`;
    const content = await fs.readFile(specPath, 'utf-8');
    const spec = yaml.load(content) as any;
    
    spec.status.phase = phase;
    spec.status = { ...spec.status, ...data };
    
    await fs.writeFile(specPath, yaml.dump(spec), 'utf-8');
  }
  
  async onUnload(): Promise<void> {
    this.consuming = false;
    await this.nc.drain();
    console.log('[v3.0.0] Queue Consumer Plugin unloaded');
  }
}
```

**v3.0.0 주요 변경**:
- ✅ NATS JetStream Consumer 사용 (`consumer.consume()`)
- ✅ spec 파일에서 상세 정보 읽기 (`loadTaskFromSpec()`)
- ✅ spec 파일 직접 업데이트 (`updateSpecStatus()`)
- ✅ `msg.ack()` / `msg.nak()` (JetStream ACK)
- ❌ Redis BRPOP/LPUSH 제거
- ❌ Redis 활성 작업 리스트 제거

### 7.5 Plugin 라이프사이클 (v3.0.0)

```mermaid
sequenceDiagram
    participant OC as OpenCode Process
    participant PL as Plugin Loader
    participant WB as Watchman Bridge
    participant HB as Heartbeat
    participant QC as Queue Consumer

    OC->>PL: 시작 → Plugin 로드
    PL->>WB: onLoad()
    WB->>WB: Watchman 초기화
    WB->>WB: NATS 연결 (v3.0.0)
    WB-->>PL: 로드 완료
    
    PL->>HB: onLoad()
    HB->>HB: PostgreSQL + NATS 연결 (v3.0.0)
    HB->>HB: 하트비트 시작
    HB-->>PL: 로드 완료
    
    PL->>QC: onLoad() (Worker만)
    QC->>QC: JetStream 구독 (v3.0.0)
    QC->>QC: 작업 소비 시작
    QC-->>PL: 로드 완료
    
    Note over OC,QC: 정상 운영 중
    
    OC->>PL: 종료 신호 (SIGTERM)
    PL->>WB: onUnload()
    WB->>WB: Watchman 종료
    WB->>WB: NATS drain (v3.0.0)
    WB-->>PL: 언로드 완료
    
    PL->>HB: onUnload()
    HB->>HB: 하트비트 중지
    HB->>HB: PostgreSQL + NATS 종료 (v3.0.0)
    HB-->>PL: 언로드 완료
    
    PL->>QC: onUnload()
    QC->>QC: 소비 중지
    QC->>QC: NATS drain (v3.0.0)
    QC-->>PL: 언로드 완료
    
    PL-->>OC: 모든 Plugin 정리 완료
```

**라이프사이클 단계**:

| 단계 | 메서드 | 호출 시점 | 용도 |
|------|-------|----------|------|
| **Load** | `onLoad(context)` | OpenCode 시작 시 | 리소스 초기화 (NATS, PostgreSQL, Watchman - v3.0.0) |
| **Runtime** | `onToolBefore`, `onToolAfter` | 도구 실행 전/후 | 로깅, 메트릭 수집 |
| **Unload** | `onUnload()` | OpenCode 종료 시 | 리소스 정리 (연결 종료, 타이머 중지) |

### 7.6 Plugin 설정 파일 예시 (v3.0.0)

```json
// ⚠️ 로직 이해용 예시 코드 — 실제 에이전트는 .agents/agents/*.md 프롬프트로 구현
// .opencode/plugins/package.json
{
  "name": "@opencode-plugins/agent-system",
  "version": "3.0.0",
  "main": "index.js",
  "dependencies": {
    "fb-watchman": "^2.0.2",
    "nats": "^2.28.0",
    "pg": "^8.13.0",
    "js-yaml": "^4.1.0"
  },
  "devDependencies": {
    "@opencode/sdk": "^1.0.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  },
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch"
  }
}
```

```json
// .opencode/opencode.config.json (v3.0.0)
{
  "plugins": [
    "./plugins/watchman-bridge.js",
    "./plugins/heartbeat-plugin.js",
    "./plugins/queue-consumer.js"
  ],
  "environment": {
    "NATS_URL": "nats://nats.agent-system.svc.cluster.local:4222",
    "POSTGRES_URL": "postgresql://user:pass@postgresql.agent-system.svc.cluster.local:5432/agents",
    "AGENT_ID": "${POD_NAME}",
    "POD_TYPE": "${POD_TYPE}",
    "HEARTBEAT_INTERVAL": "10000"
  }
}
```

**v3.0.0 변경사항**:
- ❌ `REDIS_HOST`, `REDIS_PORT` 제거
- ✅ `NATS_URL` 추가
- ✅ `POSTGRES_URL` 추가
- ❌ `HEARTBEAT_TTL` 제거 (PostgreSQL 쿼리로 처리)

### 7.7 설계 근거: 왜 Plugin으로 구현하는가?

**대안 1: 별도 프로세스**
- OpenCode와 분리된 독립 프로세스 (sidecar 컨테이너)
- 단점: IPC(Inter-Process Communication) 오버헤드, 복잡도 증가

**대안 2: OpenCode 내장**
- OpenCode 코드베이스에 직접 통합
- 단점: OpenCode 업데이트 시 충돌, 유지보수 어려움

**선택: Plugin 시스템 ✅**
- OpenCode 프로세스 내부 실행 → IPC 불필요
- OpenCode SDK 활용 → 네이티브 통합
- 독립적 업데이트 가능 → OpenCode 버전과 무관
- 환경변수 공유 → 설정 간소화

---

## 8. 모니터링 경량화 전략 (v3.0.0)

### 8.1 모니터링 아키텍처 개요 (Prometheus/Loki/Jaeger 제거)

```mermaid
graph TB
    subgraph "경량 모니터링 (v3.0.0)"
        KL[kubectl logs] --> DEV[개발자]
        K9S[k9s CLI] --> DEV
        NMON[NATS --monitor<br/>:8222/varz] --> DEV
        
        GRA[Grafana Agent<br/>(선택적, 단일 수집기)] -.-> CLOUD[클라우드 서비스<br/>Grafana Cloud, etc.]
    end
    
    subgraph "제거된 모니터링 (v2.x)"
        PROM[Prometheus<br/>512MB]
        LOKI[Loki<br/>256MB]
        JAEGER[Jaeger<br/>512MB]
        GRAF[Grafana<br/>128MB]
    end
    
    style PROM fill:#F44336,color:#fff,stroke-dasharray: 5 5
    style LOKI fill:#F44336,color:#fff,stroke-dasharray: 5 5
    style JAEGER fill:#F44336,color:#fff,stroke-dasharray: 5 5
    style GRAF fill:#F44336,color:#fff,stroke-dasharray: 5 5
    
    style KL fill:#4CAF50,color:#fff
    style K9S fill:#4CAF50,color:#fff
    style NMON fill:#FF6B6B,color:#fff
```

**v3.0.0 모니터링 철학**:
- ❌ **프로덕션 급 관찰성 제거**: Prometheus/Loki/Jaeger (총 ~1.4GB 메모리)
- ✅ **개발 환경에 적합한 경량 도구**: kubectl logs + k9s + NATS 내장 모니터링
- ✅ **선택적 클라우드 연동**: Grafana Agent로 필요 시 클라우드 서비스 활용
- ✅ **리소스 절약**: ~1GB+ 메모리 절감

**설계 근거**:
1. **개발 환경 우선**: 이 시스템은 개발 환경용 AI 에이전트 → 프로덕션 급 모니터링 불필요
2. **리소스 제약**: 4 고정 Pod + 3 Worker = 총 7 Pod → 모니터링에 추가 리소스 할당 곤란
3. **단순성 우선**: 복잡한 PromQL/LogQL 대신 kubectl/k9s로 충분
4. **NATS 내장 모니터링**: NATS 서버 자체가 `/varz`, `/connz`, `/subsz` 엔드포인트 제공

### 8.2 kubectl logs 기반 로그 확인

#### 8.2.1 기본 로그 확인 명령어

```bash
# 특정 Pod 로그 (실시간 스트리밍)
kubectl logs -f gateway-xxx -n agent-system

# 특정 Container 로그 (Pod 내 여러 Container)
kubectl logs -f coordinator-xxx -c spec-manager -n agent-system

# 최근 100줄만 확인
kubectl logs --tail=100 background-dev-xxx -n agent-system

# 특정 시간 범위 로그
kubectl logs --since=1h gateway-xxx -n agent-system
kubectl logs --since-time=2026-02-19T10:00:00Z gateway-xxx -n agent-system

# 이전 Pod 로그 (재시작 전)
kubectl logs --previous background-dev-xxx -n agent-system
```

#### 8.2.2 구조화된 JSON 로그 활용

**모든 에이전트는 JSON 형식 로그 출력 필수**:

```typescript
// ⚠️ 로직 이해용 예시 코드 — 실제 에이전트는 .agents/agents/*.md 프롬프트로 구현
// logger.ts
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// 사용 예시
logger.info({
  msg: 'Spec file updated',
  specId: 'feat-123',
  status: 'approved',
  duration: 1250,
});

// 출력:
// {"level":"info","time":"2026-02-19T10:30:45.123Z","msg":"Spec file updated","specId":"feat-123","status":"approved","duration":1250}
```

#### 8.2.3 kubectl logs + jq 조합으로 쿼리

```bash
# 특정 specId 필터링
kubectl logs gateway-xxx -n agent-system | jq 'select(.specId == "feat-123")'

# 에러 레벨만 추출
kubectl logs coordinator-xxx -n agent-system | jq 'select(.level == "error")'

# 처리 시간 1초 이상 작업만
kubectl logs background-dev-xxx -n agent-system | \
  jq 'select(.duration > 1000) | {msg, specId, duration}'

# 최근 10분간 에러 개수
kubectl logs --since=10m coordinator-xxx -n agent-system | \
  jq 'select(.level == "error")' | wc -l
```

**장점**:
- ✅ 추가 인프라 불필요 (kubectl + jq만)
- ✅ 실시간 스트리밍 지원 (`-f`)
- ✅ JSON 파싱으로 복잡한 쿼리 가능

### 8.3 k9s CLI 기반 실시간 모니터링

**k9s는 Kubernetes 클러스터를 위한 터미널 UI 도구**입니다.

#### 8.3.1 k9s 설치 및 기본 사용

```bash
# macOS
brew install derailed/k9s/k9s

# Linux
curl -sS https://webinstall.dev/k9s | bash

# k9s 실행
k9s -n agent-system
```

#### 8.3.2 k9s 핵심 기능 (v3.0.0 활용)

| 단축키 | 기능 | 설명 |
|-------|------|------|
| `:pods` | Pod 목록 | 전체 Pod 상태 확인 (Running, Pending, CrashLoop) |
| `:deploy` | Deployment | background-dev 스케일 확인 (0/0, 1/1, 3/3) |
| `:logs` | 로그 보기 | 선택한 Pod의 로그 실시간 스트리밍 |
| `:describe` | 상세 정보 | Pod 이벤트, Conditions, Volumes 확인 |
| `:exec` | Shell 접속 | `kubectl exec -it` 대체 |
| `:top` | 리소스 사용량 | CPU/Memory 실시간 확인 |
| `/` | 검색 | Pod 이름, Label로 필터링 |
| `Ctrl-A` | 네임스페이스 전환 | agent-system ↔ default |

#### 8.3.3 k9s Pulse (실시간 대시보드)

k9s는 자동으로 리소스 사용량을 시각화합니다:

```
RESOURCE                    NAMESPACE  NAME                 CPU  MEM   %CPU  %MEM
Pod                        agent-system gateway-xxx         45m  128Mi 4.5%  3.2%
Pod                        agent-system coordinator-xxx     120m 256Mi 12%   6.4%
Pod                        agent-system nats-xxx            30m  64Mi  3%    1.6%
Pod                        agent-system postgresql-xxx      80m  512Mi 8%    12.8%
Pod (background-dev)       agent-system background-dev-xxx  250m 512Mi 25%   12.8%
```

**장점**:
- ✅ 실시간 대시보드 (Grafana 없이)
- ✅ 키보드만으로 빠른 네비게이션
- ✅ 로그/이벤트/리소스 통합 뷰

### 8.4 NATS 내장 모니터링 (/varz, /connz, /subsz)

NATS 서버는 HTTP 모니터링 엔드포인트를 제공합니다 (`:8222`).

#### 8.4.1 NATS 서버 상태 (/varz)

```bash
# NATS 서버 일반 상태
curl -s http://nats.agent-system.svc.cluster.local:8222/varz | jq .

# 출력 예시:
{
  "server_id": "NDABCDEFGHIJK",
  "version": "2.10.7",
  "proto": 1,
  "go": "go1.21.5",
  "host": "0.0.0.0",
  "port": 4222,
  "max_connections": 65536,
  "ping_interval": 120000000000,
  "ping_max": 2,
  "http_port": 8222,
  "https_port": 0,
  "auth_timeout": 1,
  "max_control_line": 4096,
  "max_payload": 1048576,
  "max_pending": 67108864,
  "cluster": {},
  "gateway": {},
  "leaf": {},
  "jetstream": {
    "config": {
      "max_memory": 1073741824,
      "max_storage": 10737418240,
      "store_dir": "/data/jetstream"
    },
    "memory": 12582912,
    "storage": 104857600,
    "api": {
      "total": 1234,
      "errors": 0
    },
    "limits": {
      "max_memory": 1073741824,
      "max_storage": 10737418240,
      "max_consumers": 100,
      "max_streams": 100
    }
  },
  "now": "2026-02-19T10:30:45.123456789Z",
  "uptime": "24h15m30s",
  "mem": 52428800,
  "cores": 4,
  "cpu": 2.5,
  "connections": 7,
  "total_connections": 150,
  "routes": 0,
  "remotes": 0,
  "in_msgs": 5678,
  "out_msgs": 5678,
  "in_bytes": 1234567,
  "out_bytes": 1234567,
  "slow_consumers": 0
}
```

**핵심 메트릭**:
- `mem`: 메모리 사용량 (bytes) → 50MB 유지 확인
- `connections`: 현재 연결 수 (7 = 4 고정 Pod + 3 Worker)
- `in_msgs / out_msgs`: 메시지 처리량
- `jetstream.memory / storage`: JetStream 사용량
- `slow_consumers`: 느린 구독자 (0이어야 함)

#### 8.4.2 NATS 연결 상태 (/connz)

```bash
# 현재 연결된 클라이언트 목록
curl -s http://nats.agent-system.svc.cluster.local:8222/connz | jq .

# 출력 예시:
{
  "now": "2026-02-19T10:30:45Z",
  "num_connections": 7,
  "total": 7,
  "offset": 0,
  "limit": 1024,
  "connections": [
    {
      "cid": 1,
      "kind": "Client",
      "type": "nats",
      "ip": "10.244.1.5",
      "port": 54321,
      "start": "2026-02-19T09:00:00Z",
      "last_activity": "2026-02-19T10:30:40Z",
      "uptime": "1h30m45s",
      "idle": "5s",
      "pending_bytes": 0,
      "in_msgs": 123,
      "out_msgs": 123,
      "in_bytes": 12345,
      "out_bytes": 12345,
      "subscriptions": 1,
      "name": "gateway-pod",
      "lang": "node",
      "version": "2.10.0"
    },
    // ...
  ]
}
```

**활용**:
- 각 Pod의 NATS 연결 상태 확인
- `idle`: 마지막 활동 이후 시간 (오래되면 문제)
- `pending_bytes`: 대기 중인 바이트 (0이어야 함)

#### 8.4.3 NATS 구독 상태 (/subsz)

```bash
# 구독 목록
curl -s http://nats.agent-system.svc.cluster.local:8222/subsz | jq .

# 출력 예시:
{
  "num_subscriptions": 5,
  "total": 5,
  "subscriptions": [
    {
      "sid": "1",
      "subject": "spec.updated",
      "queue": "",
      "cid": 1,
      "msgs": 123,
      "bytes": 12345
    },
    {
      "sid": "2",
      "subject": "worker.tasks",
      "queue": "worker-group",
      "cid": 5,
      "msgs": 456,
      "bytes": 45678
    },
    // ...
  ]
}
```

**활용**:
- `subject`: 구독 중인 Subject 확인
- `queue`: Queue 그룹 (Worker는 `worker-group`)
- `msgs`: 처리한 메시지 수

### 8.5 선택적: Grafana Agent (단일 경량 수집기)

**Grafana Agent는 Prometheus + Loki + Tempo를 대체하는 단일 경량 에이전트입니다.**

#### 8.5.1 Grafana Agent vs Full Stack 비교

| 항목 | Full Stack (v2.x) | Grafana Agent (v3.0.0 선택) |
|------|-------------------|----------------------------|
| **메트릭** | Prometheus (512MB) | Grafana Agent → Grafana Cloud |
| **로그** | Loki (256MB) | Grafana Agent → Grafana Cloud |
| **추적** | Jaeger (512MB) | Grafana Agent → Grafana Cloud |
| **시각화** | Grafana (128MB) | Grafana Cloud (웹) |
| **총 메모리** | ~1.4GB | ~64MB (Agent만) |
| **비용** | 클러스터 리소스 | Grafana Cloud (무료 티어) |

#### 8.5.2 Grafana Agent 설치 (선택적)

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# k8s/monitoring/grafana-agent.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: grafana-agent
  namespace: agent-system
spec:
  selector:
    matchLabels:
      app: grafana-agent
  template:
    metadata:
      labels:
        app: grafana-agent
    spec:
      containers:
        - name: grafana-agent
          image: grafana/agent:v0.38.0
          args:
            - -config.file=/etc/agent/agent.yaml
            - -server.http.address=0.0.0.0:8080
          resources:
            requests:
              cpu: 50m
              memory: 64Mi
            limits:
              cpu: 200m
              memory: 128Mi
          volumeMounts:
            - name: config
              mountPath: /etc/agent
      volumes:
        - name: config
          configMap:
            name: grafana-agent-config
```

**설정 예시**:

```yaml
# ConfigMap: grafana-agent-config
server:
  log_level: info

metrics:
  wal_directory: /tmp/agent/wal
  global:
    scrape_interval: 60s  # 1분 (프로덕션보다 길게)
    remote_write:
      - url: https://prometheus-xxx.grafana.net/api/prom/push
        basic_auth:
          username: ${GRAFANA_CLOUD_USER}
          password: ${GRAFANA_CLOUD_API_KEY}

  configs:
    - name: agent-system
      scrape_configs:
        - job_name: 'kubernetes-pods'
          kubernetes_sd_configs:
            - role: pod
              namespaces:
                names:
                  - agent-system
          relabel_configs:
            - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
              action: keep
              regex: true

logs:
  configs:
    - name: default
      clients:
        - url: https://logs-xxx.grafana.net/loki/api/v1/push
          basic_auth:
            username: ${GRAFANA_CLOUD_USER}
            password: ${GRAFANA_CLOUD_API_KEY}
      positions:
        filename: /tmp/positions.yaml
      scrape_configs:
        - job_name: kubernetes-pods
          kubernetes_sd_configs:
            - role: pod
              namespaces:
                names:
                  - agent-system
          pipeline_stages:
            - cri: {}
            - json:
                expressions:
                  level: level
                  msg: msg
                  specId: specId
            - labels:
                level:
                specId:
```

**장점**:
- ✅ **경량**: 64MB vs 1.4GB (95% 절감)
- ✅ **단일 에이전트**: 메트릭 + 로그 + 추적 통합
- ✅ **클라우드 연동**: Grafana Cloud 무료 티어 (월 10GB 로그, 10k series)
- ✅ **선택적**: 필요 시에만 활성화

**단점**:
- ❌ 클라우드 의존성 (인터넷 연결 필요)
- ❌ Grafana Cloud 무료 티어 제한

### 8.6 모니터링 워크플로우 비교 (v2.x vs v3.0.0)

#### v2.x (Full Stack)

```
1. 로그 확인
   → Loki UI 접속 (http://loki.agent-system:3100)
   → LogQL 쿼리: {app="gateway"} |= "error"
   → 결과 확인

2. 메트릭 확인
   → Prometheus UI 접속 (http://prometheus.agent-system:9090)
   → PromQL 쿼리: rate(http_requests_total[5m])
   → 그래프 확인

3. 추적 확인
   → Jaeger UI 접속 (http://jaeger.agent-system:16686)
   → Trace ID 검색
   → Span 타임라인 확인

4. 대시보드
   → Grafana 접속 (http://grafana.agent-system:3000)
   → 사전 구성된 대시보드 확인
```

**문제점**:
- 4개 UI 접속 필요 (Loki/Prometheus/Jaeger/Grafana)
- 복잡한 쿼리 언어 (LogQL/PromQL)
- 리소스 과다 사용 (~1.4GB)

#### v3.0.0 (경량화)

```
1. 로그 확인
   → kubectl logs -f gateway-xxx | jq 'select(.level == "error")'
   → 즉시 확인

2. 메트릭 확인
   → k9s 실행 → :top 키
   → 실시간 CPU/Memory 확인
   또는
   → curl http://nats:8222/varz | jq .mem
   → NATS 메모리 확인

3. 추적 확인
   → 로그의 traceId 기반 검색
   → kubectl logs gateway-xxx | jq 'select(.traceId == "xxx")'
   → 연관 로그 확인

4. 대시보드
   → k9s 실행
   → :pods, :deploy, :logs 네비게이션
   → 실시간 확인
```

**장점**:
- ✅ 단일 터미널에서 모든 작업
- ✅ UI 접속 불필요
- ✅ 쿼리 언어 불필요 (jq만)
- ✅ 리소스 절약 (~1GB+)

### 8.7 설계 근거: 왜 Prometheus/Loki/Jaeger를 제거했는가?

#### 8.7.1 리소스 제약

**v2.x 리소스 사용량**:

| 컴포넌트 | CPU Requests | Memory Requests | Memory Limits |
|---------|--------------|-----------------|---------------|
| Prometheus | 200m | 512Mi | 1Gi |
| Loki | 100m | 256Mi | 512Mi |
| Jaeger | 200m | 512Mi | 1Gi |
| Grafana | 50m | 128Mi | 256Mi |
| **합계** | **550m** | **1.4Gi** | **2.75Gi** |

**v3.0.0 리소스 사용량**:

| 컴포넌트 | CPU Requests | Memory Requests | Memory Limits |
|---------|--------------|-----------------|---------------|
| kubectl | — | — | — |
| k9s | — | — | — |
| NATS 내장 모니터링 | — | — | — |
| Grafana Agent (선택) | 50m | 64Mi | 128Mi |
| **합계** | **50m** | **64Mi** | **128Mi** |

**절감률**: CPU 91%, Memory 95%

#### 8.7.2 복잡도 감소

| 작업 | v2.x (Full Stack) | v3.0.0 (경량화) |
|------|-------------------|----------------|
| **로그 검색** | Loki UI + LogQL | `kubectl logs \| jq` |
| **메트릭 확인** | Prometheus UI + PromQL | `k9s :top` 또는 `curl /varz` |
| **추적** | Jaeger UI + Trace ID | `kubectl logs \| jq .traceId` |
| **대시보드** | Grafana + 사전 구성 | k9s 실시간 TUI |
| **학습 곡선** | 높음 (3개 쿼리 언어) | 낮음 (kubectl + jq) |

#### 8.7.3 개발 환경 특성

**이 시스템은 개발 환경용 AI 에이전트입니다**:
- ✅ 프로덕션 SLA 불필요 (99.9% 가용성 목표 없음)
- ✅ 사용자 1~5명 (대규모 트래픽 없음)
- ✅ 디버깅 중심 (실시간 대시보드보다 로그 검색 중요)
- ✅ 비용 민감 (클라우드 리소스 최소화)

**프로덕션 환경과의 차이**:

| 항목 | 프로덕션 | 개발 환경 (이 시스템) |
|------|---------|---------------------|
| **가용성 목표** | 99.9%+ | 95%+ (허용) |
| **사용자 수** | 1,000~10,000+ | 1~5명 |
| **트래픽** | 높음 (초당 100+ req) | 낮음 (분당 1~10 req) |
| **모니터링 필요성** | 높음 (알림 필수) | 중간 (로그 확인으로 충분) |
| **비용 우선순위** | 가용성 > 비용 | 비용 > 가용성 |

**결론**: 개발 환경에서는 **kubectl + k9s + NATS 내장 모니터링**으로 충분합니다.

### 8.8 경량화 모니터링 체크리스트

#### 필수 도구 설치

- [ ] kubectl 설치 및 agent-system 네임스페이스 접근 확인
- [ ] jq 설치 (`brew install jq` 또는 `apt install jq`)
- [ ] k9s 설치 (`brew install k9s`)
- [ ] NATS CLI 설치 (`brew install nats-io/nats-tools/nats` — JetStream 관리용)

#### 기본 모니터링 설정

- [ ] 모든 Pod에 JSON 로그 출력 설정 (pino, winston 등)
- [ ] NATS 모니터링 포트 `:8222` 노출 확인
- [ ] k9s 설정 파일 생성 (`~/.config/k9s/config.yml`)

#### 일상 모니터링 워크플로우

- [ ] k9s 실행 → `:pods` → Pod 상태 확인 (Running, CrashLoop)
- [ ] k9s → `:top` → 리소스 사용량 확인 (CPU/Memory)
- [ ] `kubectl logs -f background-dev-xxx | jq` → 작업 로그 스트리밍
- [ ] `curl http://nats:8222/varz | jq .mem` → NATS 메모리 확인 (~50MB)

#### 선택적: Grafana Agent 설정

- [ ] Grafana Cloud 계정 생성 (무료 티어)
- [ ] API Key 생성 (Prometheus + Loki)
- [ ] Grafana Agent DaemonSet 배포
- [ ] Grafana Cloud에서 대시보드 확인

---

## 9. 성능 목표 및 벤치마크 (v3.0.0)

### 9.1 성능 목표 테이블 (v3.0.0)

| 메트릭 | 목표 | 측정 방법 | 도구 | 실패 시 영향 |
|--------|------|---------|------|------------|
| **Watchman 파일 감지 → NATS 발행** | < 200ms | kubectl logs 타임스탬프 차이 | kubectl + jq | 명세서 변경 반영 지연 |
| **KEDA 스케일업 (0→1 Pod)** | < 30초 | k9s 또는 kubectl 관찰 | k9s :pods | 첫 작업 시작 지연 |
| **Worker Cold Start** | < 45초 | Pod Ready까지 시간 (kubectl) | kubectl get pods -w | 작업 대기 시간 증가 |
| **하트비트 장애 감지** | < 30초 | PostgreSQL last_heartbeat 체크 | psql 쿼리 | 작업 유실 가능 |
| **작업 반환 후 재할당** | < 10초 | spec 파일 상태 변경 시간 | kubectl logs | 작업 지연 |
| **NATS Pub/Sub 레이턴시** | < 50ms | NATS 내장 메트릭 (connz) | curl :8222/connz | 이벤트 전파 지연 |
| **Circuit Breaker 복구** | < 30초 | Open → Closed 전이 시간 | kubectl logs | NATS 복구 후에도 요청 실패 |

**v3.0.0 변경사항**:
- ❌ Jaeger trace 제거 → ✅ kubectl logs 타임스탬프 활용
- ❌ Prometheus 메트릭 제거 → ✅ k9s + NATS 내장 메트릭
- ✅ Worker 최대 6→3개로 수정
- ✅ PostgreSQL 하트비트 체크

### 9.2 벤치마크 테스트 시나리오 (v3.0.0)

#### 시나리오 1: Cold Start 성능 (0 → 3 Worker)

**목표**: KEDA 스케일업 + Pod 시작 < 45초

**테스트 절차**:
```bash
# ⚠️ 로직 이해용 예시 — 실제 명령어는 구현 Phase에서 확정

# 1. 초기 상태 확인 (Worker 0개)
kubectl get pods -l app=background-dev -n agent-system
# 출력: No resources found

# 2. 작업 6개 추가 (spec 파일 생성)
for i in {1..6}; do
  cat > /workspace/specs/task-$i.yaml <<EOF
metadata:
  id: task-$i
spec:
  type: test
status:
  phase: pending
EOF
done

# 3. 시간 측정 시작
START=$(date +%s)

# 4. KEDA 스케일링 대기 (3개 Pod)
kubectl wait --for=condition=Ready pod -l app=background-dev --timeout=60s -n agent-system

# 5. 시간 측정 종료
END=$(date +%s)
DURATION=$((END - START))

echo "Cold Start Time: ${DURATION}s"
# 목표: < 45초
```

**성공 기준**:
- ✅ 45초 이내 3개 Pod Ready
- ✅ 첫 작업 시작 < 50초

#### 시나리오 2: Watchman 파일 감지 레이턴시

**목표**: 파일 변경 → NATS 발행 < 200ms

**테스트 절차**:
```bash
# ⚠️ 로직 이해용 예시 — 실제 명령어는 구현 Phase에서 확정

# 1. 로그 스트리밍 시작
kubectl logs -f gateway-xxx -n agent-system | \
  jq -r '[.time, .msg, .path] | @tsv' &

# 2. 명세서 파일 수정
echo "updated: $(date)" >> /workspace/specs/test-spec.yaml

# 3. 로그에서 타임스탬프 확인
# 예시 출력:
# 2026-02-19T10:30:45.123Z  File modified  test-spec.yaml
# 2026-02-19T10:30:45.250Z  NATS published spec.updated

# 4. 차이 계산: 250 - 123 = 127ms
```

**성공 기준**:
- ✅ `watchman-detect` < 50ms
- ✅ `nats-publish` < 10ms
- ✅ 총 duration < 200ms

#### 시나리오 3: 하트비트 장애 감지 및 재할당

**목표**: Pod Crash → 작업 재할당 < 30초

**테스트 절차**:
```bash
# ⚠️ 로직 이해용 예시 — 실제 명령어는 구현 Phase에서 확정

# 1. Worker에 작업 할당 (spec 파일 active 상태)
cat > /workspace/specs/task-999.yaml <<EOF
metadata:
  id: task-999
status:
  phase: active
  workerId: background-dev-xxx
EOF

# 2. Worker Pod 강제 종료
kubectl delete pod background-dev-xxx --force --grace-period=0 -n agent-system

# 3. 시간 측정 (하트비트 만료 ~ 재할당)
START=$(date +%s)

# 4. spec 파일이 pending으로 복귀 대기
while true; do
  PHASE=$(kubectl exec coordinator-xxx -n agent-system -- \
    cat /workspace/specs/task-999.yaml | grep 'phase:' | awk '{print $2}')
  if [ "$PHASE" = "pending" ]; then
    END=$(date +%s)
    DURATION=$((END - START))
    echo "Reassignment Time: ${DURATION}s"
    break
  fi
  sleep 1
done

# 목표: < 30초
```

**성공 기준**:
- ✅ 하트비트 만료 감지 < 30초 (PostgreSQL 체크)
- ✅ 작업 재할당 < 5초 (spec 파일 업데이트)
- ✅ 총 < 35초

---

## 10. 운영 가이드 (v3.0.0)

### 10.1 일상적인 운영 명령어 (v3.0.0)

#### KEDA 상태 확인

```bash
# ScaledObject 상태 확인
kubectl get scaledobject -n agent-system

# 출력 예시 (v3.0.0):
# NAME            SCALETARGETKIND      SCALETARGETNAME    MIN   MAX   TRIGGERS   AUTHENTICATION   READY   ACTIVE   AGE
# worker-scaler   apps/v1.Deployment   background-dev     0     3     nats       nats-auth        True    True     7d

# Worker Deployment 상태
kubectl get deployment background-dev -n agent-system

# 출력 예시:
# NAME            READY   UP-TO-DATE   AVAILABLE   AGE
# background-dev  2/2     2            2           7d

# KEDA 메트릭 확인
kubectl get hpa -n agent-system

# 출력 예시 (v3.0.0 - maxReplicas 3):
# NAME                      REFERENCE                  TARGETS     MINPODS   MAXPODS   REPLICAS   AGE
# keda-hpa-worker-scaler    Deployment/background-dev  2/2         0         3         2          7d
```

#### NATS 큐 상태 확인 (v3.0.0)

```bash
# NATS JetStream 상태 확인
nats --server=nats://nats.agent-system.svc.cluster.local:4222 \
  stream info TASKS

# 출력 예시:
# Information for Stream TASKS
# 
# Configuration:
# 
#              Subjects: worker.tasks
#      Max Messages: 1000
#         Max Bytes: unlimited
#           Max Age: 1 hour
#  
# State:
# 
#      Messages: 5
#         Bytes: 1.2 kB
#      First Seq: 1
#       Last Seq: 5
#  Active Consumers: 1

# Consumer 상태 확인
nats --server=nats://nats.agent-system.svc.cluster.local:4222 \
  consumer info TASKS worker-consumer

# 출력 예시:
# Information for Consumer TASKS > worker-consumer
#
# State:
#
#   Last Delivered Message: Consumer sequence: 3 Stream sequence: 3
#      Num Pending: 2
#     Num Redelivered: 0
#

# 대기 중인 메시지 수 (JetStream)
curl -s http://nats.agent-system.svc.cluster.local:8222/jsz | \
  jq '.streams[] | select(.name == "TASKS") | .state.messages'

# 출력 예시: 5 (5개 대기 중)
```

#### PostgreSQL 하트비트 상태 확인 (v3.0.0)

```bash
# 모든 에이전트 하트비트 상태
kubectl exec -it postgresql-xxx -n agent-system -- \
  psql -U postgres -d agents -c \
  "SELECT agent_id, last_heartbeat, status, 
   EXTRACT(EPOCH FROM (NOW() - last_heartbeat)) AS seconds_ago
   FROM agent_heartbeats ORDER BY last_heartbeat DESC;"

# 출력 예시:
#     agent_id    |      last_heartbeat       | status | seconds_ago
# ----------------+---------------------------+--------+-------------
#  gateway-xxx    | 2026-02-19 10:30:45+00    | active |         5.2
#  coordinator-xxx| 2026-02-19 10:30:43+00    | active |         7.1
#  worker-yyy     | 2026-02-19 10:30:40+00    | active |        10.3

# 죽은 에이전트 찾기 (30초 이상 하트비트 없음)
kubectl exec -it postgresql-xxx -n agent-system -- \
  psql -U postgres -d agents -c \
  "SELECT agent_id, last_heartbeat, status
   FROM agent_heartbeats
   WHERE last_heartbeat < NOW() - INTERVAL '30 seconds';"

# 출력: 죽은 Pod가 있으면 표시됨
```

#### spec 파일 상태 확인 (v3.0.0)

```bash
# 모든 spec 파일 상태 확인
kubectl exec -it coordinator-xxx -n agent-system -- \
  find /workspace/specs -name '*.yaml' -exec sh -c \
  'echo -n "$1: "; grep "^  phase:" "$1" | awk "{print \$2}"' _ {} \;

# 출력 예시:
# /workspace/specs/task-1.yaml: pending
# /workspace/specs/task-2.yaml: active
# /workspace/specs/task-3.yaml: completed

# pending 상태 spec 파일 개수
kubectl exec -it coordinator-xxx -n agent-system -- \
  grep -r "phase: pending" /workspace/specs --include="*.yaml" | wc -l

# 출력 예시: 5 (5개 대기 중)
```

### 10.2 트러블슈팅 가이드 (v3.0.0)

#### 문제 1: KEDA가 스케일업하지 않음 (v3.0.0)

**증상**:
- NATS JetStream에 메시지가 쌓여있음
- Worker Pod 수가 0개로 유지됨

**진단 절차**:

```bash
# ⚠️ 로직 이해용 예시 — 실제 명령어는 구현 Phase에서 확정

# 1. ScaledObject 상태 확인
kubectl describe scaledobject worker-scaler -n agent-system

# 출력에서 확인할 항목:
# - Status.Conditions: Ready=True, Active=True 확인
# - Events: 에러 메시지 확인

# 2. KEDA Operator 로그 확인
kubectl logs -n keda deployment/keda-operator --tail=100

# v3.0.0 에러 예시:
# "error getting metric: failed to connect to NATS"

# 3. NATS 연결 확인
nats --server=nats://nats.agent-system.svc.cluster.local:4222 stream list

# 출력: TASKS (정상)
```

**해결 방법 (v3.0.0)**:

| 원인 | 증상 | 해결 |
|------|------|------|
| **NATS 서버 다운** | 연결 실패 | NATS Pod 재시작 |
| **KEDA Operator 다운** | ScaledObject READY=False | KEDA Operator 재시작 |
| **lagThreshold 설정 오류** | 메시지 있어도 스케일업 안됨 | ScaledObject `lagThreshold` 확인 (기본 2) |
| **JetStream 미활성화** | Stream 없음 | NATS 설정 확인 (`-js` 플래그) |

**KEDA Operator 재시작**:
```bash
kubectl rollout restart deployment keda-operator -n keda
```

#### 문제 2: Watchman이 파일 변경을 감지하지 않음 (v3.0.0)

**증상**:
- 명세서 파일 수정했지만 NATS 이벤트 없음
- 에이전트가 변경 사항에 반응하지 않음

**진단 절차**:

```bash
# ⚠️ 로직 이해용 예시 — 실제 명령어는 구현 Phase에서 확정

# 1. Watchman Plugin 로그 확인
kubectl logs -n agent-system gateway-xxx -c consultant | grep watchman

# v3.0.0 정상 로그 예시:
# [v3.0.0] modified: test-spec.yaml → spec.updated

# 2. PVC 마운트 확인
kubectl exec -it coordinator-xxx -c spec-manager -n agent-system -- sh
ls -la /workspace/specs/
# 파일이 보여야 함

# 3. Watchman 감시 상태 확인
kubectl exec -it gateway-xxx -c consultant -n agent-system -- watchman watch-list
# "/workspace/docs/" 포함되어야 함

# 4. inotify 이벤트 확인 (디버깅)
kubectl exec -it gateway-xxx -c consultant -n agent-system -- sh
apk add inotify-tools
inotifywait -m /workspace/specs/

# 파일 수정 시 이벤트 출력되어야 함:
# /workspace/specs/ MODIFY test.yaml
```

**해결 방법 (v3.0.0)**:

| 원인 | 증상 | 해결 |
|------|------|------|
| **ConfigMap 볼륨 사용** | inotify 이벤트 없음 | PVC로 변경 (필수) |
| **.watchmanconfig 없음** | Watchman 시작 실패 | 프로젝트 루트에 생성 |
| **경로 오타** | watch-list에 없음 | Plugin 설정 수정 |
| **Watchman 프로세스 다운** | `ps aux` 결과 없음 | Pod 재시작 |
| **NATS 연결 끊김** | Plugin 로그에 "NATS disconnected" | NATS 재연결 대기 (자동) |

**Pod 재시작**:
```bash
kubectl delete pod gateway-xxx -n agent-system
# K8s가 자동 재시작
```

#### 문제 3: Worker가 작업을 가져가지 않음 (v3.0.0)

**증상**:
- Worker Pod는 Running 상태
- NATS JetStream에 메시지가 쌓임
- Worker가 작업을 소비하지 않음

**진단 절차**:

```bash
# ⚠️ 로직 이해용 예시 — 실제 명령어는 구현 Phase에서 확정

# 1. Worker Pod 로그 확인
kubectl logs -n agent-system background-dev-xxx --tail=100

# v3.0.0 정상 로그 예시:
# [v3.0.0] Task received: task-123
# [v3.0.0] Task completed: task-123

# v3.0.0 에러 로그 예시:
# [v3.0.0] Circuit breaker is OPEN (NATS 연결 실패)

# 2. Worker 하트비트 확인 (PostgreSQL)
kubectl exec -it postgresql-xxx -n agent-system -- \
  psql -U postgres -d agents -c \
  "SELECT agent_id, last_heartbeat FROM agent_heartbeats WHERE agent_id LIKE 'background-dev%';"

# 출력: 최근 하트비트 시간 표시 (10초 이내여야 함)

# 3. NATS JetStream Consumer 확인
nats --server=nats://nats.agent-system.svc.cluster.local:4222 \
  consumer info TASKS worker-consumer

# 출력: NumPending > 0이면 메시지가 대기 중
```

**해결 방법 (v3.0.0)**:

| 원인 | 증상 | 해결 |
|------|------|------|
| **Circuit Breaker Open** | 로그: "Circuit breaker is OPEN" | 30초 대기 (자동 복구) |
| **NATS 연결 실패** | 로그: "NATS disconnected" | NATS 서버 확인, 자동 재연결 대기 |
| **spec 파일 읽기 실패** | 로그: "Failed to load spec" | PVC 마운트 확인 |
| **Worker Crash Loop** | `kubectl get pods` CrashLoopBackOff | 로그에서 에러 확인 |

**Circuit Breaker 강제 리셋** (긴급 시):
```bash
kubectl delete pod background-dev-xxx -n agent-system
# 새 Pod 시작 → Circuit Closed 상태
```

---

## 11. 버전 정보 (v3.0.0)

### 11.1 버전 히스토리

#### v3.0.0 (2026-02-19) - 경량화 및 NATS 전환

**주요 변경사항**:
- ✅ **Redis → NATS Core 전환**: 메시지 큐 및 Pub/Sub
- ✅ **spec 파일 중심 설계**: YAML 파일을 단일 진실 소스로 사용
- ✅ **PostgreSQL 하트비트**: Redis TTL 대신 PostgreSQL 타임스탬프
- ✅ **Pod 통합**: 7개 → 4개 고정 Pod (gateway, coordinator, nats, postgresql)
- ✅ **Worker 축소**: 최대 6개 → 3개
- ✅ **모니터링 경량화**: Prometheus/Loki/Jaeger/Grafana 제거 → kubectl + k9s + NATS 내장

**리소스 절감**:
- 메모리: ~3GB 절감 (총 8GB 중 2.75GB 사용, 34%)
- CPU: 3.65 코어 → 1.35 코어 (63% 절감)
- 모니터링 스택: ~1GB 절감

**Breaking Changes**:
- ❌ Redis 완전 제거 → NATS Core 필수
- ❌ Prometheus/Loki/Jaeger/Grafana 제거 → kubectl/k9s 필수
- ❌ 시간대별 스케일링 제외 (v4에서 재검토)
- ❌ 7개 개별 Pod → 4개 멀티 컨테이너 Pod

**마이그레이션 가이드**:
1. NATS Server 배포 (`:4222` + JetStream 활성화)
2. PostgreSQL 배포 + `agent_heartbeats` 테이블 생성
3. OpenCode Plugin 업데이트 (`ioredis` → `nats`)
4. KEDA ScaledObject 수정 (`redis` → `nats` trigger)
5. Prometheus/Loki/Jaeger/Grafana 리소스 제거
6. kubectl/k9s/jq 도구 설치

#### v2.0.0 (2026-01-15) - Redis 기반 구현

**주요 변경사항**:
- ✅ Redis 메시지 큐 및 Pub/Sub
- ✅ KEDA Redis List Scaler
- ✅ Prometheus + Loki + Jaeger + Grafana 모니터링
- ✅ 7개 개별 Pod (doc-manager, project-lead, reviewer, junior, Worker × 0~6)
- ✅ Worker 최대 6개

**리소스 사용**:
- 메모리: ~5.15GB (고정 1.4Gi + Worker 3.75Gi)
- CPU: ~4.2 코어
- 모니터링 스택: ~1.4GB

#### v1.0.0 (2025-12-01) - 초기 설계

**주요 변경사항**:
- ✅ 파일 감지 시스템 (Watchman + inotify)
- ✅ 하트비트 시스템 (Redis TTL 기반)
- ✅ Circuit Breaker 패턴
- ✅ KEDA 오토스케일링 (0~6 Worker, Redis List 기반)

### 11.2 의존성 버전

| 컴포넌트 | v1.0.0 | v2.0.0 | v3.0.0 |
|---------|--------|--------|--------|
| **메시지 큐** | — | Redis 7.2 | NATS Core 2.10+ |
| **데이터베이스** | — | — | PostgreSQL 16 + pgvector |
| **KEDA** | 2.12 | 2.12 | 2.12 |
| **Watchman** | 2023.01 | 2023.01 | 2023.01 |
| **Kubernetes** | 1.28+ | 1.28+ | 1.28+ |
| **모니터링** | kubectl | Prometheus 2.48<br/>Loki 2.9<br/>Jaeger 1.52<br/>Grafana 10.2 | kubectl + k9s<br/>NATS 내장<br/>Grafana Agent (선택) |

### 11.3 v3.0.0 vs v2.0.0 비교

| 항목 | v2.0.0 (Redis) | v3.0.0 (NATS) | 개선 |
|------|----------------|---------------|------|
| **메시지 큐 메모리** | 100~300MB | ~50MB | ✅ 150MB 절감 |
| **메시지 크기** | JSON 전체 (~5KB) | 알림만 (~100 bytes) | ✅ 98% 감소 |
| **단일 진실 소스** | Redis | spec 파일 (YAML) | ✅ 파일 시스템 |
| **하트비트 저장소** | Redis (TTL) | PostgreSQL (timestamp) | ✅ SQL 쿼리 가능 |
| **Pod 개수** | 7개 | 4개 | ✅ 3개 절감 |
| **Worker 최대** | 6개 | 3개 | ✅ 리소스 효율 |
| **모니터링 메모리** | ~1.4GB | ~64MB (선택) | ✅ 95% 절감 |
| **자동 재연결** | 수동 구현 | NATS 내장 | ✅ 코드 간소화 |
| **JetStream** | — | ✅ 지원 | ✅ 메시지 보장 |

### 11.4 v4.0.0 로드맵 (예정)

**계획 중인 기능**:
- ⏳ 시간대별 스케일링 재도입 (CronSchedule)
- ⏳ Worker 최대 3→6개 확장 (리소스 여유 시)
- ⏳ NATS Cluster (고가용성)
- ⏳ Grafana Cloud 기본 연동
- ⏳ 분산 추적 (OpenTelemetry)
- ⏳ 메트릭 수집 (선택적)

**조건**:
- 8GB → 16GB 리소스 확장 시
- 프로덕션 환경 요구사항 발생 시

---

## 12. 참고 문서

### 12.1 내부 문서

- [multi-agent-system.md](./multi-agent-system.md) - 전체 시스템 아키텍처
- [async-communication.md](./async-communication.md) - NATS 통신 프로토콜 (v3.0.0)
- [agent-roles.md](./agent-roles.md) - 에이전트 역할 정의
- [k8s-isolation.md](./k8s-isolation.md) - Pod 격리 및 보안
- [spec-system.md](./spec-system.md) - spec 파일 시스템 상세 (v3.0.0)

### 12.2 외부 문서

**NATS (v3.0.0)**:
- [NATS Documentation](https://docs.nats.io/)
- [NATS JetStream](https://docs.nats.io/nats-concepts/jetstream)
- [NATS Monitoring](https://docs.nats.io/running-a-nats-service/nats_admin/monitoring)

**KEDA**:
- [KEDA Documentation](https://keda.sh/docs/)
- [NATS JetStream Scaler](https://keda.sh/docs/2.12/scalers/nats-jetstream/) (v3.0.0)

**Watchman**:
- [Watchman Documentation](https://facebook.github.io/watchman/)
- [Watchman Install Guide](https://facebook.github.io/watchman/docs/install.html)

**Kubernetes**:
- [K8s Horizontal Pod Autoscaler](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)
- [K8s Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)

**모니터링 (v3.0.0)**:
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [k9s Documentation](https://k9scli.io/)
- [jq Manual](https://stedolan.github.io/jq/manual/)
- [Grafana Agent](https://grafana.com/docs/agent/latest/) (선택적)

---

**문서 끝** — v3.0.0 (2026-02-19)

