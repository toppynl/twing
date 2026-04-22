# Twing
[![NPM version][npm-image]][npm-url] [![Build Status][build-image]][build-url] [![Coverage percentage][coveralls-image]][coveralls-url] [![Donate][donate-image]][donate-url]

First-class TypeScript and JavaScript Twig compiler

## Prerequisites

This projects needs at least **node.js 16.0.0** to run.

It is also strongly recommended to have [ts-node](https://www.npmjs.com/package/ts-node) and [One Double Zero](https://www.npmjs.com/package/one-double-zero) installed globally to ease the writing of tests and the tracking of the code coverage.

## Usage

### Installation

```shell
npm install
```

### Build the library

```shell
npm run build
```

### Build and run the test suite

```shell
npm run build:test
npm run test
```

### Build and run the test suite in a browser

```shell
npm run build:test
npm run test:browser
```

### Writing and executing tests

Assuming one want to execute the test located in `src/test/tests/integration/comparison/to-array.ts`, one would run:

```shell
ts-node src/test/tests/integration/comparison/to-array.ts
```

It is even possible - and recommended - to track the coverage while writing tests:

```shell
odz ts-node src/test/tests/integration/comparison/to-array.ts
```

Of course, it is also perfectly possible to pipe the result of the test to your favorite tap formatter:

```shell
src/test/tests/integration/comparison$ ts-node . | tap-nyan
 9   -_-_-_-_-_,------,
 0   -_-_-_-_-_|   /\_/\ 
 0   -_-_-_-_-^|__( ^ .^) 
     -_-_-_-_-  ""  "" 
  Pass!
```

## PHP Twig Parity

This table tracks parity with the [official PHP Twig](https://twig.symfony.com/) implementation. The PHP Twig version column notes when a feature was introduced (features without a version have been present since Twig 3.0).

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
| `types` | ✅ | 3.13+ | Parsed and discarded; no runtime effect (placeholder for tooling) |
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
| `html_cva` | 📦 | 3.12+ | `@toppynl/twing-html-extra` |

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

### Operators & Language Features

| Feature | Status | PHP Twig | Notes |
|---------|--------|----------|-------|
| `and`, `or`, `not` | ✅ | | Logical operators |
| `b-and`, `b-or`, `b-xor` | ✅ | | Bitwise operators |
| `xor` | ✅ | 3.15+ | Logical exclusive OR |
| `==`, `!=` | ✅ | | Loose equality |
| `===`, `!==` | ✅ | 3.23+ | Strict equality operators |
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
| `=` (assignment expression) | ✅ | 3.23+ | Assign within expression |
| `=>` (arrow functions) | ✅ | 3.0+ | Single-expression lambdas |
| `...` (spread) | ✅ | 3.7+ | Spread arrays/mappings |
| `\|` (filter pipe) | ✅ | | Filter application |
| Sequence destructuring | ✅ | 3.23+ | `{% do [a, b] = arr %}` |
| Object destructuring | ✅ | 3.23+ | `{% do {name} = obj %}` |
| String interpolation `#{}` | ✅ | | In double-quoted strings |
| Whitespace control `{%- -%}` | ✅ | | Trim surrounding whitespace |
| Inline comments `# …` | ❌ | 3.15+ | Comment inside expressions |
| Number literals with `_` | ✅ | 3.17+ | `1_000_000` readability |
| Enum support | ❌ | 3.12+ | `enum()`, `enum_cases()` |

## Contributing

* Fork this repository
* Code
* Implement tests using [tape](https://github.com/substack/tape)
* Issue a pull request keeping in mind that all pull requests must reference an issue in the issue queue

## License

Copyright © 2018-2023 [Eric MORAND](https://github.com/ericmorand). Released under the [2-Clause BSD License](https://github.com/ericmorand/twing/blob/master/LICENSE).

[npm-image]: https://badge.fury.io/js/twing.svg
[npm-url]: https://npmjs.org/package/twing
[build-image]: https://gitlab.com/nightlycommit/twing/badges/main/pipeline.svg
[build-url]: https://gitlab.com/nightlycommit/twing/-/pipelines
[coveralls-image]: https://coveralls.io/repos/gitlab/nightlycommit/twing/badge.svg
[coveralls-url]: https://coveralls.io/gitlab/nightlycommit/twing
[donate-image]: https://img.shields.io/badge/Donate-PayPal-green.svg
[donate-url]: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=7YZU3L2JL2KJA