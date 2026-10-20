import { expect, it, vi } from 'vitest';
import { mountMermaid } from './mermaid';
const mocks = vi.hoisted(() => ({
  initialize: vi.fn<() => void>(),
  render: vi.fn<(id: string, source: string) => Promise<{ svg: string }>>(),
}));
vi.mock('mermaid', () => ({ default: mocks }));

it('mount가 끝나기 전에 해제되면 다이어그램 작업을 시작하지 않는다', async () => {
  const controller = new AbortController();
  const root = {
    querySelectorAll: () => [{ isConnected: true, dataset: {}, textContent: 'graph TD; A-->B' }],
  } as unknown as HTMLElement;
  const work = mountMermaid(root, controller.signal);
  controller.abort();
  await work;
  expect(mocks.render).not.toHaveBeenCalled();
});
