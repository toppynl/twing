# Twig Parity Progress

Tracks implementation of missing PHP Twig features relative to the [parity table in README.md](README.md#php-twig-parity).
Phases group independent items that can be worked on in parallel.

---

## Phase 1 — Pure filter additions

No parser work required. Each filter is independent and follows the existing filter pattern.

- [x] `find` filter _(3.11+)_ — first element matching an arrow function predicate; effectively `filter` returning only the first result
- [x] `shuffle` filter _(3.11+)_ — randomize array order
- [x] `invoke` filter _(3.19+)_ — call an arrow function value as a filter (e.g. `{{ fn|invoke(arg) }}`)
- [x] `data_uri` filter — encode content as a base64 `data:` URI; optionally accept a MIME type argument
- [x] `slug` filter _(3.3+)_ — URL-safe slug; decide on Unicode normalization strategy (e.g. `slugify`, native `Intl`, or regex-based)

---

## Phase 2 — New operators

Each is an independent parser + node + executor addition. Light touch — no existing behaviour changes.

- [ ] `===` / `!==` strict equality _(3.23+)_ — reuse the comparison logic from the `same as` test
- [ ] `xor` logical operator _(3.15+)_ — logical exclusive OR; bitwise `b-xor` already exists as a template
- [ ] `?.` null-safe attribute access _(3.23+)_ — return `null` instead of throwing when the left-hand side is `null`

---

## Phase 3 — Missing tests

Each test is a standalone addition with no parser changes.

- [ ] `sequence` test — is an indexed (non-associative) array
- [ ] `mapping` test — is an associative array / object
- [ ] `instanceof` test _(3.15+)_ — checks class inheritance; note sandbox implications

---

## Phase 4 — Language syntax

Requires non-trivial parser changes. Destructuring variants share infrastructure and are best tackled together.

- [ ] `=` assignment expression _(3.23+)_ — assign within expression context (`{% do x = 1 %}`, `{{ result = fn() }}`, chained `a = b = v`)
- [ ] Sequence destructuring _(3.23+)_ — `{% do [a, b] = arr %}` with skip slots and null padding for short arrays
- [ ] Object destructuring _(3.23+)_ — `{% do {name, email} = user %}` with key-based extraction

---

## Phase 5 — New tags

Each tag is independent. `types` is simpler (no runtime effect); `guard` requires a feature-registry concept.

- [ ] `types` tag _(3.13+)_ — static type declarations; no runtime effect, compile-time / IDE metadata only
- [ ] `guard` tag _(3.15+)_ — compile-time feature detection (`{% guard filter markdown_to_html %}…{% else %}…{% endguard %}`)

---

## Phase 6 — Complex / deferred

Higher effort, external dependencies, or JS adaptation not yet scoped.

- [ ] `u` filter — returns a Unicode proxy object with ~15 methods (`truncate`, `wordwrap`, `normalize`, `camel`, `snake`, etc.); effectively a small string library
- [ ] `enum` function + `enum_cases` function _(3.12+)_ — PHP enum access; JS has no native enums, so an adapter/registry approach is needed
- [ ] `cache` tag _(3.2+)_ — fragment caching with TTL and tag-based invalidation; needs a cache adapter interface
- [ ] Inline expression comments `# …` _(3.15+)_ — lexer change to allow `{{ value # comment }}`
- [ ] Number literals with `_` separator _(3.17+)_ — `1_000_000`, `3.141_592`; lexer change only
