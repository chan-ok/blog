import { EventEmitter } from 'node:events';
import type { spawn, ChildProcess } from 'node:child_process';
import { rm } from 'node:fs/promises';
import { afterEach, expect, it, vi } from 'vitest';
import { createBlogFixture } from '../browser/fixtures/blog-fixture';

const mocks = vi.hoisted(() => ({
  spawn: vi.fn<typeof spawn>(),
  delay: vi.fn<() => Promise<void>>(),
}));
vi.mock('node:child_process', async (original) => ({
  ...(await original<typeof import('node:child_process')>()),
  spawn: mocks.spawn,
}));
vi.mock('node:timers/promises', async (original) => ({
  ...(await original<typeof import('node:timers/promises')>()),
  setTimeout: mocks.delay,
}));
const directories: string[] = [];
afterEach(async () => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  await Promise.all(
    directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true }))
  );
});

it('이전 서버의 종료 제한 시간이 새로 시작한 서버를 종료하지 않는다', async () => {
  function child() {
    const process = Object.assign(new EventEmitter(), {
      exitCode: null,
      signalCode: null as NodeJS.Signals | null,
      stdout: new EventEmitter(),
      stderr: new EventEmitter(),
      kill: vi.fn<(signal: NodeJS.Signals) => boolean>(),
    });
    process.kill.mockImplementation((signal) => {
      process.signalCode = signal;
      process.emit('exit', null, signal);
      return true;
    });
    return process;
  }
  const previous = child();
  const current = child();
  mocks.spawn
    .mockReturnValueOnce(previous as unknown as ChildProcess)
    .mockReturnValueOnce(current as unknown as ChildProcess);
  let releaseTimeout!: () => void;
  mocks.delay.mockImplementation(
    () =>
      new Promise<void>((done) => {
        releaseTimeout = done;
      })
  );
  vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(new Response('ready')));
  const fixture = await createBlogFixture();
  directories.push(fixture.directory);
  await fixture.start();
  await fixture.stop();
  await fixture.start();
  releaseTimeout();
  await Promise.resolve();
  expect(current.kill).not.toHaveBeenCalled();
});
