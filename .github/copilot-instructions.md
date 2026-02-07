# GitHub Copilot Instructions

## Code Review Exclusions

Copilot should not review the following paths:

- `.agents/skills/**` - AI agent skill definitions and scripts (external dependencies)
- `node_modules/**` - Third-party dependencies
- `dist/**`, `build/**`, `.next/**` - Build outputs
- `*.lock`, `pnpm-lock.yaml` - Lock files
- `.env*` - Environment files
- `coverage/**`, `test-results/**` - Test outputs

Note: Only `.agents/skills/**` is enforced via `.gitattributes`. Other paths are guidance for Copilot or already excluded via `.gitignore`.

## OpenCode Configuration

The `opencode.json` configuration includes:
- **Watcher ignore patterns**: Excludes `.agents/skills/**` from file watching
- **Global permissions**: Allows common development commands (`ls -la`, `git status/diff/log`, `gh pr create/view/checks`) to streamline agent workflows

## Project Context

See `docs/agents.md` for AI coding guidelines and project standards.
