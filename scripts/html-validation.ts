import { HtmlValidate } from 'html-validate';

const validator = new HtmlValidate({
  elements: [
    'html5',
    {
      'astro-island': { flow: true, phrasing: true },
      'astro-slot': { flow: true, phrasing: true },
      'astro-static-slot': { flow: true, phrasing: true },
      // Astro emits its island display rule next to the island in <body>.
      style: { inherit: 'style', flow: true },
    },
  ],
  rules: { 'element-permitted-content': 'error', 'close-order': 'error' },
});
export async function validateHtml(html: string): Promise<boolean> {
  return (await validator.validateString(html)).valid;
}
