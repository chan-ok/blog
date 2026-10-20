import { hardenMermaidSvg, sanitizeMermaidSvg } from '../../../src/lib/browser/mermaid';

Object.assign(globalThis, {
  __mermaidSecurity: {
    hardenMermaidSvg,
    sanitizeMermaidSvg,
  },
});
