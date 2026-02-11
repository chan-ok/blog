> 이 문서의 상위 문서: [agents.md](./agents.md)

# 아키텍처 규칙

## FSD 레이어 의존성

### 지시사항

```
pages → widgets → features → entities → shared
```

- **4-pages/**: 라우팅, widgets/features/entities/shared import 가능
- **3-widgets/**: 복합 UI, features/entities/shared import 가능
- **2-features/**: 비즈니스 기능, entities/shared만 import 가능
- **1-entities/**: 도메인 엔티티, shared만 import 가능
- **5-shared/**: 공유 리소스, 다른 레이어 import 불가

### 주의사항

- ❌ **역방향 import 금지** (예: 5-shared → 2-features)
- ❌ **features/ 간 import 금지** (예: 2-features/post → 2-features/contact)
- ❌ **features/ 내부에서 widgets/ import 금지**

## 경로 별칭

```typescript
// ✅ Good - 절대 경로 사용
import { Button } from '@/5-shared/components/ui/button';
import { formatDate } from '@/5-shared/util/date-utils';

// ❌ Bad - 상대 경로
import { Button } from '../../../5-shared/components/ui/button';
```
