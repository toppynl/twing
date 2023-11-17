import {TwingBaseUnaryNode, createUnaryNodeFactory} from "../unary";

export const notNodeType = "not";

export interface TwingNotNode extends TwingBaseUnaryNode<typeof notNodeType> {
}

export const createNotNode = createUnaryNodeFactory<TwingNotNode>(notNodeType, '!');
