# CLAUDE.md

This file provides the guide needed when Claude Code (claude.ai/code) works in this repository.

## 🚨 Important: Coding Rules

**⚠️ Code identifiers must be written in English!**

- ✅ **Write in English**: Function names, variable names, class names, interface names, type names, property names
- ✅ **Write in Korean**: Comments, documentation, commit messages, UI text, error messages
- ❌ **Prohibited**: Using Korean identifiers like `사용자`, `로그인하기`, `이메일`

**Examples:**
```typescript
// ❌ Wrong example
interface 사용자 {
  이메일: string;
  비밀번호: string;
}
const 로그인하기 = (사용자정보: 사용자) => { ... }

// ✅ Correct example
interface User {
  email: string;
  password: string;
}
const login = (userInfo: User) => { ... }
```

## 🚨 Absolute Principles for AI/Claude Code

**⚠️ Critical: AI/Claude Code Documentation Reference Rules**

Claude Code and other AI assistants **MUST ONLY** reference the following documents:
- ✅ **CLAUDE.md** files (this file and all CLAUDE.md files in subdirectories)
- ✅ **docs/claude/** directory (English documentation for AI reference)
- ❌ **docs/korean/** directory (Korean documentation for humans - AI must NOT reference)
- ❌ **docs/japanese/** directory (Japanese documentation for humans - AI must NOT reference)

**Reasoning:**
- `docs/korean/` and `docs/japanese/` are human-readable documents in native languages
- AI should work with English-based technical documentation for consistency and accuracy
- This separation ensures clean distinction between AI-reference and human-reference materials

## 📋 Quick Start

### Development Commands

```bash
pnpm dev          # Start development server (port 3000)
pnpm build        # Production build
pnpm test         # Run tests
```

### Tech Stack

- **Framework**: React 19 + Vite + TypeScript
- **Routing**: TanStack Router (file-based, `src/pages/`)
- **State Management**: TanStack Query
- **UI Components**: **shadcn/ui priority** + Tailwind CSS v4
- **Backend**: Supabase
- **Testing**: Vitest (TDD-based development)

## 📚 Detailed Guides

**⚠️ Important: AI/Claude Code should ONLY reference the documents below**

All detailed documentation for AI reference is located in the `docs/claude/` directory:

### Core Documents
- **[Architecture Overview](./docs/claude/architecture/overview.md)** - System architecture and design patterns
- **[Performance Guide](./docs/claude/architecture/performance.md)** - Performance optimization strategies
- **[Responsive Design](./docs/claude/architecture/responsive-design.md)** - Mobile-first responsive design patterns
- **[UI/UX Guidelines](./docs/claude/architecture/ui-ux-guidelines.md)** - Design system and UI consistency

### Development Guides
- **[Development Process](./docs/claude/development/guides/develop-process.md)** - TDD-based development guide
- **[Testing Strategy](./docs/claude/development/guides/testing-strategy.md)** - Testing patterns and tools
- **[Code Format Rules](./docs/claude/development/guides/code-format.md)** - Naming conventions and coding standards
- **[Branch Workflow](./docs/claude/development/guides/branch-workflow.md)** - Git branch management
- **[Error Handling](./docs/claude/guides/error-handling-guide.md)** - Error handling patterns and UX
- **[Troubleshooting](./docs/claude/guides/troubleshooting-guide.md)** - Problem diagnosis and resolution

### Project Documentation
- **[Feature Documentation](./docs/claude/project/feature-documentation.md)** - Complete feature overview
- **[Component Documentation](./docs/claude/project/component-documentation.md)** - Shared component usage guide
- **[Email System](./docs/claude/features/email-system.md)** - Contact form implementation

### Layer-specific Guides
- **[Entities Layer](./src/entities/CLAUDE.md)** - Domain model definitions
- **[Features Layer](./src/features/CLAUDE.md)** - UI and business logic

**Note**: `docs/korean/` and `docs/japanese/` directories contain human-readable documents in native languages and should NOT be referenced by AI assistants.

## 🏗️ Project Structure

```
src/
├── app/           # Application settings
├── pages/         # Routing (file-based)
├── shared/        # Shared resources
├── entities/      # Data entities
└── features/      # Feature units
```

## ⚡ Development Guidelines

1. **AI/Claude Code Documentation Reference Rules (Absolute)**:
   - Claude Code **MUST ONLY** reference CLAUDE.md files and docs/claude/ directory
   - **NEVER** reference docs/korean/ or docs/japanese/ (human-only documents)
   - This ensures consistent AI-human collaboration and clear documentation separation
2. **TDD-based development**: Failing test → Feature development → Refactoring
3. **Coding language rules**:
   - Function names, variable names, class names, interface names, type names, property names: **Must be in English** (camelCase, PascalCase)
   - Comments, documentation, commit messages, UI text: Korean
   - **Absolutely prohibited**: Using Korean identifiers (e.g., `사용자`, `로그인하기`, `이메일`)
4. **Type safety**: Use TypeScript strict mode
5. **🎨 UI Component Development Principles**:
   - **shadcn/ui priority**: Review all UI elements starting with shadcn/ui components
   - **Minimize custom styles**: Use shadcn/ui components rather than Tailwind classes
   - **Maintain consistency**: Follow shadcn/ui design system
   - **Ensure accessibility**: Utilize shadcn/ui's built-in accessibility features
6. **Commit rules**: Follow **[Git Commit Guide](./docs/claude/development/guides/commit-guide.md)** - Apply Conventional Commits specification
7. **🌿 Git branch workflow**: All feature development proceeds in feature branches and merges to main branch through PR
8. **📋 Development History Management (Absolute Rule)**:
   - **All development progress and major decisions must be documented**
   - Development history document location: `docs/development/history/`
   - Record daily development progress, technical decisions, issue resolution processes in detail
   - Continuously document to track the project's development process

## 🌿 Git Branch-based Development Process

**⚠️ Important: Direct work on main branch is prohibited!**

All feature development, bug fixes, and documentation work must be done in separate branches.

### 📋 Branch Workflow

#### 1. Starting New Feature Development
```bash
# Create and switch to new feature branch
git checkout -b feature/user-authentication
# or
git checkout -b fix/markdown-rendering-bug
# or
git checkout -b docs/api-documentation
```

#### 2. Development and Commit
```bash
# Regular development work
git add .
git commit -m "feat: implement user login functionality"

# Push to remote repository
git push origin feature/user-authentication
```

#### 3. Create Pull Request
```bash
# Create PR using GitHub CLI
gh pr create --title "feat: user authentication system" --body "Implements login/logout functionality with Supabase Auth"

# Or create through GitHub web interface
```

#### 4. Code Review and Merge
- Wait for code review
- Address review comments if any
- Merge after approval
- Delete feature branch after merge

### 🎯 Branch Naming Rules

- **Features**: `feature/description` (e.g., `feature/user-auth`, `feature/markdown-editor`)
- **Bug fixes**: `fix/description` (e.g., `fix/login-error`, `fix/responsive-layout`)
- **Documentation**: `docs/description` (e.g., `docs/api-guide`, `docs/setup-instructions`)
- **Hotfixes**: `hotfix/description` (e.g., `hotfix/security-patch`)

## 📝 Git Commit Guidelines

Please check the following guide before committing:

- **[Git Commit Guide](./docs/claude/development/guides/commit-guide.md)** - Commitlint rules and message writing
- **Type**: Use correct types like `feat`, `fix`, `docs`, `refactor`
- **Description**: Write clearly in Korean
- **Format**: `type: description` or `type(scope): description`

**Examples:**
```bash
feat: implement user authentication system
fix: fix markdown rendering bug
docs: add newcomer developer onboarding guide
```

## 🎨 shadcn/ui Usage Guide

### 📋 Components to Replace with shadcn/ui in Current Project

#### 1. Immediately Replaceable Components
- **Navigation Menu** → Header.tsx navigation
- **Button** → All button elements (save, publish, login, etc.)
- **Input/Textarea** → Input fields in MarkdownEditor.tsx
- **Card** → PostCard.tsx component
- **Badge** → TagBadge.tsx component
- **Toast (Sonner)** → Save/publish success/failure notifications
- **Scroll Area** → Markdown editor preview area

#### 2. Additional Usable Components
- **Form (React Hook Form)** → LoginForm.tsx improvement
- **Dialog** → Modal windows (image upload, confirmation dialogs, etc.)
- **Popover** → User menu, tag autocomplete
- **Skeleton** → Loading state improvement
- **Alert** → Error/warning messages
- **Separator** → Dividers
- **Switch** → Dark mode toggle

### 🚀 shadcn/ui Installation and Setup

```bash
# Initialize shadcn/ui (already completed)
pnpm dlx shadcn@latest init

# Install frequently used core components
pnpm dlx shadcn@latest add button input textarea card badge
pnpm dlx shadcn@latest add navigation-menu toast form dialog
pnpm dlx shadcn@latest add scroll-area skeleton alert separator

# Or install all components at once
pnpm dlx shadcn@latest add -a
```

### 📝 Component Usage Examples

#### Navigation Menu Application Example
```typescript
// Before: Existing Header.tsx
<nav className="hidden md:flex items-center space-x-8">
  <Link className="text-gray-600 hover:text-gray-900">홈</Link>
</nav>

// After: Using shadcn/ui NavigationMenu
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem } from "@/components/ui/navigation-menu"

<NavigationMenu>
  <NavigationMenuItem>
    <Link className={navigationMenuTriggerStyle()}>홈</Link>
  </NavigationMenuItem>
</NavigationMenu>
```

#### Button Application Example
```typescript
// Before: Existing button
<button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
  저장
</button>

// After: Using shadcn/ui Button
import { Button } from "@/components/ui/button"

<Button variant="default" size="default">저장</Button>
<Button variant="outline">임시저장</Button>
<Button variant="destructive">삭제</Button>
```

#### Form Application Example
```typescript
// shadcn/ui Form + React Hook Form combination
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>이메일</FormLabel>
          <FormControl>
            <Input placeholder="이메일을 입력하세요" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">로그인</Button>
  </form>
</Form>
```

#### Toast Notification Application Example
```typescript
import { toast } from "sonner"

// Success notification
const handleSave = async () => {
  try {
    await savePost(data);
    toast.success("글이 저장되었습니다!");
  } catch (error) {
    toast.error("저장에 실패했습니다.");
  }
};
```

### 🎯 Development Priority

1. **Phase 1 - Core UI Improvement (Priority)**
   - [ ] Unify all buttons with Button component
   - [ ] Build Toast(Sonner) notification system
   - [ ] Improve PostCard with Card component
   - [ ] Apply Input/Textarea components

2. **Phase 2 - Navigation and Form Improvement**
   - [ ] Refactor Header with Navigation Menu
   - [ ] Improve LoginForm with Form component
   - [ ] Improve TagBadge with Badge component
   - [ ] Implement modals with Dialog component

3. **Phase 3 - Advanced Features**
   - [ ] Improve editor preview with Scroll Area
   - [ ] Improve loading states with Skeleton
   - [ ] Implement dropdown menus with Popover

### 💡 Development Tips

- **Component Search**: Find needed components at [ui.shadcn.com](https://ui.shadcn.com)
- **Customization**: Directly modify component files in `src/components/ui/` folder
- **Theme Settings**: Customize color palette in `tailwind.config.js`
- **Accessibility**: shadcn/ui follows WCAG guidelines by default

For more details, check the CLAUDE.md files in each folder.