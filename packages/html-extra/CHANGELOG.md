# [0.2.0](https://github.com/toppynl/twing/compare/twing-html-extra-v0.1.1...twing-html-extra-v0.2.0) (2026-04-23)


### Bug Fixes

* **ci:** add rollup to root devDependencies for CI build ([dc69c4a](https://github.com/toppynl/twing/commit/dc69c4a6abfd4b179d606012d13e8e82caacf48d))
* **ci:** anchor tags now on correct commits — re-trigger release ([013805a](https://github.com/toppynl/twing/commit/013805aaf4d97c597a3f62c516c46d7c525ee94f))
* **ci:** correct semantic-release-monorepo version and update lockfile ([bd1a270](https://github.com/toppynl/twing/commit/bd1a27098dd1a602e3b7c0aee23c0388aa4ff078))
* **ci:** run semantic-release from package dir for correct monorepo scoping ([8d37fc7](https://github.com/toppynl/twing/commit/8d37fc7ef15e235683ead07c275f96b7001c1067))
* **components:** normalize colon-namespaced component names to slash paths ([64fc4e6](https://github.com/toppynl/twing/commit/64fc4e6e7b8561c03e61d196360ffe7d5d949ac4))
* **intl-extra:** add luxon to devDependencies, fix filter count in changeset ([22d9ee6](https://github.com/toppynl/twing/commit/22d9ee68f69fdfb6565be7803b7caf0b74ae8762))
* **intl-extra:** declare luxon as peer dependency, use type-only import ([4cba22c](https://github.com/toppynl/twing/commit/4cba22cb4081675ba4355b2efc3976420e0248c6))
* **intl-extra:** document ordinal degradation and guard against currency style in format_number ([f06a91a](https://github.com/toppynl/twing/commit/f06a91a719765c09035d7695a43d081e564fb77a))
* **intl-extra:** improve display name filter robustness and test coverage ([fa69ebc](https://github.com/toppynl/twing/commit/fa69ebc9a2c32155ec594c8c2865fb31712aac8a))
* **intl-extra:** throw on non-empty ICU pattern, align luxon devDep version ([954135a](https://github.com/toppynl/twing/commit/954135addab2a2c7d8ec4a157486139618e9ea12))


### Features

* automated GitHub Actions CI/release pipeline ([#19](https://github.com/toppynl/twing/issues/19)) ([417001e](https://github.com/toppynl/twing/commit/417001e0071b540207d0d57c4c5f335a761090c7))
* **cache:** add {% cache %} tag as @toppynl/twing-cache-extra ([#18](https://github.com/toppynl/twing/issues/18)) ([b6413b0](https://github.com/toppynl/twing/commit/b6413b0091558f45548b785a989a0e66132c5bbc))
* **intl-extra:** add country_timezones filter ([9297389](https://github.com/toppynl/twing/commit/9297389f0a78d119148c3c375f83b7dc00456e64))
* **intl-extra:** add country_timezones, country_names, currency_names, timezone_names, language_names, script_names, locale_names functions ([fac82c4](https://github.com/toppynl/twing/commit/fac82c4c933b8f074a06f2f668d0c0c8eee8801e))
* **intl-extra:** add display name filters (country_name, currency_name, currency_symbol, language_name, locale_name, timezone_name) ([5505a45](https://github.com/toppynl/twing/commit/5505a45937d0b46dd40374aa9f09c596e74eaa98))
* **intl-extra:** add format_currency, format_number, format_*_number filters ([9390b7f](https://github.com/toppynl/twing/commit/9390b7f6655f30b4519ad116b1fa0c378a3fcc70))
* **intl-extra:** add format_datetime, format_date, format_time filters ([7c9e7f7](https://github.com/toppynl/twing/commit/7c9e7f7ab69c2801915b2814cfd66560887ca542))
* **intl-extra:** add ISO 639-1 and ISO 15924 static data ([35cc50d](https://github.com/toppynl/twing/commit/35cc50d74dec4bd9f773f725010db5c16c8fc3b7))
* **intl-extra:** add test harness and stub extension ([5ee4050](https://github.com/toppynl/twing/commit/5ee4050854638a45d7e3ec98cc7e21dd2f7c46d2))
* **intl-extra:** add to workspace, bump min Node to 20, add initial changeset ([175d8f3](https://github.com/toppynl/twing/commit/175d8f38c062605fd2d4838a48fb7d6163669218))
