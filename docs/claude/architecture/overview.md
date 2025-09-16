# Architecture Overview

## 🎯 Overall Architecture Philosophy

This project is built upon **Feature Slice Design (FSD)** architecture and follows these principles:

### Core Principles
1. **Scalability**: Structure that facilitates easy feature addition
2. **Maintainability**: Flexible response to changes
3. **Type Safety**: Leveraging TypeScript strict mode
4. **Testability**: Supporting TDD-based development

### Architecture Layer Structure

```
App Layer      → Application initialization and global configuration
Pages Layer    → Routing and page components
Features Layer → Business logic and feature implementation
Entities Layer → Domain models and data management
Shared Layer   → Common resources and utilities
```

### Dependency Rules

```
App → Pages → Features → Entities → Shared
   ↖    ↖        ↖         ↖
    └────┴────────┴─────────┘
```

- **Upper layers** can depend on lower layers
- **Lower layers** must not depend on upper layers
- **Same layer** dependencies require careful management

## 📁 Project Root Structure

```
my-blog/
├── src/                    # Source code
│   ├── app/               # Application layer
│   ├── pages/             # Pages layer
│   ├── features/          # Features layer
│   ├── entities/          # Entities layer
│   └── shared/            # Shared layer
├── docs/                  # Documentation
├── public/                # Static files
├── supabase/             # Supabase configuration
└── Configuration files...
```

## 🔄 Data Flow

```
User Input → Features → Entities → Supabase
     ↓           ↓         ↓         ↑
   UI Update ← TanStack Query ← API Response
```

## 📚 Detailed Guide Links

For detailed information about each layer, refer to the following documents:

- **[Folder Structure Guide](./folder-structure.md)** - Folder structure for each layer
- **[Dependency Rules](./dependency-rules.md)** - Inter-layer dependency management
- **[Responsive Design](./responsive-design.md)** - Responsive web implementation guide
- **[Performance Optimization](./performance.md)** - Rendering and bundle optimization
- **[UI/UX Guidelines](./ui-ux-guidelines.md)** - Design system and accessibility

## ⚡ Quick Start

1. **Start Development**: `pnpm dev`
2. **Add New Features**: Start from Features Layer
3. **Domain Models**: Define in Entities Layer
4. **Common Components**: Implement in Shared Layer
5. **Page Connection**: Handle routing in Pages Layer

Refer to the detailed guides for specific implementation methods.