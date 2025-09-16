# Development Todo List

This document organizes the features planned for implementation in the project by priority.

## ✅ Recently Completed Tasks (2025-09-16)

### shadcn/ui Integration and Component System Building
- [x] **shadcn/ui CLI installation and project initialization**
- [x] **Essential shadcn/ui component addition** (Button, Input, Textarea)
- [x] **MarkdownEditor refactoring**: Complete conversion of Korean variable names to English
- [x] **shadcn/ui component integration**: Consistent UI system building

### Development Process Systematization
- [x] **Development history tracking system building**: `docs/development/history/` folder structure
- [x] **Decision recording procedure documentation**: All development decisions trackable
- [x] **English identifier rule enforcement**: Korean variable/function name usage prohibition policy
- [x] **Documentation structure reorganization**: Category-based folder classification and systematization

### Technical Debt Resolution
- [x] **Coding rule violation fixes**: Korean identifier removal in MarkdownEditor
- [x] **Type safety improvement**: TypeScript strict mode compliance
- [x] **Component consistency**: Unified UI based on shadcn/ui

## 🚀 Phase 1: Core Feature Implementation (High Priority)

### 1.1 User Authentication System ⭐ **Priority Implementation**
> Detailed Guide: [Authentication System Guide](../features/authentication.md)

- [ ] **Basic Authentication Features**
  - [ ] Supabase project setup and admin account creation
  - [ ] useAuth custom hook implementation (`src/features/auth/hooks/useAuth.ts`)
  - [ ] Login form component (`src/features/auth/components/LoginForm.tsx`)
  - [ ] Logout button component (`src/features/auth/components/LogoutButton.tsx`)
  - [ ] Login page (`src/pages/login.tsx`)

- [ ] **Route Protection System**
  - [ ] AuthGuard component (`src/features/auth/components/AuthGuard.tsx`)
  - [ ] TanStack Router beforeLoad guard (`src/pages/admin/_layout.tsx`)
  - [ ] Login page redirection logic when unauthenticated
  - [ ] Return to original page after login functionality

- [ ] **UI Integration**
  - [ ] Conditional admin menu display in Header component
  - [ ] Navigation menu changes based on authentication status
  - [ ] Loading state and error handling UI

- [ ] **Security Setup**
  - [ ] Supabase RLS policy setup (only admins can write/edit posts)
  - [ ] JWT token automatic management setup
  - [ ] Session timeout and automatic logout

### 1.2 Blog Editor System
- [ ] **Markdown Editor Implementation**
  - [ ] Real-time preview functionality
  - [ ] Syntax highlighting
  - [ ] Image upload (Supabase Storage)
  - [ ] Auto-save functionality
  - [ ] Tag input system

- [ ] **Post Management Features**
  - [ ] New post creation (`/admin/write`)
  - [ ] Existing post editing (`/admin/edit/:id`)
  - [ ] Post deletion functionality
  - [ ] Draft/published status management

### 1.3 Markdown Viewer
- [ ] **Post Display System**
  - [ ] Markdown → HTML rendering
  - [ ] Code block syntax highlighting
  - [ ] Table of Contents (TOC) auto-generation
  - [ ] Optimized image display

- [ ] **Post List and Detail Pages**
  - [ ] Pagination
  - [ ] Search functionality
  - [ ] Tag-based filtering
  - [ ] Sorting options (newest/oldest)

### 1.4 Routing System Completion
- [ ] **Main Routes Implementation**
  - [ ] `/` - Homepage (latest post list)
  - [ ] `/about` - About page
  - [ ] `/about/resume` - Resume (nested routing)
  - [ ] `/posts` - All posts list
  - [ ] `/posts/:slug` - Individual post detail
  - [ ] `/tags` - Tag list
  - [ ] `/tags/:tagName` - Posts by tag
  - [ ] `/contact` - Contact

- [ ] **Admin Routes**
  - [ ] `/admin` - Admin dashboard
  - [ ] `/admin/write` - New post creation
  - [ ] `/admin/manage` - Post list management
  - [ ] `/admin/settings` - Blog settings

## 🎨 Phase 2: UI/UX Improvements (Medium Priority)

### 2.1 Responsive Design Completion
- [ ] **Mobile Optimization**
  - [ ] Touch-friendly navigation
  - [ ] Mobile menu (hamburger menu)
  - [ ] Swipe gesture support
  - [ ] Mobile editor optimization

- [ ] **Tablet/Desktop Optimization**
  - [ ] Adaptive layout
  - [ ] Keyboard shortcut support
  - [ ] Multi-column layout (large screens)

### 2.2 Performance Optimization
- [ ] **Loading Optimization**
  - [ ] Image lazy loading
  - [ ] Code splitting (Route-based)
  - [ ] Virtual scrolling (long lists)
  - [ ] Caching strategy optimization

- [ ] **SEO Optimization**
  - [ ] Dynamic meta tag generation
  - [ ] Open Graph tags
  - [ ] Structured data (JSON-LD)
  - [ ] Sitemap generation

## 🌙 Phase 3: Advanced Features (Low Priority)

### 3.1 Dark Mode Support
- [ ] **Theme System Implementation**
  - [ ] CSS variable-based theming
  - [ ] System preference detection
  - [ ] Theme toggle component
  - [ ] User preference storage

- [ ] **Dark Mode UI Adjustments**
  - [ ] Editor dark theme
  - [ ] Code highlighting theme
  - [ ] Image filter adjustments

### 3.2 Multi-language Support (i18next)
- [ ] **Basic Language Settings**
  - [ ] Korean (default)
  - [ ] English
  - [ ] Japanese

- [ ] **Translation System**
  - [ ] UI text translation
  - [ ] Language switching component
  - [ ] URL-based language routing
  - [ ] Multi-language post creation support

### 3.3 Advanced Editor Features
- [ ] **Collaboration Features**
  - [ ] Real-time collaborative editing
  - [ ] Comment system
  - [ ] Change history tracking

- [ ] **Advanced Editing Tools**
  - [ ] Table editor
  - [ ] Math editing (LaTeX)
  - [ ] Diagram insertion (Mermaid)
  - [ ] Plugin system

## 🔧 Phase 4: Operations Tools (Implement as needed)

### 4.1 Analytics and Monitoring
- [ ] **User Analytics**
  - [ ] Page view tracking
  - [ ] User behavior analysis
  - [ ] Performance monitoring

### 4.2 Management Tools
- [ ] **Backup System**
  - [ ] Automatic post backup
  - [ ] Image backup
  - [ ] Settings backup

- [ ] **Migration Tools**
  - [ ] Import posts from other platforms
  - [ ] Data export

## 📋 Implementation Order Guidelines

### Phase 1: Basic Blog (4-6 weeks)
1. Authentication system building
2. Basic CRUD functionality
3. Markdown viewer
4. Basic routing

### Phase 2: Editor Enhancement (2-3 weeks)
1. Advanced editor features
2. Image upload
3. Tag system
4. Search functionality

### Phase 3: UI/UX Completion (2-3 weeks)
1. Responsive design
2. Performance optimization
3. SEO optimization
4. Accessibility improvements

### Phase 4: Advanced Features (As needed)
1. Dark mode
2. Multi-language support
3. Advanced editor features

## 🎯 Success Metrics

- [ ] **Functional Requirements**
  - Administrators can create/edit/delete posts
  - Visitors can read and navigate posts
  - Smooth user experience on all devices

- [ ] **Non-functional Requirements**
  - Page loading time < 3 seconds
  - Mobile Lighthouse score > 90
  - WCAG 2.1 AA accessibility compliance

This list can be adjusted as the project progresses and will be implemented step-by-step through the TDD process.