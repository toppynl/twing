# @toppynl/twing

First-class TypeScript and JavaScript [Twig](https://twig.symfony.com/) template engine.

A fork of [nightlycommit/twing](https://github.com/nightlycommit/twing) extended with Twig 3.x language features and additional extension packages.

## Installation

```sh
npm install @toppynl/twing
```

Node.js 16 or later is required.

## Basic usage

```ts
import { createEnvironment, TwingLoaderArray } from '@toppynl/twing';

const loader = new TwingLoaderArray({
    'index.html': 'Hello {{ name }}!'
});

const env = createEnvironment(loader);

const output = await env.render('index.html', { name: 'World' });
// => 'Hello World!'
```

### Synchronous rendering

```ts
import { createSynchronousEnvironment, TwingLoaderArray } from '@toppynl/twing';

const env = createSynchronousEnvironment(loader);

const output = env.renderSync('index.html', { name: 'World' });
```

### Browser / bundle (no filesystem)

```ts
import { createEnvironment } from '@toppynl/twing/light';
```

The `light` entry point excludes Node.js-only features (`convert_encoding`, filesystem loader, source maps).

## Extension packages

| Package | Description |
|---------|-------------|
| [`@toppynl/twing-html-extra`](https://www.npmjs.com/package/@toppynl/twing-html-extra) | `html_classes`, `html_attr`, `html_attr_merge`, `html_cva` |
| [`@toppynl/twing-components`](https://www.npmjs.com/package/@toppynl/twing-components) | `{% props %}`, `{% component %}`, `<twig:Name />` |

```ts
import { HtmlExtraExtension } from '@toppynl/twing-html-extra';

const env = createEnvironment(loader, {
    extensions: [new HtmlExtraExtension()]
});
```

## PHP Twig parity

**Legend:** ✅ Implemented · ❌ Not yet implemented · 📦 Available via extension package

### Tags

| Tag | Status | PHP Twig | Notes |
|-----|--------|----------|-------|
| `apply` | ✅ | | Apply filters to a block |
| `autoescape` | ✅ | | Control auto-escaping |
| `block` | ✅ | | Define named template blocks |
| `cache` | ❌ | 3.2+ | Requires `twig/cache-extra` |
| `deprecated` | ✅ | | Mark template/variable as deprecated |
| `do` | ✅ | | Execute expression without output |
| `embed` | ✅ | | Include + block override |
| `extends` | ✅ | | Template inheritance |
| `filter` | ✅ | | Alias for `apply` |
| `flush` | ✅ | | Flush output buffer |
| `for` | ✅ | | Loop over sequences |
| `from` | ✅ | | Import specific macros |
| `guard` | ❌ | 3.15+ | Compile-time feature detection |
| `if` | ✅ | | Conditional blocks |
| `import` | ✅ | | Import macros from template |
| `include` | ✅ | | Include a template |
| `macro` | ✅ | | Define reusable template functions |
| `sandbox` | ✅ | | Sandboxed execution mode |
| `set` | ✅ | | Variable assignment |
| `spaceless` | ✅ | | Remove whitespace between HTML tags |
| `types` | ✅ | 3.13+ | Parsed and discarded; no runtime effect |
| `use` | ✅ | | Horizontal template reuse |
| `verbatim` | ✅ | | Raw output without parsing |
| `with` | ✅ | | Scoped variable context |
| `component` | 📦 | — | `@toppynl/twing-components` |
| `props` | 📦 | — | `@toppynl/twing-components` |

### Filters

| Filter | Status | PHP Twig | Notes |
|--------|--------|----------|-------|
| `abs` | ✅ | | Absolute value |
| `batch` | ✅ | | Split into batches |
| `capitalize` | ✅ | | First character uppercase |
| `column` | ✅ | | Extract column from array |
| `convert_encoding` | ✅ | | `lib` build only (Node.js) |
| `data_uri` | ✅ | | Base64 data URI |
| `date` | ✅ | | Format date |
| `date_modify` | ✅ | | Modify date |
| `default` | ✅ | | Fallback value |
| `escape` / `e` | ✅ | | HTML/JS/CSS/URL escaping |
| `filter` | ✅ | | Filter array with arrow function |
| `find` | ✅ | 3.11+ | First matching element |
| `first` | ✅ | | First element |
| `format` | ✅ | | `sprintf`-style formatting |
| `invoke` | ✅ | 3.19+ | Call arrow function as filter |
| `join` | ✅ | | Array to string |
| `json_encode` | ✅ | | Encode to JSON |
| `keys` | ✅ | | Get array keys |
| `last` | ✅ | | Last element |
| `length` | ✅ | | Count elements or string length |
| `lower` | ✅ | | Lowercase |
| `map` | ✅ | | Transform with arrow function |
| `merge` | ✅ | | Merge arrays/mappings |
| `nl2br` | ✅ | | Newlines to `<br>` |
| `number_format` | ✅ | | Format number |
| `raw` | ✅ | | Mark as safe (no escaping) |
| `reduce` | ✅ | | Accumulate with arrow function |
| `replace` | ✅ | | String replace |
| `reverse` | ✅ | | Reverse order |
| `round` | ✅ | | Round number |
| `shuffle` | ✅ | 3.11+ | Randomize array order |
| `slice` | ✅ | | Extract portion |
| `slug` | ✅ | 3.3+ | URL-safe string |
| `sort` | ✅ | | Sort (with optional arrow function) |
| `spaceless` | ✅ | | Remove whitespace between tags |
| `split` | ✅ | | String to array |
| `striptags` | ✅ | | Remove HTML tags |
| `title` | ✅ | | Title case |
| `trim` | ✅ | | Remove whitespace |
| `u` | ❌ | | Unicode string operations |
| `upper` | ✅ | | Uppercase |
| `url_encode` | ✅ | | URL encode |
| `html_attr_merge` | 📦 | — | `@toppynl/twing-html-extra` |
| `html_attr_type` | 📦 | — | `@toppynl/twing-html-extra` |

### Functions

| Function | Status | PHP Twig | Notes |
|----------|--------|----------|-------|
| `attribute` | ✅ | | Dynamic attribute access |
| `block` | ✅ | | Render named block |
| `constant` | ✅ | | Access PHP-style constants |
| `cycle` | ✅ | | Cycle through values |
| `date` | ✅ | | Create date object |
| `dump` | ✅ | | Debug output |
| `enum` | ❌ | 3.15+ | Access enum cases |
| `enum_cases` | ❌ | 3.12+ | Iterate all enum cases |
| `include` | ✅ | | Include template as function |
| `max` | ✅ | | Maximum value |
| `min` | ✅ | | Minimum value |
| `parent` | ✅ | | Parent block content |
| `random` | ✅ | | Random value |
| `range` | ✅ | | Number sequence |
| `source` | ✅ | | Raw template source |
| `template_from_string` | ✅ | | Create template from string |
| `html_attr` | 📦 | — | `@toppynl/twing-html-extra` |
| `html_classes` | 📦 | — | `@toppynl/twing-html-extra` |
| `html_cva` | 📦 | — | `@toppynl/twing-html-extra` |
| `component` | 📦 | — | `@toppynl/twing-components` |

### Tests

| Test | Status | PHP Twig | Notes |
|------|--------|----------|-------|
| `constant` | ✅ | | Equals a constant value |
| `defined` | ✅ | | Variable is defined |
| `divisible by` | ✅ | | Divisible by a number |
| `empty` | ✅ | | Is empty |
| `even` | ✅ | | Even number |
| `instanceof` | ✅ | 3.15+ | Instance of a class |
| `iterable` | ✅ | | Can iterate |
| `mapping` | ✅ | | Is associative array |
| `null` / `none` | ✅ | | Is null |
| `odd` | ✅ | | Odd number |
| `same as` | ✅ | | Strict equality |
| `sequence` | ✅ | | Is indexed array |

### Operators & language features

| Feature | Status | PHP Twig | Notes |
|---------|--------|----------|-------|
| `and`, `or`, `not` | ✅ | | Logical operators |
| `b-and`, `b-or`, `b-xor` | ✅ | | Bitwise operators |
| `xor` | ✅ | 3.15+ | Logical exclusive OR |
| `==`, `!=` | ✅ | | Loose equality |
| `===`, `!==` | ✅ | 3.23+ | Strict equality |
| `<`, `<=`, `>`, `>=` | ✅ | | Comparison |
| `<=>` | ✅ | | Spaceship (three-way comparison) |
| `in`, `not in` | ✅ | | Containment check |
| `matches` | ✅ | | Regex match |
| `starts with`, `ends with` | ✅ | | String prefix/suffix |
| `has some`, `has every` | ✅ | 3.5+ | Collection predicates |
| `+`, `-`, `*`, `/`, `//`, `%`, `**` | ✅ | | Arithmetic |
| `~` | ✅ | | String concatenation |
| `..` | ✅ | | Range |
| `??` | ✅ | | Null coalescing |
| `?:` | ✅ | | Ternary / Elvis |
| `?.` | ✅ | 3.23+ | Null-safe attribute access |
| `=` assignment expression | ✅ | 3.23+ | Assign within expression context |
| `=>` arrow functions | ✅ | 3.0+ | Single-expression lambdas |
| `...` spread | ✅ | 3.7+ | Spread arrays/mappings |
| `\|` filter pipe | ✅ | | Filter application |
| Sequence destructuring | ✅ | 3.23+ | `{% do [a, b] = arr %}` |
| Object destructuring | ✅ | 3.23+ | `{% do {name} = obj %}` |
| String interpolation `#{}` | ✅ | | In double-quoted strings |
| Whitespace control `{%- -%}` | ✅ | | Trim surrounding whitespace |
| Number literals with `_` | ✅ | 3.17+ | `1_000_000` readability |
| Inline expression comments | ❌ | 3.15+ | `{{ value # comment }}` |
| Enum support | ❌ | 3.12+ | `enum()`, `enum_cases()` |

## License

BSD-2-Clause. Based on [nightlycommit/twing](https://github.com/nightlycommit/twing) by Eric MORAND.
