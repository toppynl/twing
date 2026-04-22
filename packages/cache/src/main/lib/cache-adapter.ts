export interface TwingCacheAdapter {
    /**
     * Returns the cached value for `key`. On miss, `compute` is invoked to produce
     * the value and store it with the given TTL. When `ttl` is null, no expiry is
     * enforced.
     */
    get(key: string, ttl: number | null, compute: () => Promise<string>): Promise<string>;
}

export interface TwingSynchronousCacheAdapter {
    /**
     * Returns the cached value for `key`. On miss, `compute` is invoked to produce
     * the value and store it with the given TTL. When `ttl` is null, no expiry is
     * enforced.
     */
    get(key: string, ttl: number | null, compute: () => string): string;
}
