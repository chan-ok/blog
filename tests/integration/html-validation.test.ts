import { expect, it } from 'vitest';
import { validateHtml } from '../../scripts/html-validation';

it('브라우저가 자동 보정할 잘못된 paragraph 중첩을 거부한다', async () => {
  expect(await validateHtml('<p>before<figure>image</figure>after</p>')).toBe(false);
  expect(await validateHtml('<p>before</p><figure>image</figure><p>after</p>')).toBe(true);
});
