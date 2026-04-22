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
