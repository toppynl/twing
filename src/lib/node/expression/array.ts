import {
    TwingBaseExpressionNode,
    TwingBaseExpressionNodeAttributes,
    createBaseExpressionNode
} from "../expression";
import {TwingConstantNode, createConstantNode} from "./constant";
import {pushToRecord} from "../../helpers/record";

const array_chunk = require('locutus/php/array/array_chunk');

export interface TwingBaseArrayNode<Type extends string> extends TwingBaseExpressionNode<Type, TwingBaseExpressionNodeAttributes, Record<number, TwingBaseExpressionNode>> {
}

export interface TwingArrayNode extends TwingBaseArrayNode<"array"> {
}

export const getKeyValuePairs = (
    node: TwingBaseArrayNode<any>
): Array<{
    key: TwingConstantNode,
    value: TwingBaseExpressionNode
}> => {
    const chunks: Array<[key: TwingConstantNode, value: TwingBaseExpressionNode]> = array_chunk(Object.values(node.children), 2);

    return chunks.map(([key, value]) => {
        return {key, value};
    });
};

export const createBaseArrayNode = <Type extends string>(
    type: Type,
    elements: Array<{
        key: TwingBaseExpressionNode;
        value: TwingBaseExpressionNode;
    }>,
    line: number,
    column: number
): TwingBaseArrayNode<Type> => {
    const children: TwingBaseArrayNode<any>["children"] = {};

    for (const {key, value} of elements) {
        pushToRecord(children, key);
        pushToRecord(children, value);
    }

    const baseNode = createBaseExpressionNode(type, {}, children, line, column);

    const node: TwingBaseArrayNode<Type> = {
        ...baseNode,
        compile: (compiler) => {
            compiler.write('new Map([');

            let first = true;

            for (const pair of getKeyValuePairs(node)) {
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
            }

            compiler.write('])');
        }
    };

    return node;
};

export const createArrayNode = (
    elements: Array<{
        key?: TwingBaseExpressionNode;
        value: TwingBaseExpressionNode;
    }>,
    line: number,
    column: number
): TwingArrayNode => {
    let index = 0;

    const baseNode = createBaseArrayNode("array", elements.map(({key, value}) => {
        return {
            key: key || createConstantNode(index++, line, column),
            value
        };
    }), line, column);

    return {
        ...baseNode
    };
};
