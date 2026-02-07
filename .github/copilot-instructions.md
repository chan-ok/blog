# GitHub Copilot Instructions

## Code Review Exclusions

The following paths are excluded from Copilot code reviews:

- `.agents/skills/**` - AI agent skill definitions and scripts (external dependencies)
- `node_modules/**` - Third-party dependencies
- `dist/**`, `build/**`, `.next/**` - Build outputs
- `*.lock`, `pnpm-lock.yaml` - Lock files
- `.env*` - Environment files
- `coverage/**`, `test-results/**` - Test outputs

## Project Context

See `docs/agents.md` for AI coding guidelines and project standards.
