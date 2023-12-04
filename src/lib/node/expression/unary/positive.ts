import {TwingBaseUnaryNode, createUnaryNodeFactory} from "../unary";

export interface TwingPositiveNode extends TwingBaseUnaryNode<"positive"> {
}

export const createPositiveNode = createUnaryNodeFactory<TwingPositiveNode>("positive", {
    execute: (operand, executionContext) => {
        return operand.execute(executionContext)
            .then((value) => +(value));
    }
});
