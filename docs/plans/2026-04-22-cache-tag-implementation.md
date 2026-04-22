# Cache Tag Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the Twig `cache` tag as a new workspace package `@toppynl/twing-cache-extra`, with minimal additions to core (`@toppynl/twing`) to support a runtime registry pattern.

**Architecture:** Mirror PHP Twig's `twig/cache-extra` separation. A new `packages/cache/` package provides the tag handler, node, executor, and a `CacheExtension` that registers a `CacheRuntime` wrapping a user-supplied `TwingCacheAdapter`. Core gains a runtime registry (`getRuntime`/`registerRuntime`) and extension interfaces gain an optional `runtimes` property; no dispatcher change (uses existing `customExecute` hook). See design doc: `docs/plans/2026-04-22-cache-tag-design.md`.

**Tech Stack:** TypeScript, rollup, tape (tests), pnpm workspaces, Changesets.

**Reference files to read first:**
- `docs/plans/2026-04-22-cache-tag-design.md` — the approved design
- `CLAUDE.md` — fork conventions, dual `lib`/`light` rule, package layout
- `packages/components/src/main/lib/` — prior art for package structure and `customExecute` hook
- `src/main/lib/tag-handler/with.ts` + `src/main/lib/node/with.ts` + `src/main/lib/node-executor/with.ts` — clean parallel for a body-bearing tag
- `src/main/lib/node-executor/spaceless.ts` — output-buffer capture pattern

**Dual-build rule:** Every change in `src/main/lib/` must be mirrored in `src/main/light/` when the files exist in both trees. `diff -rq src/main/lib src/main/light` reveals intentionally divergent files. For this plan, `extension.ts` and `extension-set.ts` are identical in both trees; `environment.ts` diverges but receives the same additions.

---

## Phase 1 — Core: extension `runtimes` property

### Task 1.1: Add `runtimes` to `TwingExtension` interfaces

**Files:**
- Modify: `src/main/lib/extension.ts`
- Modify: `src/main/light/extension.ts` (identical file — apply same diff)

**Step 1: Add optional `runtimes` property to both interfaces**

In each file, add to the end of both `TwingExtension` and `TwingSynchronousExtension`:

```typescript
    /**
     * Returns a list of runtime service instances to register with the environment.
     * Runtimes can be retrieved at execution time via `environment.getRuntime(Constructor)`.
     *
     * @return Array<object>
     */
    readonly runtimes?: ReadonlyArray<object>;
```

**Step 2: Verify typecheck passes**

Run: `pnpm run build:main`
Expected: existing extensions (e.g. `createCoreExtension`) that don't declare `runtimes` still compile (it's optional).

**Step 3: Commit**

```bash
git add src/main/lib/extension.ts src/main/light/extension.ts
git commit -m "feat(core): add optional runtimes property to extension interfaces"
```

---

### Task 1.2: Write failing test for environment runtime registry

**Files:**
- Create: `src/test/tests/unit/environment/runtime-registry.ts`

**Step 1: Write failing test**

```typescript
import tape from "tape";
import {createArrayLoader, createEnvironment, createSynchronousArrayLoader, createSynchronousEnvironment} from "../../../../main/lib";

class FakeRuntime {
    readonly tag = "fake";
}

tape("environment.registerRuntime + getRuntime", ({test}) => {
    test("async: registered runtime is retrievable by constructor", ({equal, end}) => {
        const environment = createEnvironment(createArrayLoader({}));
        const instance = new FakeRuntime();
        environment.registerRuntime(instance);
        equal(environment.getRuntime(FakeRuntime), instance);
        end();
    });

    test("async: getRuntime throws when no runtime registered", ({throws, end}) => {
        const environment = createEnvironment(createArrayLoader({}));
        throws(() => environment.getRuntime(FakeRuntime), /no runtime registered/i);
        end();
    });

    test("sync: registered runtime is retrievable by constructor", ({equal, end}) => {
        const environment = createSynchronousEnvironment(createSynchronousArrayLoader({}));
        const instance = new FakeRuntime();
        environment.registerRuntime(instance);
        equal(environment.getRuntime(FakeRuntime), instance);
        end();
    });

    test("extension runtimes are auto-registered on addExtension", ({equal, end}) => {
        const environment = createEnvironment(createArrayLoader({}));
        const instance = new FakeRuntime();
        environment.addExtension({
            filters: [], functions: [], tests: [], operators: [],
            nodeVisitors: [], tagHandlers: [],
            runtimes: [instance]
        });
        equal(environment.getRuntime(FakeRuntime), instance);
        end();
    });
});
```

**Step 2: Run and verify it fails**

Run: `npx ts-node src/test/tests/unit/environment/runtime-registry.ts`
Expected: FAIL — `environment.registerRuntime is not a function`.

**Step 3: Do NOT commit yet (tests come with implementation in the next task).**

---

### Task 1.3: Add `registerRuntime` + `getRuntime` to environment interfaces

**Files:**
- Modify: `src/main/lib/environment.ts`
- Modify: `src/main/light/environment.ts`

**Step 1: Extend both `TwingEnvironment` and `TwingSynchronousEnvironment` interfaces**

Add these method signatures to both interfaces (near the other `add*` methods):

```typescript
    /**
     * Registers a runtime service instance. The instance is keyed by its constructor
     * and retrievable via `getRuntime(Constructor)`. Typically called by extensions
     * via their `runtimes` property, but may be called directly.
     */
    registerRuntime(runtime: object): void;

    /**
     * Returns a previously registered runtime instance by its constructor.
     *
     * @throws {Error} When no runtime is registered for the given constructor.
     */
    getRuntime<T>(ctor: abstract new (...args: any[]) => T): T;
```

**Step 2: Implement in `createEnvironment`**

Inside `createEnvironment`, add a runtime registry map alongside the extension set, and implement both methods:

```typescript
    const runtimes = new Map<Function, object>();

    // ... inside the returned environment object:
    registerRuntime: (runtime: object) => {
        runtimes.set(runtime.constructor, runtime);
    },
    getRuntime: <T>(ctor: abstract new (...args: any[]) => T): T => {
        const runtime = runtimes.get(ctor as Function);

        if (runtime === undefined) {
            throw new Error(`No runtime registered for "${ctor.name}"`);
        }

        return runtime as T;
    },
```

**Step 3: Repeat for `createSynchronousEnvironment`** in the same file.

**Step 4: Mirror all changes to `src/main/light/environment.ts`**

The light environment has the same shape with different imports. Use the same additions.

**Step 5: Run the test — it should still fail** because `addExtension` doesn't yet register runtimes.

Run: `npx ts-node src/test/tests/unit/environment/runtime-registry.ts`
Expected: first three tests PASS, fourth (auto-register) FAILS.

**Step 6: Do NOT commit yet.**

---

### Task 1.4: Auto-register runtimes when `addExtension` is called

**Files:**
- Modify: `src/main/lib/extension-set.ts`
- Modify: `src/main/light/extension-set.ts` (identical file — apply same diff)

The extension-set currently owns `addExtension`. Runtime registration must happen on the environment, not the set, so we need the environment to hook into `addExtension`.

**Approach:** wrap the extensionSet's `addExtension` in the environment.

**Step 1: In `createEnvironment` (both lib and light)**, replace:

```typescript
addExtension: extensionSet.addExtension,
```

with:

```typescript
addExtension: (extension) => {
    extensionSet.addExtension(extension);

    for (const runtime of extension.runtimes ?? []) {
        environment.registerRuntime(runtime);
    }
},
```

Since `environment` is defined via a `const environment: TwingEnvironment = { ... }` literal, `environment` isn't in scope yet inside the object literal. Look at how `loadTemplate` in the existing code handles this — it closes over `environment` by being declared after the binding. The pattern is: the closure captures the outer binding, which is populated before any method is actually invoked.

**Step 2: Do the same in `createSynchronousEnvironment`.**

**Step 3: Run the test**

Run: `npx ts-node src/test/tests/unit/environment/runtime-registry.ts`
Expected: all four tests PASS.

**Step 4: Run existing test suite to catch regressions**

Run: `npm run test`
Expected: pre-existing test count passes, no regressions.

**Step 5: Commit**

```bash
git add src/main/lib/environment.ts src/main/light/environment.ts src/main/lib/extension-set.ts src/main/light/extension-set.ts src/test/tests/unit/environment/runtime-registry.ts
git commit -m "feat(core): add runtime registry to environment with extension auto-register"
```

---

## Phase 2 — Package scaffolding for `packages/cache/`

### Task 2.1: Copy package structure from `packages/components/`

**Files:**
- Create: `packages/cache/package.json`
- Create: `packages/cache/src/main/tsconfig.json`
- Create: `packages/cache/src/main/rollup.config.mjs`
- Create: `packages/cache/src/test/tsconfig.json`
- Create: `packages/cache/src/test/rollup.config.mjs`
- Create: `packages/cache/src/main/lib.ts` (stub)
- Create: `packages/cache/src/main/light.ts` (stub)

**Step 1: Copy tooling files verbatim from components, adjusting the package name**

```bash
mkdir -p packages/cache/src/main/lib packages/cache/src/main/light packages/cache/src/test/tests
cp packages/components/src/main/tsconfig.json packages/cache/src/main/tsconfig.json
cp packages/components/src/main/rollup.config.mjs packages/cache/src/main/rollup.config.mjs
cp packages/components/src/test/tsconfig.json packages/cache/src/test/tsconfig.json
cp packages/components/src/test/rollup.config.mjs packages/cache/src/test/rollup.config.mjs
```

Open each and verify no component-specific references need updating. The rollup plugin `@nightlycommit/rollup-plugin-package-manifest` emits the published `package.json` — inspect the rollup config to confirm.

**Step 2: Write `packages/cache/package.json`**

```json
{
  "name": "@toppynl/twing-cache-extra",
  "version": "0.0.0-workspace-local",
  "private": true,
  "scripts": {
    "prebuild:test": "pnpm run build:main",
    "prebuild:test:browser": "pnpm run build:test",
    "build:main": "(cd src/main && rollup -c)",
    "build:test": "(cd src/test && rollup -c)",
    "test": "node src/test/target/index.cjs",
    "test:browser": "browserify src/test/target/index.cjs | tape-run --sandbox=false"
  },
  "dependencies": {
    "@nightlycommit/rollup-plugin-package-manifest": "^1.0.0-alpha.2",
    "@types/node": "^16.18.126",
    "@types/tape": "^5.8.1",
    "@vitrail/rollup-plugin-typescript": "^1.0.4-beta.0",
    "browserify": "^17.0.0",
    "rollup": "^4.0.0",
    "tape": "^5.6.1",
    "tape-run": "^11.0.0",
    "@toppynl/twing": "workspace:*"
  }
}
```

**Step 3: Write stub entry points so rollup has something to build**

`packages/cache/src/main/lib.ts`:

```typescript
export * from "./lib/index";
```

`packages/cache/src/main/light.ts`:

```typescript
export * from "./light/index";
```

`packages/cache/src/main/lib/index.ts`:

```typescript
export const packageName = "@toppynl/twing-cache-extra";
```

`packages/cache/src/main/light/index.ts`:

```typescript
export const packageName = "@toppynl/twing-cache-extra";
```

`packages/cache/src/test/index.ts`:

```typescript
import "./tests/index";
```

`packages/cache/src/test/tests/index.ts`:

```typescript
// tests will be imported here
```

**Step 4: Install and build**

Run: `pnpm install`
Run: `pnpm --filter @toppynl/twing-cache-extra run build:main`
Expected: builds without errors into `packages/cache/src/main/target/`.

**Step 5: Commit**

```bash
git add packages/cache
git commit -m "feat(cache): scaffold @toppynl/twing-cache-extra package"
```

---

## Phase 3 — Cache adapter interface + runtime

### Task 3.1: Write failing test for `CacheRuntime` delegation

**Files:**
- Create: `packages/cache/src/test/tests/unit/cache-runtime.ts`

**Step 1: Write failing test**

```typescript
import tape from "tape";
import {CacheRuntime, SynchronousCacheRuntime} from "../../../main/lib";
import type {TwingCacheAdapter, TwingSynchronousCacheAdapter} from "../../../main/lib";

tape("CacheRuntime exposes the adapter it wraps", ({equal, end}) => {
    const adapter: TwingCacheAdapter = {
        get: async (_key, _ttl, compute) => compute()
    };
    const runtime = new CacheRuntime(adapter);
    equal(runtime.adapter, adapter);
    end();
});

tape("SynchronousCacheRuntime exposes the adapter it wraps", ({equal, end}) => {
    const adapter: TwingSynchronousCacheAdapter = {
        get: (_key, _ttl, compute) => compute()
    };
    const runtime = new SynchronousCacheRuntime(adapter);
    equal(runtime.adapter, adapter);
    end();
});
```

Register it from `packages/cache/src/test/tests/index.ts`:

```typescript
import "./unit/cache-runtime";
```

**Step 2: Run, verify it fails**

Run: `pnpm --filter @toppynl/twing-cache-extra run test`
Expected: build fails — `CacheRuntime` not exported.

---

### Task 3.2: Implement `TwingCacheAdapter` + `CacheRuntime`

**Files:**
- Create: `packages/cache/src/main/lib/cache-adapter.ts`
- Create: `packages/cache/src/main/lib/cache-runtime.ts`
- Create: `packages/cache/src/main/light/cache-adapter.ts` (identical)
- Create: `packages/cache/src/main/light/cache-runtime.ts` (identical)
- Modify: `packages/cache/src/main/lib/index.ts`
- Modify: `packages/cache/src/main/light/index.ts`

**Step 1: Write `cache-adapter.ts` (lib and light — identical)**

```typescript
export interface TwingCacheAdapter {
    /**
     * Returns the cached value for `key`. On miss, `compute` is invoked to produce
     * the value and store it with the given TTL. When `ttl` is null, no expiry is
     * enforced.
     */
    get(key: string, ttl: number | null, compute: () => Promise<string>): Promise<string>;
}

export interface TwingSynchronousCacheAdapter {
    get(key: string, ttl: number | null, compute: () => string): string;
}
```

**Step 2: Write `cache-runtime.ts` (lib and light — identical)**

```typescript
import type {TwingCacheAdapter, TwingSynchronousCacheAdapter} from "./cache-adapter";

export class CacheRuntime {
    constructor(readonly adapter: TwingCacheAdapter) {}
}

export class SynchronousCacheRuntime {
    constructor(readonly adapter: TwingSynchronousCacheAdapter) {}
}
```

**Step 3: Re-export from `index.ts` (both lib and light)**

```typescript
export const packageName = "@toppynl/twing-cache-extra";
export type {TwingCacheAdapter, TwingSynchronousCacheAdapter} from "./cache-adapter";
export {CacheRuntime, SynchronousCacheRuntime} from "./cache-runtime";
```

**Step 4: Run tests**

Run: `pnpm --filter @toppynl/twing-cache-extra run test`
Expected: two PASS.

**Step 5: Commit**

```bash
git add packages/cache
git commit -m "feat(cache): add TwingCacheAdapter interfaces and CacheRuntime"
```

---

## Phase 4 — Cache node + executor

### Task 4.1: Write failing test for the cache executor

**Files:**
- Create: `packages/cache/src/test/tests/unit/cache-executor.ts`

**Step 1: Write failing test**

The test cannot easily unit-test the executor in isolation (it needs an execution context). Promote this to an integration test in Phase 7 and skip the isolated unit test. Delete this step — move to task 4.2.

---

### Task 4.2: Implement the cache node

**Files:**
- Create: `packages/cache/src/main/lib/node/cache.ts`
- Create: `packages/cache/src/main/light/node/cache.ts` (identical)

**Step 1: Write the node**

```typescript
import type {TwingBaseExpressionNode, TwingBaseNode, TwingBaseNodeAttributes} from "@toppynl/twing";
import {createBaseNode} from "@toppynl/twing";
import {executeCacheNode, executeCacheNodeSynchronously} from "../node-executor/cache";

export type TwingCacheNodeAttributes = TwingBaseNodeAttributes;

export type TwingCacheNodeChildren = {
    key: TwingBaseExpressionNode;
    body: TwingBaseNode;
    ttl?: TwingBaseExpressionNode;
};

export type TwingCacheNode =
    TwingBaseNode<"__twing_cache_cache__", TwingCacheNodeAttributes, TwingCacheNodeChildren> & {
        customExecute: typeof executeCacheNode;
        customExecuteSynchronously: typeof executeCacheNodeSynchronously;
    };

export const createCacheNode = (
    key: TwingBaseExpressionNode,
    ttl: TwingBaseExpressionNode | null,
    body: TwingBaseNode,
    line: number,
    column: number,
    tag: string
): TwingCacheNode => {
    const children: TwingCacheNodeChildren = {key, body};

    if (ttl) {
        children.ttl = ttl;
    }

    const base = createBaseNode("__twing_cache_cache__", {}, children, line, column, tag);

    return {
        ...base,
        customExecute: executeCacheNode,
        customExecuteSynchronously: executeCacheNodeSynchronously
    };
};
```

**Step 2: Mirror in light tree (identical).**

**Step 3: Do not commit yet — the executor doesn't exist. Build will fail in Task 4.3.**

---

### Task 4.3: Implement the cache executor

**Files:**
- Create: `packages/cache/src/main/lib/node-executor/cache.ts`
- Create: `packages/cache/src/main/light/node-executor/cache.ts` (identical)

**Step 1: Write the executor**

```typescript
import type {TwingNodeExecutor, TwingSynchronousNodeExecutor} from "@toppynl/twing";
import type {TwingCacheNode} from "../node/cache";
import {CacheRuntime, SynchronousCacheRuntime} from "../cache-runtime";

export const executeCacheNode: TwingNodeExecutor<TwingCacheNode> = async (node, executionContext) => {
    const {outputBuffer, nodeExecutor: execute, environment} = executionContext;
    const {key: keyNode, ttl: ttlNode, body} = node.children;

    const key = String(await execute(keyNode, executionContext));
    const ttl = ttlNode ? Number(await execute(ttlNode, executionContext)) : null;

    const runtime = environment.getRuntime(CacheRuntime);

    const content = await runtime.adapter.get(key, ttl, async () => {
        outputBuffer.start();
        await execute(body, executionContext);
        return outputBuffer.getAndClean();
    });

    outputBuffer.echo(content);
};

export const executeCacheNodeSynchronously: TwingSynchronousNodeExecutor<TwingCacheNode> = (node, executionContext) => {
    const {outputBuffer, nodeExecutor: execute, environment} = executionContext;
    const {key: keyNode, ttl: ttlNode, body} = node.children;

    const key = String(execute(keyNode, executionContext));
    const ttl = ttlNode ? Number(execute(ttlNode, executionContext)) : null;

    const runtime = environment.getRuntime(SynchronousCacheRuntime);

    const content = runtime.adapter.get(key, ttl, () => {
        outputBuffer.start();
        execute(body, executionContext);
        return outputBuffer.getAndClean();
    });

    outputBuffer.echo(content);
};
```

**Step 2: Mirror in light.**

**Step 3: Verify typecheck**

Run: `pnpm --filter @toppynl/twing-cache-extra run build:main`
Expected: builds successfully. Common failure: `TwingExecutionContext` doesn't know `environment.getRuntime` — this should work because we added it in Phase 1.

**Step 4: Commit**

```bash
git add packages/cache
git commit -m "feat(cache): add TwingCacheNode and executor"
```

---

## Phase 5 — Tag handler

### Task 5.1: Implement `createCacheTagHandler`

**Files:**
- Create: `packages/cache/src/main/lib/tag-handler/cache.ts`
- Create: `packages/cache/src/main/light/tag-handler/cache.ts` (identical)

**Step 1: Reference `src/main/lib/tag-handler/with.ts` for the pattern.**

**Step 2: Write the handler**

```typescript
import type {TwingTagHandler} from "@toppynl/twing";
import {Token} from "twig-lexer";
import {createCacheNode} from "../node/cache";

export const createCacheTagHandler = (): TwingTagHandler => {
    const tag = "cache";

    return {
        tag,
        initialize: (parser) => {
            return (token, stream) => {
                const key = parser.parseExpression(stream);

                let ttl = null;

                if (stream.nextIf("NAME", "ttl")) {
                    stream.expect("PUNCTUATION", "(");
                    ttl = parser.parseExpression(stream);
                    stream.expect("PUNCTUATION", ")");
                }

                stream.expect("TAG_END");

                const body = parser.subparse(stream, tag, (t: Token) => t.test("NAME", "endcache"));

                stream.next();
                stream.expect("TAG_END");

                return createCacheNode(key, ttl, body, token.line, token.column, tag);
            };
        }
    };
};
```

**Step 3: Mirror in light.**

**Step 4: Build**

Run: `pnpm --filter @toppynl/twing-cache-extra run build:main`
Expected: builds successfully.

**Step 5: Commit**

```bash
git add packages/cache/src/main/lib/tag-handler packages/cache/src/main/light/tag-handler
git commit -m "feat(cache): add cache tag handler"
```

---

## Phase 6 — Extension and public exports

### Task 6.1: Implement `CacheExtension` and wire up public exports

**Files:**
- Create: `packages/cache/src/main/lib/cache-extension.ts`
- Create: `packages/cache/src/main/light/cache-extension.ts` (identical)
- Modify: `packages/cache/src/main/lib/index.ts`
- Modify: `packages/cache/src/main/light/index.ts`

**Step 1: Write extension**

```typescript
import type {TwingExtension, TwingSynchronousExtension} from "@toppynl/twing";
import type {TwingCacheAdapter, TwingSynchronousCacheAdapter} from "./cache-adapter";
import {CacheRuntime, SynchronousCacheRuntime} from "./cache-runtime";
import {createCacheTagHandler} from "./tag-handler/cache";

export const createCacheExtension = (adapter: TwingCacheAdapter): TwingExtension => {
    return {
        filters: [],
        functions: [],
        nodeVisitors: [],
        operators: [],
        tagHandlers: [createCacheTagHandler()],
        tests: [],
        runtimes: [new CacheRuntime(adapter)]
    };
};

export const createSynchronousCacheExtension = (adapter: TwingSynchronousCacheAdapter): TwingSynchronousExtension => {
    return {
        filters: [],
        functions: [],
        nodeVisitors: [],
        operators: [],
        tagHandlers: [createCacheTagHandler()],
        tests: [],
        runtimes: [new SynchronousCacheRuntime(adapter)]
    };
};
```

**Step 2: Mirror in light.**

**Step 3: Update `index.ts` (both trees)**

```typescript
export const packageName = "@toppynl/twing-cache-extra";
export type {TwingCacheAdapter, TwingSynchronousCacheAdapter} from "./cache-adapter";
export {CacheRuntime, SynchronousCacheRuntime} from "./cache-runtime";
export {createCacheExtension, createSynchronousCacheExtension} from "./cache-extension";
```

**Step 4: Build**

Run: `pnpm --filter @toppynl/twing-cache-extra run build:main`
Expected: builds successfully.

**Step 5: Commit**

```bash
git add packages/cache
git commit -m "feat(cache): add CacheExtension factories and public exports"
```

---

## Phase 7 — Integration tests

### Task 7.1: Build the test harness

**Files:**
- Create: `packages/cache/src/test/tests/harness.ts`

**Step 1: Write the harness** (modeled on `packages/components/src/test/tests/harness.ts`)

```typescript
import tape, {Test} from "tape";
import {
    createArrayLoader,
    createEnvironment,
    createSynchronousArrayLoader,
    createSynchronousEnvironment
} from "@toppynl/twing";
import {
    createCacheExtension,
    createSynchronousCacheExtension,
    type TwingCacheAdapter,
    type TwingSynchronousCacheAdapter
} from "../../main/lib";

export type CacheCall = {
    key: string;
    ttl: number | null;
    executedBody: boolean;
};

export const createMockAdapter = (initialStore: Record<string, string> = {}) => {
    const store = new Map(Object.entries(initialStore));
    const calls: CacheCall[] = [];

    const adapter: TwingCacheAdapter = {
        get: async (key, ttl, compute) => {
            const hit = store.get(key);

            if (hit !== undefined) {
                calls.push({key, ttl, executedBody: false});
                return hit;
            }

            const value = await compute();
            store.set(key, value);
            calls.push({key, ttl, executedBody: true});
            return value;
        }
    };

    const syncAdapter: TwingSynchronousCacheAdapter = {
        get: (key, ttl, compute) => {
            const hit = store.get(key);

            if (hit !== undefined) {
                calls.push({key, ttl, executedBody: false});
                return hit;
            }

            const value = compute();
            store.set(key, value);
            calls.push({key, ttl, executedBody: true});
            return value;
        }
    };

    return {adapter, syncAdapter, store, calls};
};

export type CacheCase = {
    description: string;
    template: string;
    context?: Record<string, unknown>;
    expectation: string;
    prePopulated?: Record<string, string>;
    assertCalls?: (calls: CacheCall[], mode: "async" | "sync") => void;
};

export const runCase = ({description, template, context, expectation, prePopulated, assertCalls}: CacheCase) => {
    tape(description, ({test}) => {
        test("asynchronously", async ({equal, end}: Test) => {
            const {adapter, calls} = createMockAdapter(prePopulated ?? {});
            const environment = createEnvironment(createArrayLoader({"index.twig": template}));
            environment.addExtension(createCacheExtension(adapter));

            const actual = await environment.render("index.twig", context ?? {});

            equal(actual, expectation, `${description}: renders as expected (async)`);
            assertCalls?.(calls, "async");
            end();
        });

        test("synchronously", ({equal, end}: Test) => {
            const {syncAdapter, calls} = createMockAdapter(prePopulated ?? {});
            const environment = createSynchronousEnvironment(createSynchronousArrayLoader({"index.twig": template}));
            environment.addExtension(createSynchronousCacheExtension(syncAdapter));

            const actual = environment.render("index.twig", context ?? {});

            equal(actual, expectation, `${description}: renders as expected (sync)`);
            assertCalls?.(calls, "sync");
            end();
        });
    });
};
```

**Step 2: Register tests entry point** (`packages/cache/src/test/tests/index.ts`):

```typescript
import "./unit/cache-runtime";
import "./integration/cache-tag";
```

**Step 3: Commit**

```bash
git add packages/cache/src/test
git commit -m "test(cache): add mock-adapter test harness"
```

---

### Task 7.2: Integration tests

**Files:**
- Create: `packages/cache/src/test/tests/integration/cache-tag.ts`

**Step 1: Write the test cases**

```typescript
import {runCase} from "../harness";

runCase({
    description: "cache miss renders body and stores result",
    template: `{% cache 'k' %}hello{% endcache %}`,
    expectation: "hello",
    assertCalls: (calls) => {
        if (calls.length !== 1 || !calls[0].executedBody || calls[0].key !== "k") {
            throw new Error(`unexpected calls: ${JSON.stringify(calls)}`);
        }
    }
});

runCase({
    description: "cache hit returns cached string without executing body",
    template: `{% cache 'k' %}body-should-not-render{% endcache %}`,
    prePopulated: {"k": "cached"},
    expectation: "cached",
    assertCalls: (calls) => {
        if (calls.length !== 1 || calls[0].executedBody) {
            throw new Error(`expected cache hit with no body execution: ${JSON.stringify(calls)}`);
        }
    }
});

runCase({
    description: "dynamic key from context",
    template: `{% cache 'u_' ~ id %}u={{ id }}{% endcache %}`,
    context: {id: 42},
    expectation: "u=42",
    assertCalls: (calls) => {
        if (calls[0].key !== "u_42") {
            throw new Error(`expected computed key 'u_42', got ${calls[0].key}`);
        }
    }
});

runCase({
    description: "ttl expression is passed to adapter",
    template: `{% cache 'k' ttl(300) %}x{% endcache %}`,
    expectation: "x",
    assertCalls: (calls) => {
        if (calls[0].ttl !== 300) {
            throw new Error(`expected ttl 300, got ${calls[0].ttl}`);
        }
    }
});

runCase({
    description: "no ttl means null",
    template: `{% cache 'k' %}x{% endcache %}`,
    expectation: "x",
    assertCalls: (calls) => {
        if (calls[0].ttl !== null) {
            throw new Error(`expected ttl null, got ${calls[0].ttl}`);
        }
    }
});

runCase({
    description: "ttl from context variable",
    template: `{% cache 'k' ttl(seconds) %}x{% endcache %}`,
    context: {seconds: 60},
    expectation: "x",
    assertCalls: (calls) => {
        if (calls[0].ttl !== 60) {
            throw new Error(`expected ttl 60, got ${calls[0].ttl}`);
        }
    }
});

runCase({
    description: "nested caches are independent",
    template: `outer:{% cache 'outer' %}A{% cache 'inner' %}B{% endcache %}C{% endcache %}`,
    expectation: "outer:ABC",
    assertCalls: (calls) => {
        const keys = calls.map((c) => c.key).sort();
        if (keys.length !== 2 || keys[0] !== "inner" || keys[1] !== "outer") {
            throw new Error(`expected both outer and inner keys, got ${JSON.stringify(keys)}`);
        }
    }
});

runCase({
    description: "body uses context variables on miss",
    template: `{% cache 'k' %}hi {{ name }}{% endcache %}`,
    context: {name: "world"},
    expectation: "hi world"
});

runCase({
    description: "missing runtime throws a helpful error",
    template: `{% cache 'k' %}x{% endcache %}`,
    expectation: "never",
    assertCalls: () => { /* unused */ }
});
```

(Drop the last test case if the harness auto-registers the extension — add a separate direct-env test for the error path.)

**Step 2: Run tests**

Run: `pnpm --filter @toppynl/twing-cache-extra run test`
Expected: all cases PASS (async + sync).

**Step 3: Commit**

```bash
git add packages/cache/src/test/tests/integration
git commit -m "test(cache): add cache tag integration tests"
```

---

### Task 7.3: Final verification

**Step 1: Run the full workspace test suite**

Run: `pnpm run test:workspaces`
Expected: all packages pass.

Run: `npm run test` (root `@toppynl/twing`)
Expected: all tests pass including the new `runtime-registry.ts` unit test.

**Step 2: Check the build output**

Run: `pnpm --filter @toppynl/twing-cache-extra run build:main`

Inspect: `packages/cache/src/main/target/index.cjs` and its sibling `package.json` — verify the emitted manifest declares the correct `main`, `types`, and `exports` fields (mirror what components emits).

**Step 3: Add a Changeset**

Run: `pnpm run changeset`

Describe the new package in the changeset message (minor version of a brand-new package).

**Step 4: Commit changeset**

```bash
git add .changeset
git commit -m "chore: changeset for @toppynl/twing-cache-extra"
```

---

## Known pitfalls

- **`customExecute` binding:** the node returned from `createCacheNode` must include `customExecute` as a property on the object literal. If destructured via `{...base, type: "cache"}` the `customExecute` drop is silent — follow the `ComponentNode` layout exactly.
- **Light build divergence:** every edit in `packages/cache/src/main/lib/**` must be mirrored in `packages/cache/src/main/light/**`. The design deliberately keeps these files identical, but rollup still needs both trees to exist.
- **Runtime key equality:** `environment.getRuntime(CacheRuntime)` must be called from the light tree with a `CacheRuntime` imported from the light tree (or re-exported) — **but** the runtime instance stored by the extension is the same class the user imported. Since we re-export `CacheRuntime` from both `lib` and `light`, and both re-exports point to the same class (the files are identical code but separate modules due to rollup bundling), **verify the round-trip works in a smoke test** early. If the light build bundles a separate copy, the `Map<Function, object>` key won't match. Mitigation if this breaks: key the registry by a `symbol`-based identity declared in the package rather than by class constructor.
- **Extension runtime auto-register:** the closure `extension.runtimes ?? []` must handle undefined gracefully (the core extension declares no runtimes).

## Done when

- [ ] Core has `registerRuntime`/`getRuntime` + extension `runtimes` auto-registered (with tests).
- [ ] `@toppynl/twing-cache-extra` package builds and publishes via the existing Changesets flow.
- [ ] All integration tests pass against both async + sync environments.
- [ ] Workspace test suite (`pnpm run test:workspaces`) green.
- [ ] Root test suite (`npm run test`) green (no core regressions).
