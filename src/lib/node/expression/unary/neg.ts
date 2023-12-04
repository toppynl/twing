import {TwingBaseUnaryNode, createUnaryNodeFactory} from "../unary";

export const negativeNodeType = "neg";

export interface TwingNegativeNode extends TwingBaseUnaryNode<typeof negativeNodeType> {
}

export const createNegativeNode = createUnaryNodeFactory<TwingNegativeNode>(negativeNodeType, {
    execute: (operand, executionContext) => {
        return operand.execute(executionContext)
            .then((value) => -(value));
    }
});
