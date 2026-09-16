import { fileURLToPath } from 'node:url';

import { build } from 'vite';
import { expect, test, type Page } from 'playwright/test';

interface MermaidSecurityModule {
  hardenMermaidSvg: (svg: string) => string;
  sanitizeMermaidSvg: (svg: string) => string;
}

const entry = fileURLToPath(new URL('./fixtures/mermaid-security-entry.ts', import.meta.url));

let browserBundle = '';

test.beforeAll(async () => {
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
    build: {
      write: false,
      minify: false,
      lib: {
        entry,
        name: 'MermaidSecurityTest',
        formats: ['iife'],
      },
    },
  });

  const outputs = Array.isArray(result) ? result : [result];
  const entryChunk = outputs
    .flatMap((output) => output.output)
    .find((item) => item.type === 'chunk' && item.isEntry);
  if (!entryChunk || entryChunk.type !== 'chunk') {
    throw new Error('Failed to build the Mermaid security browser fixture');
  }

  browserBundle = entryChunk.code;
});

async function installSecurityModule(page: Page) {
  await page.setContent('<!doctype html><html><body></body></html>');
  await page.addScriptTag({ content: browserBundle });
}

test.describe('Mermaid SVG security boundary', () => {
  test('removes executable and externally loading SVG content', async ({ page }) => {
    await installSecurityModule(page);

    const maliciousSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)">
        <script>alert(1)</script>
        <foreignObject><iframe src="https://attacker.example/frame"></iframe></foreignObject>
        <style>@import "https://attacker.example/style.css";</style>
        <a href="https://attacker.example/link"><text>unsafe</text></a>
        <image href="https://attacker.example/pixel" />
        <rect style="fill:url(https://attacker.example/pixel)" />
        <a href="#safe"><text>safe fragment</text></a>
      </svg>
    `;

    const sanitized = await page.evaluate(
      ({ svg }) => {
        const module = (window as unknown as { __mermaidSecurity: MermaidSecurityModule })
          .__mermaidSecurity;
        return module.sanitizeMermaidSvg(svg);
      },
      { svg: maliciousSvg }
    );

    expect(sanitized).not.toContain('<script');
    expect(sanitized).not.toContain('foreignObject');
    expect(sanitized).not.toContain('onload');
    expect(sanitized).not.toContain('attacker.example');
    expect(sanitized).toContain('href="#safe"');
  });

  test('rejects malformed SVG after parsing', async ({ page }) => {
    await installSecurityModule(page);

    const hardened = await page.evaluate(() => {
      const module = (window as unknown as { __mermaidSecurity: MermaidSecurityModule })
        .__mermaidSecurity;
      return module.hardenMermaidSvg('<svg><g></svg>');
    });

    expect(hardened).toBe('');
  });
});
