---
"@toppynl/twing-components": minor
---

Initial release: port of `symfony/ux-twig-component`.

- `{% props %}` tag with defaults, required props, `attributes` bag filtering
- `{% component 'Name' [with {...}] [only] %}...{% endcomponent %}` tag
- `component('Name', {...})` function for self-closing usage
- `ComponentAttributes` bag with `.only()`, `.without()`, `.defaults()`, `.nested()`, `.render()`, `[Symbol.iterator]`, `toString()`
- `<twig:Name />`, `<twig:Name>…</twig:Name>`, `<twig:block name="…">…</twig:block>` syntax via `wrapLoaderWithPreLexer` / `wrapSynchronousLoaderWithPreLexer`
- `preLexComponents(source)` available as standalone utility
