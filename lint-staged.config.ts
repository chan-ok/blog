import { type Configuration } from 'lint-staged';

// lint-staged.config.ts
const config: Configuration = {
  '*.{ts,tsx,js,jsx}': ['prettier --write', 'eslint --fix'],
  '*.{css,scss}': ['prettier --write'],
  '*.{json,md}': ['prettier --write'],
};

export default config;
