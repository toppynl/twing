import {BaseArrayNode, createBaseArrayNode, getKeyValuePairs} from "./array";
import type {BaseExpressionNode} from "../expression";

export const type = 'expression_hash'

export interface HashNode extends BaseArrayNode<"hash"> {
}

export const createHashNode = (
    elements: Array<{
        key: BaseExpressionNode;
        value: BaseExpressionNode;
    }>,
    line: number,
    column: number
): HashNode => {
    const baseNode = createBaseArrayNode("hash", elements, line, column);

    return {
        ...baseNode,
        is: (type) => {
            return type === "hash" || type === "array";
        },
        compile: (compiler) => {
            compiler
                .raw('new Map([')
            ;

            let first = true;

            for (let pair of getKeyValuePairs(baseNode)) {
                if (!first) {
                    compiler.raw(', ');
                }

                first = false;

                compiler
                    .raw('[')
                    .subCompile(pair.key)
                    .raw(', ')
                    .subCompile(pair.value)
                    .raw(']')
                ;
            }

            compiler.raw('])');
        }
    };
};
