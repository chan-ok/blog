import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const projectFile = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

describe('deployment security configuration', () => {
  it('uses only installed test and typecheck executables', () => {
    const packageJson = JSON.parse(projectFile('package.json')) as {
      scripts: Record<string, string>;
    };

    expect(packageJson.scripts.typecheck).toBe('tsgo -p . --noEmit');
    expect(packageJson.scripts).not.toHaveProperty('test:coverage');
    expect(packageJson.scripts).not.toHaveProperty('test:responsive');
    expect(packageJson.scripts).not.toHaveProperty('pioneer');
    expect(packageJson.scripts).not.toHaveProperty('pioneer:update');
  });

  it('pins the package manager and supported Node release line', () => {
    const packageJson = JSON.parse(projectFile('package.json')) as {
      packageManager?: string;
      engines?: Record<string, string>;
    };

    expect(packageJson.packageManager).toBe('pnpm@11.18.0');
    expect(packageJson.engines?.node).toBe('>=24 <25');
    expect(projectFile('.nvmrc').trim()).toBe('24');
  });

  it('does not load obsolete third-party or polyfill scripts', () => {
    const html = projectFile('index.html');

    expect(html).not.toContain('challenges.cloudflare.com');
    expect(html).not.toContain("from 'buffer'");
    expect(html).not.toContain('fonts.googleapis.com');
  });

  it('sets browser security headers for every Netlify route', () => {
    const netlifyConfig = projectFile('netlify.toml');

    expect(netlifyConfig).toContain('Content-Security-Policy');
    expect(netlifyConfig).toContain("default-src 'self'");
    expect(netlifyConfig).toContain("object-src 'none'");
    expect(netlifyConfig).toContain("frame-ancestors 'none'");
    expect(netlifyConfig).toContain("script-src 'self'");
    expect(netlifyConfig).not.toMatch(/script-src[^;]*(?:'unsafe-eval'|'unsafe-inline')/u);
    expect(netlifyConfig).toContain('X-Content-Type-Options = "nosniff"');
    expect(netlifyConfig).toContain('Referrer-Policy');
    expect(netlifyConfig).toContain('Permissions-Policy');
    expect(netlifyConfig).toContain('Strict-Transport-Security');
  });

  it('does not suppress eval warnings or install the removed Buffer polyfill', () => {
    const viteConfig = projectFile('vite.config.ts');

    expect(viteConfig).not.toContain('gray-matter');
    expect(viteConfig).not.toContain('alias: {\n        buffer');
    expect(viteConfig).not.toContain("include: ['buffer']");
    expect(viteConfig).not.toContain('warning.code');
  });

  it('audits all installed dependencies before push', () => {
    const prePush = projectFile('.husky/pre-push');

    expect(prePush).toContain('pnpm audit --audit-level=critical');
    expect(prePush).not.toContain('--prod');
  });
});
