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
