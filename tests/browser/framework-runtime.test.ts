import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, readdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { resolve, join, dirname, extname } from 'node:path';
import { createHash } from 'node:crypto';
import ts from 'typescript';
import { test, expect } from './fixtures/blog-fixture';

const run = promisify(execFile);
async function walk(root: string): Promise<string[]> {
  return (
    await Promise.all(
      (
        await readdir(root, { withFileTypes: true })
      ).map((entry) =>
        entry.isDirectory() ? walk(join(root, entry.name)) : [join(root, entry.name)]
      )
    )
  ).flat();
}
test('새 프로덕션 빌드에 비공개 자료가 없으며 선택한 프레임워크만 실행한다', async ({
  browser,
  blog,
}) => {
  test.setTimeout(90_000);
  // 먼저 초안을 미리 보고 새 빌드가 초안 이미지 staging도 정리하는지 확인합니다.
  const draft = await fetch(`${blog.url}/react/ko/posts/draft/`);
  expect(draft.status).toBe(200);
  await blog.stop();
  await run(process.execPath, [resolve('node_modules/astro/bin/astro.mjs'), 'build'], {
    env: blog.env,
    maxBuffer: 8 * 1024 * 1024,
  });
  await run(process.execPath, ['--import', 'tsx', 'scripts/verify-static-build.ts'], {
    env: blog.env,
  });
  const dist = blog.env.BLOG_OUT_DIR!;
  const files = await walk(dist);
  for (const path of files.filter((path) => /\.(html|js|json)$/u.test(path))) {
    const source = await readFile(path, 'utf8');
    expect(
      /PRIVATE_(DRAFT|TEST)_(BODY|TITLE)/u.test(source) || source.includes(blog.vault),
      `private content in ${path}`
    ).toBe(false);
  }
  const privateDigest = createHash('sha256')
    .update(await readFile(join(blog.vault, 'images/private.png')))
    .digest('hex')
    .slice(0, 24);
  expect(files.some((path) => path.includes(privateDigest))).toBe(false);
  const frameworks = ['react', 'vue', 'svelte'];
  const entries = new Map<string, { renderer: string; component: string }>();
  for (const framework of frameworks) {
    const html = await readFile(join(dist, framework, 'ko/index.html'), 'utf8');
    entries.set(framework, {
      renderer: /renderer-url="([^"]+)"/u.exec(html)![1],
      component: /component-url="([^"]+)"/u.exec(html)![1],
    });
  }
  // 출력된 모듈 import로 의존성을 계산해 chunk 이름·축약 심볼에 의존하지 않습니다.
  async function graph(entry: string, found = new Set<string>()): Promise<Set<string>> {
    if (found.has(entry)) return found;
    found.add(entry);
    const source = await readFile(join(dist, entry), 'utf8');
    const tree = ts.createSourceFile(entry, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    const dependencies: string[] = [];
    function visit(node: ts.Node) {
      const specifier =
        ts.isImportDeclaration(node) || ts.isExportDeclaration(node)
          ? node.moduleSpecifier
          : ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword
            ? node.arguments[0]
            : undefined;
      if (specifier && ts.isStringLiteral(specifier) && specifier.text.startsWith('.'))
        dependencies.push(join(dirname(entry), specifier.text).replaceAll('\\', '/'));
      ts.forEachChild(node, visit);
    }
    visit(tree);
    for (const dependency of dependencies) await graph(dependency, found);
    return found;
  }
  const graphs = new Map<string, Set<string>>();
  for (const [framework, entry] of entries)
    graphs.set(framework, await graph(entry.component, await graph(entry.renderer)));
  const server = createServer(async (req, res) => {
    try {
      let path = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname);
      if (path.endsWith('/')) path += 'index.html';
      const file = resolve(dist, `.${path}`);
      if (!file.startsWith(`${dist}/`)) {
        res.writeHead(404).end();
        return;
      }
      const body = await readFile(file);
      res.setHeader(
        'Content-Type',
        (
          {
            '.html': 'text/html; charset=utf-8',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.png': 'image/png',
          } as Record<string, string>
        )[extname(file)] || 'application/octet-stream'
      );
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise<void>((done) => server.listen(4175, '127.0.0.1', done));
  try {
    for (const framework of frameworks) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const requests = new Set<string>();
      const errors: string[] = [];
      page.on('request', (request) => requests.add(new URL(request.url()).pathname));
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(`http://127.0.0.1:4175/${framework}/ko/`);
      await expect(page.locator('astro-island')).not.toHaveAttribute('ssr');
      expect(requests.has(entries.get(framework)!.component)).toBe(true);
      expect(requests.has(entries.get(framework)!.renderer)).toBe(true);
      for (const other of frameworks.filter((value) => value !== framework)) {
        for (const file of graphs.get(other)!)
          if (!graphs.get(framework)!.has(file))
            expect(requests.has(file), `unselected ${other} module: ${file}`).toBe(false);
      }
      expect(errors).toEqual([]);
      await context.close();
    }
  } finally {
    await new Promise<void>((done, reject) =>
      server.close((error) => (error ? reject(error) : done()))
    );
    await blog.start();
  }
});
