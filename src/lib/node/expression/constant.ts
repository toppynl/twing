import type {TwingBaseExpressionNode} from "../expression";
import {createBaseExpressionNode} from "../expression";

export type TwingConstantNodeValue = string | number | boolean | null;

export type TwingConstantNodeAttributes<Value extends TwingConstantNodeValue> = {
    value: Value;
};

export interface TwingConstantNode<Value extends TwingConstantNodeValue = TwingConstantNodeValue> extends TwingBaseExpressionNode<"constant", TwingConstantNodeAttributes<Value>> {
}

export const createConstantNode = <Value extends string | number | boolean | null>(
    value: Value,
    line: number,
    column: number
): TwingConstantNode<Value> => {
    const parent = createBaseExpressionNode("constant", {
        value
    }, {}, line, column);

    const constantNode: TwingConstantNode<Value> = {
        ...parent,
        execute: () => {
            return Promise.resolve(constantNode.attributes.value);
        }
    };

    return constantNode;
};
