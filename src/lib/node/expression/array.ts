import {
    BaseExpressionNode,
    BaseExpressionNodeAttributes,
    createBaseExpressionNode,
    ExpressionNode
} from "../expression";
import {createConstantNode} from "./constant";
import {pushToRecord} from "../../helpers/record";
import {isANumber} from "../../helpers/is-a-number";
import {BaseNode} from "../../node";

const array_chunk = require('locutus/php/array/array_chunk');

export interface BaseArrayNode<Type extends string> extends BaseExpressionNode<Type, BaseExpressionNodeAttributes, Record<number, ExpressionNode>> {
    addElement: (value: ExpressionNode, key?: ExpressionNode) => void;
    getKeyValuePairs: () => Array<{
        key: ExpressionNode,
        value: ExpressionNode
    }>;
}

export interface ArrayNode extends BaseArrayNode<"array"> {
}

export const isAnArrayNode = (node: BaseNode<any>): node is BaseArrayNode<any> => {
    return typeof (node as BaseArrayNode<any>).getKeyValuePairs === "function"
        && typeof (node as BaseArrayNode<any>).addElement === "function";
};

export const createBaseArrayNode = <Type extends string>(
    type: Type,
    elements: Record<number, ExpressionNode>,
    line: number,
    column: number
): BaseArrayNode<Type> => {
    const baseNode = createBaseExpressionNode(type, {}, elements, line, column);

    let index: number = -1;

    const getKeyValuePairs: BaseArrayNode<Type>["getKeyValuePairs"] = () => {
        const chunks: Array<[key: ExpressionNode, value: ExpressionNode]> = array_chunk(Object.values(baseNode.children), 2);

        return chunks.map(([key, value]) => {
            return {key, value};
        });
    };

    for (let pair of getKeyValuePairs()) {
        let expression = pair.key;

        if (expression.type === "expression_constant") {
            const {value} = expression.attributes;

            if (isANumber(value) && (value > index)) {
                index = value;
            }
        }
    }

    return {
        ...baseNode,
        addElement: (value, key) => {
            if (key === undefined) {
                index++;

                key = createConstantNode(index, value.line, value.column);
            }

            pushToRecord(baseNode.children, key);
            pushToRecord(baseNode.children, value);
        },
        getKeyValuePairs,
        compile: (compiler) => {
            compiler.raw('new Map([');

            let first = true;

            for (let pair of getKeyValuePairs()) {
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
        },
        clone: () => createBaseArrayNode(type, {...baseNode.children}, line, column)
    }
};

export const createArrayNode = (
    elements: Record<number, ExpressionNode>,
    line: number,
    column: number
): ArrayNode => {
    const baseNode = createBaseArrayNode("array", elements, line, column);

    return {
        ...baseNode,
        clone: () => createArrayNode({...baseNode.children}, line, column)
    };
};
