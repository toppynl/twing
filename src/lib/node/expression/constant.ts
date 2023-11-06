import type {BaseExpressionNode} from "../expression";
import {createBaseExpressionNode} from "../expression";

type Attributes = {
    value: string | number | boolean | null;
};

export interface ConstantNode extends BaseExpressionNode<"constant", Attributes> {
}

export const createConstantNode = (
    value: Attributes["value"],
    line: number,
    column: number
): ConstantNode => {
    const parent = createBaseExpressionNode('constant', {
        value
    }, {}, line, column);

    return {
        ...parent,
        compile: (compiler, flags) => {
            if (flags?.isDefinedTest) {
                compiler.render(true);
            }
            else {
                compiler.render(parent.attributes.value);
            }
        }
    };
};
