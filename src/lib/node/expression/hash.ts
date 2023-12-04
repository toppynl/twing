import {TwingBaseArrayNode, createBaseArrayNode, getKeyValuePairs} from "./array";
import type {TwingBaseExpressionNode} from "../expression";
import type {TwingNode} from "../../node";

export interface TwingHashNode extends TwingBaseArrayNode<"hash"> {
}

export const createHashNode = (
    elements: Array<{
        key: TwingBaseExpressionNode;
        value: TwingBaseExpressionNode;
    }>,
    line: number,
    column: number
): TwingHashNode => {
    const baseNode = createBaseArrayNode("hash", elements, line, column);

    const hashNode: TwingHashNode = {
        ...baseNode,
        execute: async (executionContext): Promise<Map<string, any>> => {
            const keyValuePairs = getKeyValuePairs(hashNode);

            const hash: Map<any, any> = new Map();

            for (const {key: keyNode, value: valueNode} of keyValuePairs) {
                const [key, value] = await Promise.all([
                    keyNode.execute(executionContext),
                    valueNode.execute(executionContext)
                ]);

                if ((valueNode as TwingNode).type === "spread") {
                    for (const [valueKey, valueValue] of value as Map<any, any>) {
                        hash.set(valueKey, valueValue);
                    }
                }
                else {
                    hash.set(key, value);
                }
            }

            return hash;
        }
    };

    return hashNode;
};
