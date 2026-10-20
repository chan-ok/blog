import { test as base } from 'playwright/test';
import { spawn, type ChildProcess } from 'node:child_process';
import { mkdtemp, mkdir, writeFile, copyFile, readFile, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

export const fixtureBody = `## First heading

before **bold** after and "hello" -- ...

![[images/sample.png|Sample image]]

> [!WARNING] Callout text

| one | two |
| --- | --- |
| a | b |

\`\`\`ts
const message = "copy me";
\`\`\`

\`\`\`mermaid
graph TD; A["$$x^2$$"]-->B
\`\`\`

## Second heading

<script>window.__blogPwned = true</script>

<img src="https://attacker.example/pixel" onerror="window.__blogPwned=true">

[unsafe](javascript:alert(1))

{globalThis.__blogPwned = true}
`;
export function postSource(
  title: string,
  published = true,
  body = fixtureBody,
  tags: string[] = []
) {
  return `---\ntitle: ${JSON.stringify(title)}\ncreatedAt: 2026-01-02\npublished: ${published}\ntags: ${JSON.stringify(tags)}\n---\n\n${body}`;
}
export interface BlogFixture {
  directory: string;
  vault: string;
  about: string;
  url: string;
  env: NodeJS.ProcessEnv;
  start(): Promise<void>;
  stop(): Promise<void>;
}
export async function createBlogFixture(
  port = 4174,
  browserName = 'chromium'
): Promise<BlogFixture> {
  // Astro가 rename()으로 자산을 옮기므로 출력과 프로젝트는 같은 파일시스템을 사용합니다.
  const cache = resolve('.cache/browser-fixtures');
  await mkdir(cache, { recursive: true });
  const directory = await mkdtemp(join(cache, `astro-blog-${browserName}-fixture-`));
  const vault = join(directory, 'vault');
  const about = join(directory, 'about');
  await Promise.all(
    ['ko', 'ja', 'images'].map((name) => mkdir(join(vault, name), { recursive: true }))
  );
  await mkdir(about);
  await copyFile(resolve('public/image/git-profile.png'), join(vault, 'images/sample.png'));
  await writeFile(
    join(vault, 'images/private.png'),
    Buffer.concat([
      await readFile(resolve('public/image/git-profile.png')),
      Buffer.from('private fixture'),
    ])
  );
  await writeFile(join(vault, 'ko', 'sample.mdx'), postSource('Fixture post'));
  await writeFile(
    join(vault, 'ko', 'draft.md'),
    postSource('PRIVATE_DRAFT_TITLE', false, 'PRIVATE_DRAFT_BODY ![[images/private.png]]')
  );
  await writeFile(
    join(vault, 'ko', 'test.md'),
    postSource('PRIVATE_TEST_TITLE', true, 'PRIVATE_TEST_BODY', ['test'])
  );
  await Promise.all(
    ['ko', 'ja'].map((locale) =>
      writeFile(join(about, `README.${locale}.md`), `# About ${locale}\n\nFixture biography.`)
    )
  );
  const env = {
    ...process.env,
    ASTRO_TELEMETRY_DISABLED: '1',
    BLOG_CONTENT_DIR: vault,
    BLOG_ABOUT_DIR: about,
    BLOG_CACHE_DIR: join(directory, 'cache'),
    BLOG_OUT_DIR: join(directory, 'dist'),
  };
  let child: ChildProcess | undefined;
  let output = '';
  const url = `http://127.0.0.1:${port}`;
  return {
    directory,
    vault,
    about,
    url,
    env,
    async start() {
      child = spawn(
        process.execPath,
        [
          resolve('node_modules/astro/bin/astro.mjs'),
          'dev',
          '--host',
          '127.0.0.1',
          '--port',
          String(port),
          '--ignore-lock',
        ],
        { cwd: process.cwd(), env, stdio: ['ignore', 'pipe', 'pipe'] }
      );
      child.stdout?.on('data', (chunk) => {
        output = (output + String(chunk)).slice(-10000);
      });
      child.stderr?.on('data', (chunk) => {
        output = (output + String(chunk)).slice(-10000);
      });
      const deadline = Date.now() + 45000;
      while (Date.now() < deadline) {
        if (child.exitCode !== null) throw new Error(`Fixture server exited: ${output}`);
        try {
          if ((await fetch(`${url}/react/ko/`)).ok) return;
        } catch {
          /* 서버 준비 중 */
        }
        await delay(150);
      }
      throw new Error(`Fixture server did not start: ${output}`);
    },
    async stop() {
      if (!child || child.exitCode !== null) return;
      const stopped = new Promise<void>((done) => child?.once('exit', () => done()));
      child.kill('SIGTERM');
      await Promise.race([
        stopped,
        delay(5000).then(() => {
          if (child?.exitCode === null) child.kill('SIGKILL');
        }),
      ]);
    },
  };
}
export const test = base.extend<{}, { blog: BlogFixture }>({
  blog: [
    async ({ browserName }, provideFixture) => {
      const fixture = await createBlogFixture(4174, browserName);
      try {
        await fixture.start();
        await provideFixture(fixture);
      } finally {
        await fixture.stop();
        await rm(fixture.directory, { recursive: true, force: true });
      }
    },
    { scope: 'worker' },
  ],
  baseURL: async ({ blog }, provideFixture) => provideFixture(blog.url),
});
export { expect } from 'playwright/test';
