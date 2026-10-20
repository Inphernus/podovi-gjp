import { it, expect } from 'vitest';
import { jsonLdString } from '../../src/lib/schema';

it('JSON-LD ne može zatvoriti script tag', () => {
  const s = jsonLdString({ name: '</script><script>alert(1)</script>' });
  expect(s).not.toContain('</script>');
  expect(JSON.parse(s).name).toBe('</script><script>alert(1)</script>');
});
