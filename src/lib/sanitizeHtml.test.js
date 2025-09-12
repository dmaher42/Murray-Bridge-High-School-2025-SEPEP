import assert from 'assert';
import { sanitizeHtml } from './sanitizeHtml.js';

(() => {
  const input = "<img src=x onerror=\"alert('x')\"><p>Hello</p>";
  const output = sanitizeHtml(input);
  assert(!/onerror/.test(output));
  assert(output.includes('<p>Hello</p>'));
})();

(() => {
  const input = "<script>alert('x')</script><div>Safe</div>";
  const output = sanitizeHtml(input);
  assert(!/<script>/i.test(output));
  assert(output.includes('<div>Safe</div>'));
})();

console.log('sanitizeHtml tests passed');
