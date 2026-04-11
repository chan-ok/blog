import { type Configuration } from 'lint-staged';

// lint-staged.config.ts
const config: Configuration = {
  '*.{ts,tsx,js,jsx}': ['oxfmt --write', 'oxlint --fix'],
};

export default config;
