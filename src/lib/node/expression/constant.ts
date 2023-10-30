import type {Node} from "../../node";
import type {BaseExpressionNode} from "../expression";
import {createBaseExpressionNode} from "../expression";

type Attributes = {
    value: Node | string | number | boolean;
};

export interface ConstantNode extends BaseExpressionNode<"expression_constant", Attributes> {
}

export const createConstantNode = (
    value: Attributes["value"],
    line: number,
    column: number
): ConstantNode => {
    const parent = createBaseExpressionNode('expression_constant', {
        value
    }, {}, line, column);

    return {
        ...parent,
        compile: (compiler) => {
            compiler.render(parent.attributes.value);
        },
        clone: () => createConstantNode(value, line, column)
    };
};
