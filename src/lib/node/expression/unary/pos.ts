import {TwingBaseUnaryNode, createUnaryNodeFactory} from "../unary";

export const positiveNodeType = "pos";

export interface TwingPositiveNode extends TwingBaseUnaryNode<typeof positiveNodeType> {
}

export const createPositiveNode = createUnaryNodeFactory<TwingPositiveNode>(positiveNodeType, {
    execute: (operand, executionContext) => {
        return operand.execute(executionContext)
            .then((value) => +(value));
    }
});
