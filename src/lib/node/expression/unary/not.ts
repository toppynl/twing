import {TwingBaseUnaryNode, createUnaryNodeFactory} from "../unary";

export interface TwingNotNode extends TwingBaseUnaryNode<"not"> {
}

export const createNotNode = createUnaryNodeFactory<TwingNotNode>("not", {
    execute: (operand, executionContext) => {
        return operand.execute(executionContext)
            .then((value) => !(value));
    }
});
