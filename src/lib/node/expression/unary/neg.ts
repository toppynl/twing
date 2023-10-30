import {BaseUnaryNode, createUnaryNodeFactory} from "../unary";

export interface NegativeNode extends BaseUnaryNode<"neg"> {
}

export const createNegativeNode = createUnaryNodeFactory<NegativeNode>("neg", '-');
