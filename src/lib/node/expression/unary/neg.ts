import {TwingBaseUnaryNode, createUnaryNodeFactory} from "../unary";

export const negativeNodeType = "neg";

export interface TwingNegativeNode extends TwingBaseUnaryNode<typeof negativeNodeType> {
}

export const createNegativeNode = createUnaryNodeFactory<TwingNegativeNode>(negativeNodeType, {
    execute: (baseNode, ...args) => {
        const {operand} = baseNode.children;

        return operand.execute(...args)
            .then((value) => -(value));
    }
});
