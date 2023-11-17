import {TwingBaseArrayNode, createBaseArrayNode, getKeyValuePairs} from "./array";
import type {TwingBaseExpressionNode} from "../expression";

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

    return {
        ...baseNode,
        is: (type) => {
            return type === "hash" || type === "array";
        },
        compile: (compiler) => {
            compiler
                .write('new Map([')
            ;

            let first = true;

            for (let pair of getKeyValuePairs(baseNode)) {
                if (!first) {
                    compiler.write(', ');
                }

                first = false;

                compiler
                    .write('[')
                    .subCompile(pair.key)
                    .write(', ')
                    .subCompile(pair.value)
                    .write(']')
                ;
            }

            compiler.write('])');
        }
    };
};
