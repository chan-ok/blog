// prettier.config.ts, .prettierrc.ts, prettier.config.mts, or .prettierrc.mts

import { type Config } from 'prettier';

const config: Config = {
  plugins: ['prettier-plugin-tailwindcss'],
  trailingComma: 'es5',
  singleQuote: true,
};

export default config;
