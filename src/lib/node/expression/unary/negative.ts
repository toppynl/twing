import {TwingBaseUnaryNode, createUnaryNodeFactory} from "../unary";

export interface TwingNegativeNode extends TwingBaseUnaryNode<"negative"> {
}

export const createNegativeNode = createUnaryNodeFactory<TwingNegativeNode>("negative", {
    execute: (operand, executionContext) => {
        return operand.execute(executionContext)
            .then((value) => -(value));
    }
});
