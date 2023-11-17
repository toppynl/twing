import type {TwingBaseExpressionNode} from "../expression";
import {createBaseExpressionNode} from "../expression";

type TwingConstantNodeAttributes = {
    value: string | number | boolean | null;
};

// todo: make it generic to narrow the value type and remove casting in the code
export interface TwingConstantNode extends TwingBaseExpressionNode<"constant", TwingConstantNodeAttributes> {
}

export const createConstantNode = (
    value: TwingConstantNodeAttributes["value"],
    line: number,
    column: number
): TwingConstantNode => {
    const parent = createBaseExpressionNode('constant', {
        value
    }, {}, line, column);

    return {
        ...parent,
        compile: (compiler) => {
            compiler.render(parent.attributes.value);
        }
    };
};
