import type {TwingCacheAdapter, TwingSynchronousCacheAdapter} from "./cache-adapter";

export class CacheRuntime {
    constructor(readonly adapter: TwingCacheAdapter) {}
}

export class SynchronousCacheRuntime {
    constructor(readonly adapter: TwingSynchronousCacheAdapter) {}
}
