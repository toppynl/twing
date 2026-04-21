# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Twing is a TypeScript/JavaScript compiler for the Twig templating language (a PHP-originated syntax). It parses `.twig` templates into an AST, then executes them either asynchronously or synchronously. Minimum Node.js 16.

## Fork lineage

This repository is a fork of [nightlycommit/twing](https://gitlab.com/nightlycommit/twing) maintained by Toppy NL. The fork exists because upstream has fallen behind Twig (PHP) and we needed extension points the upstream closed-switch architecture didn't expose. Root package is published as `@toppynl/twing` rather than the upstream `twing`.

Changes on top of upstream:
- `customExecute` / `customExecuteSynchronously` fallback in `src/main/lib/node-executor.ts` (and light mirror) so extension packages can register new node types.
- Extra public exports in `src/main/lib.ts` / `light.ts`: `include`, `includeSynchronously`, `getTraceableMethod`, `getSynchronousTraceableMethod`, `iteratorToMap`, `iterableToMap`, `mergeIterables`.
- pnpm workspace with sibling packages under `packages/*`.

## Workspace

This is a pnpm workspace. The root holds the forked `@toppynl/twing` package (its sources under `src/`). Additional packages live under `packages/*`:

- `packages/html-extra/` → published as `@toppynl/twing-html-extra` (port of `twig/html-extra`: `html_classes`, `html_attr`, `html_attr_merge`, `html_attr_type`, `html_cva`).
- `packages/components/` → published as `@toppynl/twing-components` (port of `symfony/ux-twig-component`: `{% props %}`, `{% component %}`, `<twig:…>` pre-lexer, `ComponentAttributes`). Peer-depends on `@toppynl/twing-html-extra` + `@toppynl/twing`.

Each package mirrors the root's `src/main/{lib,light}` dual-build layout and emits its published `package.json` via `@nightlycommit/rollup-plugin-package-manifest` at build time.

Workspace-wide commands from the root:
- `pnpm run build:workspaces` — build `packages/*` (not root `@toppynl/twing`)
- `pnpm run test:workspaces` — test `packages/*`
- `pnpm run changeset` — record a release note
- `pnpm run release` — publish per-package with Changesets

Versioning for `packages/*` is managed by Changesets (`.changeset/config.json`). The root `@toppynl/twing` package is listed under `ignore` and keeps its existing release flow.

## Commands

Scripts are defined in `package.json` and use `npm` directly (not a workspace manager).

- `npm run build:main` — build the main library (both `lib` and `light` entry points) via rollup, then browser bundle via browserify
- `npm run build:test` — build the test suite (rollup)
- `npm run test` — run all tests in Node (`src/test/target/index.cjs` + `entry.cjs` produced by `build:test`)
- `npm run test:browser` — run the test suite in a headless browser via `tape-run`
- `npm run bundle` — browserify + uglifyify the main output into `bundle/lib.min.js`, exposed as global `Twing`

### Running a single test

Tests are tape-based and each file self-executes. Run one directly with `ts-node`:

```
ts-node src/test/tests/integration/comparison/to-array.ts
```

Or with coverage tracking (the repo is configured for `one-double-zero`):

```
odz ts-node src/test/tests/integration/comparison/to-array.ts
```

Coverage config (`.odzrc.json`) excludes `src/main/target/**` and `src/main/light/**`.

## Architecture

### Dual entry points: `lib` vs `light`

`src/main/` exposes two public surfaces via rollup:

- **`lib.ts`** → full Node-capable build. Adds `filesystem` loader, `source-map-runtime`, `iconv` helper, and Node-only bits (`convert_encoding` filter, `random` function variant).
- **`light.ts`** → browser-safe subset. Same shape, but without filesystem/iconv/source-map.

When changing code, make sure parallel files under `src/main/lib/` and `src/main/light/` stay in sync where they share behavior. `diff -rq src/main/lib src/main/light` reveals the intentionally-divergent files (environment, escaping CSS strategy, execution-context, compare, convert_encoding, random, macro handler, template).

Published npm `exports` map: `.` → full build, `./light` → the light build.

### Compiler pipeline

Top-down, an `.twig` source flows through:

1. **Lexer** (`lib/lexer.ts`, built on `twig-lexer`) → token stream (`lib/token-stream.ts`)
2. **Parser** (`lib/parser.ts`) with per-tag **tag handlers** (`lib/tag-handler/*`) → AST nodes (`lib/node/**`)
3. **Node visitors** / **extensions** (`lib/extension/*`, `lib/extension-set.ts`) register filters, functions, tests, operators, node visitors
4. **Node executor** (`lib/node-executor/**`) walks the AST to render output; each node type has a matching executor file
5. **Template** (`lib/template.ts`) + **Environment** (`lib/environment.ts`) are the user-facing entry; `createEnvironment` / `createSynchronousEnvironment` are the main constructors

### Async vs synchronous duality

Nearly every public type has a `TwingSynchronousX` twin (`TwingTemplate`/`TwingSynchronousTemplate`, `TwingFilter`/`TwingSynchronousFilter`, `createEnvironment`/`createSynchronousEnvironment`, etc.). When adding a new filter/function/test/node executor, add the synchronous counterpart too — integration tests run both variants via `TestBase` and diverging behavior will fail the suite.

### Tests

- `src/test/tests/integration/` — end-to-end: declare a `TestBase` subclass with `getTemplates()`, `getExpected()`, optional extensions/options, then call `runTest(createIntegrationTest(new Test()))`. The runner executes both async and synchronous environments.
- `src/test/tests/unit/` — direct unit tests mirroring `src/main/lib` structure.
- Framework is `tape`; assertions and runners come from it.
- `src/test/tests/integration/regression/` contains `issue_NNN.ts` files; existing workflow creates one per fixed issue (see recent commits `Fix issue #643`, etc.) and references it in the PR.

### Style

- `.editorconfig`: 4-space indent, LF, UTF-8 for `.ts`.
- `src/main/tsconfig.json` enables `noUnusedLocals`/`noUnusedParameters` (tests do not).
- Target is `es2017`, strict mode on, module `Preserve` with bundler resolution.

## Build artifacts

Everything under `target/` (both `src/main/target/` and `src/test/target/`) is gitignored and deleted by rollup plugins at the start of each build. Do not hand-edit or import from these paths.
