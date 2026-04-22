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
