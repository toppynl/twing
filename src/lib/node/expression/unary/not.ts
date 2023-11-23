import {TwingBaseUnaryNode, createUnaryNodeFactory} from "../unary";

export const notNodeType = "not";

export interface TwingNotNode extends TwingBaseUnaryNode<typeof notNodeType> {
}

export const createNotNode = createUnaryNodeFactory<TwingNotNode>(notNodeType, {
    execute: (baseNode, ...args) => {
        const {operand} = baseNode.children;

        return operand.execute(...args)
            .then((value) => !(value));
    }
});
