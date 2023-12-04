import {TwingBaseArrayNode, createBaseArrayNode, getKeyValuePairs} from "./array";
import type {TwingBaseExpressionNode} from "../expression";
import {spreadNodeType} from "./spread";

export const hashNodeType = 'hash'

export interface TwingHashNode extends TwingBaseArrayNode<typeof hashNodeType> {
}

export const createHashNode = (
    elements: Array<{
        key: TwingBaseExpressionNode;
        value: TwingBaseExpressionNode;
    }>,
    line: number,
    column: number
): TwingHashNode => {
    const baseNode = createBaseArrayNode(hashNodeType, elements, line, column);

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
                
                if (valueNode.is(spreadNodeType)) {
                    for (const [valueKey, valueValue] of value as Map<any, any>) {
                        hash.set(valueKey, valueValue);
                    }
                }
                else {
                    hash.set(key, value);
                }
            }
            
            return hash;
        },
        // todo: remove once confirmed that it is not needed
        // is: (type) => {
        //     return type === "hash" || type === "array";
        // }
    };

    return hashNode;
};
