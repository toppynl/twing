---
"@toppynl/twing-components": patch
---

fix(components): normalize colon-namespaced component names to slash paths before calling `templateFinder`

`<twig:button:button>` now correctly resolves to `components/button/button.html.twig` instead of `components/button:button.html.twig`, aligning with Symfony's PHP behaviour (`str_replace(':', '/', $componentName)`). Consumers providing a custom `templateFinder` receive the slash-normalized name and require no changes.
