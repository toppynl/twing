import {TwingBaseUnaryNode, createUnaryNodeFactory} from "../unary";

export interface TwingPositiveNode extends TwingBaseUnaryNode<"positive"> {
}

export const createPositiveNode = createUnaryNodeFactory<TwingPositiveNode>("positive");
