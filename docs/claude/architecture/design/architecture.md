# Architecture Guide

## 📚 Architecture Documentation Index

This project uses **Feature Slice Design (FSD)** based architecture. Check detailed guides by topic.

### 📖 Core Architecture Documents

| Document | Description |
|----------|-------------|
| **[Architecture Overview](../overview.md)** | FSD-based architecture philosophy, layer structure, dependency rules |
| **[Folder Structure](../folder-structure.md)** | Detailed folder structure, layer responsibilities, naming conventions |
| **[Dependency Rules](../dependency-rules.md)** | Inter-layer dependency directions, allowed/forbidden patterns, management tools |

### 🎨 Implementation Guide Documents

| Document | Description |
|----------|-------------|
| **[Responsive Design](../responsive-design.md)** | Mobile-first design, breakpoint definitions, touch interfaces |
| **[Performance Optimization](../performance.md)** | Code splitting, rendering optimization, image/network optimization |
| **[UI/UX Guidelines](../ui-ux-guidelines.md)** | Design system, accessibility considerations, mobile UX patterns |

## 🚀 Quick Start Guide

### 1️⃣ New Developer Onboarding
```bash
# 1. Install dependencies
pnpm install

# 2. Start development server
pnpm dev

# 3. Run tests
pnpm test
```

### 2️⃣ Pre-Development Required Reading
- [ ] [Architecture Overview](../overview.md) - Understanding FSD
- [ ] [Folder Structure](../folder-structure.md) - File placement rules
- [ ] [Dependency Rules](../dependency-rules.md) - Inter-layer rules

### 3️⃣ New Feature Development Workflow
1. Start feature design in **Features Layer**
2. Define necessary **Entities Layer** domain models
3. Implement **Shared Layer** common components/utilities
4. Connect routing in **Pages Layer**

## 🎯 Layer Structure Overview

```
App Layer      ← Application initialization, global configuration
  ↓
Pages Layer    ← File-based routing, page components
  ↓
Features Layer ← Business logic, user features
  ↓
Entities Layer ← Domain models, data management
  ↓
Shared Layer   ← Common resources, utilities
```

**Core Dependency Rule:** Dependencies only allowed from upper → lower layers

## 📁 Feature-specific Documentation Locations

For detailed implementation guides of each feature, refer to the respective `CLAUDE.md` files:

### Features Layer
- [`src/features/auth/CLAUDE.md`](../../../src/features/auth/CLAUDE.md) - Authentication system
- [`src/features/post/editor/CLAUDE.md`](../../../src/features/post/editor/CLAUDE.md) - Post creation/editing
- [`src/features/post/list/CLAUDE.md`](../../../src/features/post/list/CLAUDE.md) - Post list
- [`src/features/markdown-viewer/CLAUDE.md`](../../../src/features/markdown-viewer/CLAUDE.md) - Markdown viewer

### Entities Layer
- [`src/entities/user/CLAUDE.md`](../../../src/entities/user/CLAUDE.md) - User domain
- [`src/entities/post/CLAUDE.md`](../../../src/entities/post/CLAUDE.md) - Post domain
- [`src/entities/tag/CLAUDE.md`](../../../src/entities/tag/CLAUDE.md) - Tag domain

## 🔗 Related Documents

| Document | Purpose |
|----------|---------|
| [`docs/claude/development/process/develop-process.md`](../../development/process/develop-process.md) | TDD-based development process |
| [`docs/claude/development/guides/testing-strategy.md`](../../development/guides/testing-strategy.md) | Testing strategy and tools |
| [`docs/claude/architecture/design/data-flow.md`](./data-flow.md) | Supabase integration patterns |

---

> 💡 **Note**: This document serves as an index. Refer to detailed documents for specific implementation methods.