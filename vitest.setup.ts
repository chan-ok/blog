import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// 각 테스트 후 자동으로 DOM 정리
// Automatically cleanup DOM after each test
afterEach(() => {
  cleanup();
});
