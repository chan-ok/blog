import {
  hardenMermaidSvg,
  sanitizeMermaidSvg,
} from '../../../src/entities/markdown/ui/mermaid-diagram';

Object.assign(globalThis, {
  __mermaidSecurity: {
    hardenMermaidSvg,
    sanitizeMermaidSvg,
  },
});
