# Folder Structure Guide

## 📁 Detailed Folder Structure

### src/ Directory Complete Structure

```
src/
├── app/                    # Application initialization and providers
│   ├── main.tsx           # App entry point
│   └── styles.css         # Global styles
├── pages/                  # Routing (TanStack Router file-based)
│   ├── __root.tsx         # Root layout
│   ├── index.tsx          # Homepage
│   ├── about/
│   │   ├── index.tsx      # About page
│   │   └── resume.tsx     # Resume (nested routing)
│   ├── posts/
│   │   ├── index.tsx      # Blog post list
│   │   └── $slug.tsx      # Individual post detail
│   ├── tags/
│   │   ├── index.tsx      # Tag list
│   │   └── $tagName.tsx   # Posts by specific tag
│   ├── contact.tsx        # Contact
│   └── admin/             # Admin pages
│       ├── index.tsx      # Admin dashboard
│       ├── write.tsx      # Post creation
│       ├── manage.tsx     # Post management
│       └── settings.tsx   # Settings
├── shared/                 # Shared resources
│   ├── components/        # Reusable components
│   │   ├── ui/           # shadcn/ui base components
│   │   │   └── button.tsx
│   │   ├── Header.tsx    # Common header
│   │   ├── Footer.tsx    # Common footer
│   │   ├── PostCard.tsx  # Post card component
│   │   └── index.ts      # Export collection
│   ├── config/           # Configuration files
│   │   ├── supabase.ts   # Supabase configuration
│   │   └── i18n.ts       # Internationalization configuration
│   ├── utils/            # Utility functions
│   │   ├── date.ts       # Date-related
│   │   ├── string.ts     # String-related
│   │   └── index.ts      # Export collection
│   ├── types/            # Common type definitions
│   │   └── index.ts
│   └── data/             # Sample data
│       └── sampleData.ts
├── entities/              # Data entities (domain models)
│   ├── user/             # User entity
│   │   ├── CLAUDE.md
│   │   ├── model/
│   │   │   ├── types.ts
│   │   │   └── validation.ts
│   │   ├── api/
│   │   │   └── userAPI.ts
│   │   └── hooks/
│   │       └── useUser.ts
│   ├── post/             # Post entity
│   │   └── [same structure as user]
│   └── tag/              # Tag entity
│       └── [same structure as user]
└── features/              # Feature units
    ├── auth/             # Authentication feature
    │   ├── CLAUDE.md
    │   ├── components/
    │   ├── hooks/
    │   └── utils/
    ├── post/
    │   ├── editor/       # Post creation/editing
    │   └── list/         # Post list
    └── markdown-viewer/  # Markdown rendering
        ├── CLAUDE.md
        ├── components/
        ├── hooks/
        └── utils/
```

## 🏗️ Layer Responsibilities

### App Layer (`src/app/`)
- **Purpose**: Application initialization, global providers
- **Responsibilities**:
  - Root component setup
  - Global state providers (QueryClient, Router, Theme)
  - Global CSS imports
- **Dependencies**: Can access all lower layers

### Pages Layer (`src/pages/`)
- **Purpose**: Routing and page components
- **File-based routing**: TanStack Router automatically generates routes
- **Responsibilities**:
  - Page layouts and composition
  - Route-specific logic
  - SEO metadata management
- **Dependencies**: Features, Entities, Shared

### Features Layer (`src/features/`)
- **Purpose**: Business logic and user features
- **Structure**: Each feature has its own folder with components, hooks, utils
- **Responsibilities**:
  - User interaction logic
  - Feature-specific state management
  - UI component composition
- **Dependencies**: Entities, Shared

### Entities Layer (`src/entities/`)
- **Purpose**: Domain models and data management
- **Structure**: Each entity has model, api, hooks folders
- **Responsibilities**:
  - Type definitions
  - API functions
  - Data validation
  - TanStack Query hooks
- **Dependencies**: Shared only

### Shared Layer (`src/shared/`)
- **Purpose**: Common resources and utilities
- **Responsibilities**:
  - Reusable UI components
  - Utility functions
  - Configuration
  - Global types
- **Dependencies**: External libraries only

## 📝 Naming Conventions

### Files and Folders
- **Folders**: kebab-case (e.g., `post-editor`, `user-profile`)
- **Components**: PascalCase (e.g., `PostCard.tsx`, `UserProfile.tsx`)
- **Hooks**: camelCase starting with 'use' (e.g., `useUser.ts`, `usePostList.ts`)
- **Utilities**: camelCase (e.g., `formatDate.ts`, `validateEmail.ts`)
- **Types**: PascalCase (e.g., `types.ts` contains `User`, `Post` interfaces)

### Code Identifiers
- **Variables**: camelCase (e.g., `userName`, `postList`)
- **Functions**: camelCase (e.g., `getUserData`, `createPost`)
- **Interfaces**: PascalCase (e.g., `User`, `PostCreateInput`)
- **Types**: PascalCase (e.g., `UserRole`, `PostStatus`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `API_ENDPOINTS`, `DEFAULT_PAGE_SIZE`)

## 🔧 Import/Export Patterns

### Barrel Exports
```typescript
// src/shared/components/index.ts
export { Header } from './Header';
export { Footer } from './Footer';
export { PostCard } from './PostCard';

// Usage in other files
import { Header, Footer } from '@/shared/components';
```

### Entity Exports
```typescript
// src/entities/user/index.ts
export type { User, UserRole, LoginInput } from './model/types';
export { useUser, useLogin } from './hooks/useUser';
export { validateEmail, validatePassword } from './model/validation';
```

### Feature Exports
```typescript
// src/features/auth/index.ts
export { LoginForm } from './components/LoginForm';
export { useAuthForm } from './hooks/useAuthForm';
export { AuthGuard } from './utils/AuthGuard';
```

## 📍 Path Aliases

Configuration in `vite.config.ts`:
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@/app': path.resolve(__dirname, './src/app'),
    '@/pages': path.resolve(__dirname, './src/pages'),
    '@/features': path.resolve(__dirname, './src/features'),
    '@/entities': path.resolve(__dirname, './src/entities'),
    '@/shared': path.resolve(__dirname, './src/shared'),
  },
}
```

Usage examples:
```typescript
import { supabase } from '@/shared/config/supabase';
import { User } from '@/entities/user/model/types';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { Header } from '@/shared/components/Header';
```

## 📋 Best Practices

1. **Single Responsibility**: Each folder should have a clear, single purpose
2. **Consistent Structure**: Follow the same internal structure for all entities/features
3. **Clear Dependencies**: Never import from upper layers to lower layers
4. **Logical Grouping**: Group related functionality within the same feature/entity
5. **Export Management**: Use barrel exports for clean import statements
6. **Path Aliases**: Always use path aliases for better maintainability
7. **Documentation**: Each major folder should have a CLAUDE.md file explaining its purpose

This structure ensures scalability, maintainability, and clear separation of concerns.