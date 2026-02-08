import type {TwingNodeExecutor, TwingSynchronousNodeExecutor} from "../../node-executor";
import type {TwingHashNode} from "../../node/expression/hash";
import type {TwingNode} from "../../node";
import {getKeyValuePairs} from "../../helpers/get-key-value-pairs";
import {getEntries} from "../../context";

export const executeHashNode: TwingNodeExecutor<TwingHashNode> = async (node, executionContext) => {
    const {nodeExecutor: execute} = executionContext;
    const keyValuePairs = getKeyValuePairs(node);
    const hash: Map<any, any> = new Map();

    for (const {key: keyNode, value: valueNode} of keyValuePairs) {
        const [key, value] = await Promise.all([
            execute(keyNode, executionContext),
            execute(valueNode, executionContext)
        ]);

        if ((valueNode as TwingNode).type === "spread") {
            for (const [valueKey, valueValue] of value as Map<any, any>) {
                hash.set(valueKey, valueValue);
            }
        } else {
            hash.set(key, value);
        }
    }

    return hash;
};

export const executeHashNodeSynchronously: TwingSynchronousNodeExecutor<TwingHashNode> = (node, executionContext) => {
    const {nodeExecutor: execute} = executionContext;
    const keyValuePairs = getKeyValuePairs(node);
    const hash = new Map();

    for (const {key: keyNode, value: valueNode} of keyValuePairs) {
        const key = execute(keyNode, executionContext);
        const value = execute(valueNode, executionContext);
        
        if ((valueNode as TwingNode).type === "spread") {
            for (const [valueKey, valueValue] of getEntries(value as Record<any, any>)) {
                hash.set(valueKey, valueValue);
            }
        } else {
            hash.set(key, value);
        }
    }

    return hash;
};
