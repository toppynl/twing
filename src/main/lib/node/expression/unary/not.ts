import {TwingBaseUnaryNode, createUnaryNodeFactory} from "../unary";

export interface TwingNotNode extends TwingBaseUnaryNode<"not"> {
}

export const createNotNode = createUnaryNodeFactory<TwingNotNode>("not");
