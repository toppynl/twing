import {TwingBaseUnaryNode, createUnaryNodeFactory} from "../unary";

export interface TwingNegativeNode extends TwingBaseUnaryNode<"negative"> {
}

export const createNegativeNode = createUnaryNodeFactory<TwingNegativeNode>("negative");
