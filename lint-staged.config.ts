import { type Configuration } from 'lint-staged';

// lint-staged.config.ts
const config: Configuration = {
  '*.{ts,tsx,js,jsx}': ['pnpm run fmt', 'pnpm run lint'],
  '*.{css,scss}': ['pnpm run fmt'],
  '*.{json,md}': ['pnpm run fmt'],
};

export default config;
