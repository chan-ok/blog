# Dependency Rules Guide

## 🔗 Inter-Layer Dependency Direction

### Dependency Layer Structure

```
┌─────────────────────────────────────────┐
│                App Layer                │  ← Top layer
│     (Application initialization, providers)     │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│               Pages Layer               │
│        (Routing, page components)       │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│              Features Layer             │
│       (Business logic, user features)   │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│             Entities Layer              │
│         (Domain models, data management) │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│              Shared Layer               │  ← Bottom layer
│         (Common resources, utilities)    │
└─────────────────────────────────────────┘
```

### Core Principles

1. **Upper → Lower**: Upper layers can depend on lower layers
2. **Lower ↛ Upper**: Lower layers must not depend on upper layers
3. **Same Layer**: Careful dependency management required

## ✅ Allowed Dependency Patterns

### App Layer Dependencies
```typescript
// ✅ Can use all lower layers
import { router } from '@/shared/config/routeTree.gen';    // Shared
import { queryClient } from '@/shared/config/queryClient'; // Shared
import { useAuth } from '@/entities/user/hooks/useAuth';   // Entities
import { PostListPage } from '@/pages/posts';             // Pages
```

### Pages Layer Dependencies
```typescript
// ✅ Can use Features, Entities, Shared
import { PostList } from '@/features/post-list/components/PostList';      // Features
import { usePostList } from '@/entities/post/hooks/usePost';               // Entities
import { PageHeader } from '@/shared/components/PageHeader';               // Shared

// ❌ App Layer dependency forbidden
// import { App } from '@/app/App'; // Forbidden!
```

### Features Layer Dependencies
```typescript
// ✅ Can use Entities, Shared
import { useUserInfo } from '@/entities/user/hooks/useUser';  // Entities
import { Button } from '@/shared/components/ui/button';       // Shared
import { formatDate } from '@/shared/utils/date';             // Shared

// ❌ Pages, App Layer dependency forbidden
// import { HomePage } from '@/pages/index'; // Forbidden!
// import { App } from '@/app/App';          // Forbidden!
```

### Entities Layer Dependencies
```typescript
// ✅ Only Shared Layer allowed
import { supabase } from '@/shared/config/supabase';      // Shared
import { dateUtils } from '@/shared/utils/date';          // Shared

// ❌ Features, Pages, App Layer dependency forbidden
// import { PostForm } from '@/features/post-editor/components/PostForm'; // Forbidden!
// import { PostListPage } from '@/pages/posts';                          // Forbidden!
```

### Shared Layer Dependencies
```typescript
// ✅ Only external libraries allowed
import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';

// ❌ All internal layer dependencies forbidden
// import { User } from '@/entities/user/model/types'; // Forbidden!
// import { PostForm } from '@/features/post-editor';  // Forbidden!
```

## 🚫 Forbidden Dependency Patterns

### Reverse Dependencies (Most Important!)
```typescript
// ❌ Shared → Entities (Forbidden)
// shared/utils/blogUtils.ts
import { Post } from '@/entities/post/model/types'; // Forbidden!

// ❌ Entities → Features (Forbidden)
// entities/user/hooks/useAuth.ts
import { LoginForm } from '@/features/auth/components/LoginForm'; // Forbidden!

// ❌ Features → Pages (Forbidden)
// features/post-list/components/PostList.tsx
import { PostListPage } from '@/pages/posts'; // Forbidden!
```

### Circular Dependencies
```typescript
// ❌ Circular dependency forbidden
// features/auth/hooks/useLogin.ts
import { validateUser } from '@/features/user-validation/utils/validation';

// features/user-validation/utils/validation.ts
import { loginState } from '@/features/auth/hooks/useLogin'; // Circular dependency!
```

## 🔄 Same-Layer Dependency Management

### Inter-Feature Dependencies (Use Carefully)
```typescript
// ✅ Allow only when clear relationship exists
// features/post-editor/components/Editor.tsx
import { checkUserPermission } from '@/features/auth/utils/permissions'; // OK

// ❌ Avoid tight coupling
// features/post-list/components/List.tsx
import { editorState } from '@/features/post-editor/hooks/useEditor'; // Avoid
```

### Inter-Entity Dependencies (Minimize)
```typescript
// ✅ Only when clear relationship exists
// entities/post/model/types.ts
import { User } from '@/entities/user/model/types'; // OK (author relationship)

// ❌ Unnecessary coupling
// entities/tag/hooks/useTag.ts
import { userSettings } from '@/entities/user/hooks/useSettings'; // Avoid
```

## 🛠️ Dependency Management Tools and Patterns

### 1. Dependency Injection Pattern
```typescript
// ✅ Receive dependencies as parameters
export function createPostService(
  postAPI: typeof postAPI,
  userService: typeof userService
) {
  return {
    createNewPost: async (postData: PostCreateInput) => {
      const currentUser = await userService.getCurrentUser();
      return postAPI.createPost({ ...postData, authorId: currentUser.id });
    }
  };
}
```

### 2. Event-Based Communication
```typescript
// ✅ Inter-layer communication via events
// shared/events/blogEvents.ts
export const blogEvents = {
  postPublished: 'post-published',
  postDeleted: 'post-deleted',
} as const;

// Dispatch event in features/post-editor
document.dispatchEvent(new CustomEvent(blogEvents.postPublished, { detail: postInfo }));

// Listen to event in features/post-list
useEffect(() => {
  const handler = () => refreshPostList();
  document.addEventListener(blogEvents.postPublished, handler);
  return () => document.removeEventListener(blogEvents.postPublished, handler);
}, []);
```

### 3. Abstraction for Dependency Separation
```typescript
// shared/interfaces/blogAPI.ts
export interface BlogAPIInterface {
  getPostList(condition: PostListCondition): Promise<PostListResponse>;
  createPost(data: PostCreateInput): Promise<Post>;
}

// entities/post/api/postAPI.ts
export const postAPI: BlogAPIInterface = {
  getPostList,
  createPost,
};

// Depend on interface in features
import type { BlogAPIInterface } from '@/shared/interfaces/blogAPI';
```

## 📊 Dependency Validation Methods

### 1. ESLint Rule Configuration
```json
// .eslintrc.js
{
  "rules": {
    "@typescript-eslint/no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": ["../../../*"],
            "message": "Deep relative paths are forbidden. Use @/ absolute paths."
          }
        ]
      }
    ]
  }
}
```

### 2. Dependency Analysis Tools
```bash
# Dependency visualization
npx madge --image deps.png --extensions ts,tsx src/

# Circular dependency check
npx madge --circular --extensions ts,tsx src/
```

### 3. Code Review Checklist
- [ ] Are import statements from the correct layers?
- [ ] Are there no reverse dependencies?
- [ ] Are there no circular dependencies?
- [ ] Are same-layer dependencies minimized?
- [ ] Do dependencies have clear responsibilities?

## 🎯 Practical Application Guide

### Checklist for New Feature Development
1. **Determine Starting Point**: Decide which layer to start from
2. **Plan Dependencies**: Identify required lower layer resources
3. **Design Interfaces**: Loose coupling through abstraction
4. **Write Tests**: Make testable through dependency injection

### Refactoring Considerations
1. **Layer Movement**: Review if features are in appropriate layers
2. **Dependency Cleanup**: Remove unnecessary dependencies
3. **Introduce Abstraction**: Add interfaces at tight coupling points
4. **Maintain Tests**: Ensure tests pass after refactoring

Following these dependency rules will help you build a maintainable and scalable architecture.