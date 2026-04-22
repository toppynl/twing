---
"@toppynl/twing-cache-extra": minor
"@toppynl/twing-html-extra": minor
"@toppynl/twing-components": patch
---

feat(cache): add `{% cache %}` tag as a new workspace package `@toppynl/twing-cache-extra`, matching `twig/cache-extra`. Registers via `environment.addExtension(createCacheExtension(adapter))`, supports dynamic keys and `ttl(n)`, works in both async and synchronous environments.

refactor(html-extra, components): rename `createHtmlExtraExtension` -> `createHtmlExtension` to match PHP Twig's `HtmlExtension` class naming. BREAKING: downstream consumers must update imports.
