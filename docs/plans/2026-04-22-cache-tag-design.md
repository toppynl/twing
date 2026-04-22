# Cache Tag Implementation Design

**Date:** 2026-04-22
**Status:** Design approved, ready for implementation plan

## Goal

Port the Twig `cache` tag (`twig/cache-extra`) to the Twing fork. The tag caches rendered fragments with an optional TTL:

```twig
{% cache "user_" ~ user.id ttl(300) %}
    ... expensive content ...
{% endcache %}
```

## Fork-lineage decision

The upstream `cache` tag does not live in core `twig/twig`; it's a separate composer package `twig/cache-extra`. We mirror that separation by publishing the tag as a new workspace package `packages/cache/` → `@toppynl/twing-cache-extra`, joining the existing `html-extra` and `components` packages.

## Pattern decision

PHP Twig uses a "runtime" pattern: the cache adapter is never stored on the node or the extension. The `CacheNode` compiles to a runtime lookup through the environment (`env->getRuntime(CacheRuntime)`), and the adapter is resolved lazily at render time. We mirror this pattern.

Alternatives considered:
- **`customExecute` closures on the node** — self-contained but embeds the adapter in the AST.
- **`getExtension()` lookup** — less precise than a dedicated runtime registry; conflates extensions with their runtime services.

The runtime registry pattern was chosen because it matches upstream exactly and cleanly separates tag registration (compile-time, in the extension) from adapter access (runtime, through a named service).

## Architecture

### Core changes (`@toppynl/twing`)

Two minimal additions:

1. **Runtime registry** on both `TwingEnvironment` and `TwingSynchronousEnvironment`:
   - `registerRuntime(instance: object): void`
   - `getRuntime<T>(ctor: abstract new (...args: any[]) => T): T`
   - Backed by a `Map<Function, object>` keyed by constructor.
2. **`runtimes` property** added to `TwingExtension` / `TwingSynchronousExtension` interfaces. When `addExtension` is called, each declared runtime is auto-registered. This keeps extension registration as a single user-facing call.

**No core dispatcher change.** The existing `customExecute` / `customExecuteSynchronously` fallback in `src/main/lib/node-executor.ts` (used by `packages/components/`) handles new node types from extension packages. The cache node carries these closures as properties, following the same convention as `ComponentNode`.

### New package (`packages/cache/`)

Published as `@toppynl/twing-cache-extra`. Peer-depends on `@toppynl/twing`. Layout mirrors the existing `html-extra` / `components` packages, with the dual `lib`/`light` build and `@nightlycommit/rollup-plugin-package-manifest` emitting `package.json` at build time.

Files:

```
src/main/lib/
  cache-adapter.ts         TwingCacheAdapter / TwingSynchronousCacheAdapter
  cache-runtime.ts         CacheRuntime / SynchronousCacheRuntime
  cache-extension.ts       CacheExtension / SynchronousCacheExtension
  tag-handler/cache.ts     createCacheTagHandler / createSynchronousCacheTagHandler
  node/cache.ts            TwingCacheNode + createCacheNode
  node-executor/cache.ts   executeCacheNode + executeCacheNodeSynchronously
  index.ts                 public exports
```

Mirrored `src/main/light/` surface with the same shape.

## Interfaces

### Cache adapter (user-supplied)

Callback-style `get`: on miss, `compute` is called; on hit, the cached string is returned without invoking `compute`.

```typescript
export interface TwingCacheAdapter {
    get(key: string, ttl: number | null, compute: () => Promise<string>): Promise<string>;
}

export interface TwingSynchronousCacheAdapter {
    get(key: string, ttl: number | null, compute: () => string): string;
}
```

### Cache runtime (internal)

Thin wrapper; enables lookup by class from the environment's runtime registry.

```typescript
export class CacheRuntime {
    constructor(readonly adapter: TwingCacheAdapter) {}
}

export class SynchronousCacheRuntime {
    constructor(readonly adapter: TwingSynchronousCacheAdapter) {}
}
```

### Extension

```typescript
export class CacheExtension implements TwingExtension {
    readonly runtimes: [CacheRuntime];
    readonly tagHandlers: [TwingTagHandler];
    readonly filters = [];  readonly functions = [];
    readonly tests = [];    readonly operators = [];
    readonly nodeVisitors = [];

    constructor(adapter: TwingCacheAdapter) {
        this.runtimes = [new CacheRuntime(adapter)];
        this.tagHandlers = [createCacheTagHandler()];
    }
}
```

## Tag syntax & parser

```twig
{% cache key %}...{% endcache %}
{% cache key ttl(n) %}...{% endcache %}
```

Both `key` and `n` are arbitrary Twig expressions. `ttl` is optional; when absent, `null` is passed to the adapter (no expiry).

Parser (follows the `with` tag handler pattern):

```typescript
return (token, stream) => {
    const key = parser.parseExpression(stream);

    let ttl: TwingBaseExpressionNode | null = null;
    if (stream.nextIf("NAME", "ttl")) {
        stream.expect("PUNCTUATION", "(");
        ttl = parser.parseExpression(stream);
        stream.expect("PUNCTUATION", ")");
    }

    stream.expect("TAG_END");

    const body = parser.subparse(stream, tag, (t) => t.test("NAME", "endcache"));
    stream.next();
    stream.expect("TAG_END");

    return createCacheNode(key, ttl, body, token.line, token.column, tag);
};
```

## Node

```typescript
type TwingCacheNodeAttributes = TwingBaseNodeAttributes;

type TwingCacheNodeChildren = {
    key: TwingBaseExpressionNode;
    ttl?: TwingBaseExpressionNode;
    body: TwingBaseNode;
};

export type TwingCacheNode =
    TwingBaseNode<"__twing_cache_cache__", TwingCacheNodeAttributes, TwingCacheNodeChildren> & {
        customExecute: typeof executeCacheNode;
        customExecuteSynchronously: typeof executeCacheNodeSynchronously;
    };
```

## Node executor

Captures the output buffer, passes the produced string to the adapter's `get` callback, echoes the result. Mirrors the `spaceless` executor's output-buffer pattern.

```typescript
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
```

Synchronous variant is identical, with `await`/`async` removed and `SynchronousCacheRuntime` used.

## Testing

All tests live in `packages/cache/src/test/`.

**Integration tests** (`TestBase` subclasses, run against both async + sync environments):
1. Cache miss — body renders, result stored via mock adapter
2. Cache hit — body never executes, cached string returned
3. Dynamic key (`"prefix_" ~ id`) — correct key resolved at runtime
4. `ttl(n)` — TTL value passed through to adapter
5. Nested cache tags — inner cache populates independently

**Unit tests**:
- `CacheRuntime` delegation
- Environment `getRuntime` / `registerRuntime` behavior (core)

No browser-specific tests (no DOM concerns; output buffer is environment-neutral).

## Out of scope

- `tags` parameter from the Symfony cache-extra spec (cache invalidation tagging) — not part of initial implementation.
- Any concrete cache adapter (filesystem, redis, etc.). The package ships the interface; users wire their own backend.
