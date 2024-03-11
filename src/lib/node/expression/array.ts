import {
    TwingBaseExpressionNode,
    TwingBaseExpressionNodeAttributes,
    createBaseExpressionNode
} from "../expression";
import {createConstantNode} from "./constant";
import {pushToRecord} from "../../helpers/record";

export interface TwingBaseArrayNode<Type extends string> extends TwingBaseExpressionNode<Type, TwingBaseExpressionNodeAttributes, Record<number, TwingBaseExpressionNode>> {
}

// todo: find an elegant way to type the items of the array
export interface TwingArrayNode extends TwingBaseArrayNode<"array"> {
}

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

    return  createBaseExpressionNode(type, {}, children, line, column);
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
