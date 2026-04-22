# [0.3.0](https://github.com/toppynl/twing/compare/twing-components-v0.2.1...twing-components-v0.3.0) (2026-04-22)


### Bug Fixes

* **ci:** add rollup to root devDependencies for CI build ([dc69c4a](https://github.com/toppynl/twing/commit/dc69c4a6abfd4b179d606012d13e8e82caacf48d))
* **ci:** anchor tags now on correct commits — re-trigger release ([013805a](https://github.com/toppynl/twing/commit/013805aaf4d97c597a3f62c516c46d7c525ee94f))
* **ci:** correct semantic-release-monorepo version and update lockfile ([bd1a270](https://github.com/toppynl/twing/commit/bd1a27098dd1a602e3b7c0aee23c0388aa4ff078))
* **ci:** run semantic-release from package dir for correct monorepo scoping ([8d37fc7](https://github.com/toppynl/twing/commit/8d37fc7ef15e235683ead07c275f96b7001c1067))


### Features

* automated GitHub Actions CI/release pipeline ([#19](https://github.com/toppynl/twing/issues/19)) ([417001e](https://github.com/toppynl/twing/commit/417001e0071b540207d0d57c4c5f335a761090c7))
* **cache:** add {% cache %} tag as @toppynl/twing-cache-extra ([#18](https://github.com/toppynl/twing/issues/18)) ([b6413b0](https://github.com/toppynl/twing/commit/b6413b0091558f45548b785a989a0e66132c5bbc))

# @toppynl/twing-components

## 0.0.0

### Minor Changes

- 25356db: Initial release: port of `symfony/ux-twig-component`.

  - `{% props %}` tag with defaults, required props, `attributes` bag filtering
  - `{% component 'Name' [with {...}] [only] %}...{% endcomponent %}` tag
  - `component('Name', {...})` function for self-closing usage
  - `ComponentAttributes` bag with `.only()`, `.without()`, `.defaults()`, `.nested()`, `.render()`, `[Symbol.iterator]`, `toString()`
  - `<twig:Name />`, `<twig:Name>…</twig:Name>`, `<twig:block name="…">…</twig:block>` syntax via `wrapLoaderWithPreLexer` / `wrapSynchronousLoaderWithPreLexer`
  - `preLexComponents(source)` available as standalone utility
