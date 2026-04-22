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
