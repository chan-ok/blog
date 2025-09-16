# Modern Blog Platform

**English** | [한국어](./README.ko.md) | [日本語](./README.jp.md)

A modern blog application built with React 19 + TypeScript + Supabase.

## ✨ Key Features

- **Feature Slice Design (FSD)** architecture implementation
- **English-first development** - All code identifiers written in English
- **Markdown support** - Blog post writing with syntax highlighting
- **Real-time database** - Authentication and data management via Supabase
- **Responsive design** - Tailwind CSS v4 + shadcn/ui

## 🚀 Getting Started

### Environment Setup

```bash
pnpm install
pnpm start
```

### Production Build

```bash
pnpm build
```

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Build**: Vite
- **Routing**: TanStack Router (file-based)
- **State Management**: TanStack Query
- **Backend**: Supabase (Auth, Database, Storage)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Testing**: Vitest + Testing Library
- **Linting**: Biome

## 📁 Project Structure

```
src/
├── app/              # Application layer
├── pages/            # Pages layer
├── features/         # Features layer
├── entities/         # Entities layer
├── shared/           # Shared layer
└── routes/           # TanStack Router files
```

## 🧪 Testing & Validation

```bash
pnpm test              # Run Vitest tests
pnpm lint              # Biome linting
pnpm format            # Code formatting
pnpm check             # Type checking
```

## 📚 Development Guide

This project follows **English-first development** principles. For detailed development guides, refer to the following documentation:

### Core Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Complete project guide
- **[Architecture Guide](./docs/claude/architecture/)** - FSD architecture detailed explanation
- **[Development Process](./docs/claude/guides/)** - TDD development workflow
- **[Code Format](./docs/claude/guides/)** - English naming conventions
- **[Data Flow](./docs/claude/guides/)** - Supabase integration guide

### Layer-specific Guides

- **[Entities Layer](./src/entities/CLAUDE.md)** - Domain model definitions
- **[Features Layer](./src/features/CLAUDE.md)** - UI and business logic

## 🎯 Development Principles

1. **English Code**: All variable names, function names in English, comments in Korean
2. **TDD**: Test-Driven Development (Red → Green → Refactor)
3. **FSD Architecture**: Layer separation and dependency rules compliance
4. **Type Safety**: Strict type checking with TypeScript

This project implements file-based routing using TanStack Router. Adding files to the `src/routes` folder automatically creates routes.

## 🌐 Key Pages

- **Home**: Latest blog posts list
- **Post Detail**: Markdown rendering and comment system
- **Post Create/Edit**: Real-time preview editor
- **Admin**: User and content management

## 🔧 Environment Variables

```bash
# .env.local
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🤝 Contributing

1. Create issue or check existing issues
2. Create feature branch: `git checkout -b feature/new-feature`
3. Follow TDD development process
4. Write tests and ensure they pass
5. Create pull request

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.