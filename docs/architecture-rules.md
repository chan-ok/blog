# 아키텍처 규칙

## 레이어 방향

```text
app → features → entities → shared
```

| 레이어     | 책임                        | import 가능                      |
| ---------- | --------------------------- | -------------------------------- |
| `app`      | 진입점, 라우트, 페이지 조합 | `features`, `entities`, `shared` |
| `features` | 사용자 기능과 도메인 흐름   | `entities`, `shared`             |
| `entities` | Markdown 모델·파싱·렌더링   | `shared`                         |
| `shared`   | 범용 UI·로케일·유틸         | 다른 상위 레이어 없음            |

상위 레이어 import와 순환 의존성을 만들지 않습니다. 여러 레이어가 필요로 하는 코드는 실제 책임에 맞는 가장 낮은 레이어로 옮깁니다.

## 경로 별칭

레이어를 넘는 import는 `@/` 별칭을 사용합니다.

```typescript
import { fetchTextWithLimit } from '@/shared/util/fetch-limited';
import MDComponent from '@/entities/markdown';
```

같은 feature나 entity 내부의 가까운 모듈은 상대 경로를 사용할 수 있습니다.

```typescript
import { isPostVisible } from './post-visibility';
```

이전 숫자 접두사 경로(`@/1-entities`, `@/2-features`, `@/5-shared`)는 존재하지 않으므로 사용하지 않습니다.

## 배치 기준

- 라우트 loader, head, 페이지 조합은 `src/app/routes`에 둡니다.
- 포스트 공개성·목록·목차처럼 사용자 기능은 `src/features/post`에 둡니다.
- Markdown 형식 자체의 파싱·렌더링은 `src/entities/markdown`에 둡니다.
- 특정 도메인을 모르는 공통 코드는 `src/shared`에 둡니다.

## 변경 체크

- 새 import가 의존성 방향을 거스르지 않는가?
- `shared`가 포스트나 Markdown 도메인을 알게 되지 않았는가?
- 라우트 전용 코드가 feature/entity로 새어 나오지 않았는가?
- 기존 공개 모듈이나 유틸을 중복 구현하지 않았는가?
