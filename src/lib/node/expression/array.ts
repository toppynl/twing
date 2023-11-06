import {
    BaseExpressionNode,
    BaseExpressionNodeAttributes,
    createBaseExpressionNode
} from "../expression";
import {ConstantNode, createConstantNode} from "./constant";
import {pushToRecord} from "../../helpers/record";

const array_chunk = require('locutus/php/array/array_chunk');

export interface BaseArrayNode<Type extends string> extends BaseExpressionNode<Type, BaseExpressionNodeAttributes, Record<number, BaseExpressionNode>> {
}

export interface ArrayNode extends BaseArrayNode<"array"> {
}

export const getKeyValuePairs = (
    node: BaseArrayNode<any>
): Array<{
    key: ConstantNode,
    value: BaseExpressionNode
}> => {
    const chunks: Array<[key: ConstantNode, value: BaseExpressionNode]> = array_chunk(Object.values(node.children), 2);

    return chunks.map(([key, value]) => {
        return {key, value};
    });
};

export const createBaseArrayNode = <Type extends string>(
    type: Type,
    elements: Array<{
        key: BaseExpressionNode;
        value: BaseExpressionNode;
    }>,
    line: number,
    column: number
): BaseArrayNode<Type> => {
    const children: BaseArrayNode<any>["children"] = {};

    for (const {key, value} of elements) {
        pushToRecord(children, key);
        pushToRecord(children, value);
    }

    const baseNode = createBaseExpressionNode(type, {}, children, line, column);
    
    const node: BaseArrayNode<Type> = {
        ...baseNode,
        compile: (compiler, flags) => {
            if (flags?.isDefinedTest) {
                compiler.render(true);
            }
            else {
                compiler.raw('new Map([');

                let first = true;

                for (const pair of getKeyValuePairs(node)) {
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
                }

                compiler.raw('])');
            }
        }
    };
    
    return node;
};

export const createArrayNode = (
    elements: Array<{
        key?: BaseExpressionNode;
        value: BaseExpressionNode;
    }>,
    line: number,
    column: number
): ArrayNode => {
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
