# Git Branch-Based Development Workflow

## 🎯 Purpose

This document defines a Git branch-based development process for team collaboration and maintaining code quality.

## 🚨 Core Principles

### 1. Main Branch Protection
- **No direct work on main branch**
- **Main branch always maintains deployable state**
- **All changes merged only through Pull Requests**

### 2. Feature-Based Branch Separation
- **Create separate branches for each feature, bug fix, and documentation work**
- **Branch names clearly express the work content**
- **Divide work into small units to maintain fast feedback cycles**

### 3. Mandatory Code Review
- **All code changes merged after review**
- **Automated tests must pass**
- **Documentation updates proceed simultaneously**

## 📋 Branch Strategy

### Branch Types

#### 1. Main Branch
- **Purpose**: Main branch for production deployment
- **Characteristics**: Always stable and deployable
- **Protection**: No direct commits, merge only through PR

#### 2. Feature Branch
- **Purpose**: New feature development
- **Naming**: `feature/feature-name-description`
- **Lifecycle**: Merge to main after completion, delete

#### 3. Fix Branch
- **Purpose**: Bug fixes
- **Naming**: `fix/bug-name-description`
- **Lifecycle**: Merge to main after fix completion, delete

#### 4. Docs Branch
- **Purpose**: Documentation work
- **Naming**: `docs/document-name-description`
- **Lifecycle**: Merge to main after documentation completion, delete

#### 5. Refactor Branch
- **Purpose**: Code refactoring
- **Naming**: `refactor/target-description`
- **Lifecycle**: Merge to main after refactoring completion, delete

#### 6. Test Branch
- **Purpose**: Adding/improving test code
- **Naming**: `test/test-target-description`
- **Lifecycle**: Merge to main after test completion, delete

## 🔧 Branch Naming Rules

### Pattern
```
{type}/{brief-description}
```

### Rules
- **Use English lowercase**
- **Separate words with hyphens (-)**
- **Clear description starting with verb**
- **Maximum 50 characters**

### Good Branch Name Examples
```bash
# Feature development
feature/user-authentication
feature/blog-post-editor
feature/search-functionality
feature/admin-dashboard
feature/email-notification

# Bug fixes
fix/header-mobile-layout
fix/markdown-rendering
fix/login-form-validation
fix/image-upload-error

# Documentation work
docs/api-documentation
docs/setup-guide
docs/contribution-guidelines
docs/architecture-overview

# Refactoring
refactor/shared-components
refactor/api-service-layer
refactor/authentication-logic

# Testing
test/user-api-endpoints
test/component-unit-tests
test/integration-scenarios
```

### Branch Names to Avoid
```bash
# ❌ Bad examples
feature/fix                    # Too vague
user                          # No type
feature/사용자인증             # Korean usage
feature/UserAuthentication    # CamelCase usage
feature/user_authentication   # Underscore usage
feature/this-is-a-very-long-branch-name-that-explains-everything # Too long
```

## 🌟 Standard Workflow

### Step 1: Start Work
```bash
# 1. Switch to main branch
git checkout main

# 2. Get latest changes
git pull origin main

# 3. Create new feature branch
git checkout -b feature/blog-search

# 4. Verify branch
git branch  # Check current branch
```

### Step 2: Development Progress
```bash
# 1. Stage changes after file modification
git add src/features/search/

# 2. Commit in meaningful units
git commit -m "feat: implement basic structure of search input component"

# 3. Continue additional development
git add src/features/search/hooks/
git commit -m "feat: implement search API hook"

# 4. Add tests
git add src/features/search/__tests__/
git commit -m "test: add unit tests for search functionality"
```

### Step 3: Regular Synchronization
```bash
# 1. Check latest changes in main branch
git checkout main
git pull origin main

# 2. Return to work branch and merge
git checkout feature/blog-search
git merge main

# 3. Resolve conflicts (if needed)
# After modifying conflict files
git add .
git commit -m "resolve: merge changes from main branch"
```

### Step 4: Final Verification
```bash
# 1. Build test
pnpm build

# 2. Run unit tests
pnpm test

# 3. Lint check (if configured)
pnpm lint

# 4. Type check
pnpm type-check
```

### Step 5: Create Pull Request
```bash
# 1. Push branch to remote repository
git push origin feature/blog-search

# 2. Create Pull Request on GitHub
# - Access GitHub repository in web browser
# - Click "Compare & pull request" button
# - Write content according to PR template
```

### Step 6: Code Review and Merge
1. **Self Review**: Review all changes yourself first after creating PR
2. **Peer Review**: Request code review from team members
3. **Reflect Feedback**: Modify code based on review comments
4. **Final Approval**: Approve after completing all reviews
5. **Merge**: Squash and merge or Merge commit
6. **Branch Cleanup**: Delete local/remote branches after merge

## 📝 Pull Request Guide

### PR Title Rules
```
{type}: {brief description}

Examples:
feat: implement blog search functionality
fix: fix mobile header layout bug
docs: update API documentation
refactor: improve shared component structure
```

### PR Description Template
```markdown
## 📝 Change Summary
- Brief description of implemented features or fixed content

## 🎯 Work Content
- [ ] Implement feature A
- [ ] Add component B
- [ ] Write test C
- [ ] Update document D

## 🧪 Test Method
1. Run development server: `pnpm dev`
2. Access specific page: `/admin/write`
3. Verify functionality: Enter search term and press enter

## 📸 Screenshots (for UI changes)
- Attach before/after screenshots

## 🔗 Related Issues
- Closes #123
- Related to #456

## ✅ Checklist
- [ ] No build errors (`pnpm build`)
- [ ] Tests pass (`pnpm test`)
- [ ] Self code review completed
- [ ] Related documentation updated
```

## 🛠️ Branch Management Commands

### Branch Creation and Switching
```bash
# Create new branch and switch
git checkout -b feature/new-feature

# Switch to existing branch
git checkout feature/existing-feature

# Check branch list
git branch                    # Local branches
git branch -r                 # Remote branches
git branch -a                 # All branches
```

### Branch Synchronization
```bash
# Update remote branch information
git fetch origin

# Update main branch to latest state
git checkout main
git pull origin main

# Apply main changes to current branch
git checkout feature/my-feature
git merge main

# Or use rebase (advanced)
git rebase main
```

### Branch Cleanup
```bash
# Delete local branch
git branch -d feature/completed-feature

# Force delete (unmerged branch)
git branch -D feature/abandoned-feature

# Delete remote branch
git push origin --delete feature/completed-feature

# Clean up references to no longer existing remote branches
git remote prune origin
```

## 🚨 Problem-Specific Solutions

### 1. Committed to Wrong Branch
```bash
# Move last commit to another branch
git checkout correct-branch
git cherry-pick wrong-branch
git checkout wrong-branch
git reset --hard HEAD~1
```

### 2. Accidentally Committed to Main Branch
```bash
# 1. Create new branch (preserve current state)
git checkout -b feature/rescue-commits

# 2. Revert main branch to previous state
git checkout main
git reset --hard HEAD~1  # Cancel last commit

# 3. Continue work on new branch
git checkout feature/rescue-commits
```

### 3. Conflict Resolution
```bash
# 1. Conflict occurs during merge
git merge main
# Auto-merging failed...

# 2. Check conflict files
git status

# 3. After resolving conflicts
git add .
git commit -m "resolve: merge changes from main branch"
```

### 4. Change Branch Name
```bash
# Change local branch name
git branch -m old-branch-name new-branch-name

# Change remote branch name
git push origin :old-branch-name
git push origin new-branch-name
git push origin -u new-branch-name
```

## 📊 Branch Strategy Comparison

### Current Strategy: GitHub Flow
```
main → feature → PR → main
```

**Advantages:**
- Simple and easy to understand
- Fast deployment possible
- Suitable for small teams

**Disadvantages:**
- Lack of release management
- Complex hotfix handling

### Alternative: Git Flow (for large projects)
```
main → develop → feature → develop → release → main
                     ↓
                  hotfix → main
```

**Maintain GitHub Flow as it's overly complex for current project**

## 🎯 Best Practices

### DO (Recommendations)
- ✅ Always get latest code from main before starting work
- ✅ Commit frequently in meaningful units
- ✅ Use clear and consistent branch names
- ✅ Self-review code before creating PR
- ✅ Verify tests and build before creating PR
- ✅ Delete branches immediately after merge

### DON'T (Prohibitions)
- ❌ Work directly on main branch
- ❌ Commit overly large units of work at once
- ❌ Use vague or inconsistent branch names
- ❌ Create PR without tests
- ❌ Leave merged branches unattended
- ❌ Force push without resolving conflicts

## 🔍 Frequently Asked Questions

### Q: When should I create a branch?
A: Always create a new branch before starting any new work (features, bug fixes, documentation).

### Q: When should I delete a branch?
A: Delete the branch immediately after PR is merged. GitHub can also be configured for automatic deletion.

### Q: What should I do when conflicts occur?
A: Open the conflict files, resolve manually, then complete resolution with `git add .` and `git commit`.

### Q: I accidentally committed to main branch.
A: Immediately create a new branch to move the commit, and revert main to previous state.

### Q: There are too many branches.
A: Regularly clean up merged branches and use `git remote prune origin` to clean up old references.

---

Follow this workflow for safe and efficient collaborative development! 🚀