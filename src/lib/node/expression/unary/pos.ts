import {BaseUnaryNode, createUnaryNodeFactory} from "../unary";

export interface PositiveNode extends BaseUnaryNode<"pos"> {
}

export const createPositiveNode = createUnaryNodeFactory<PositiveNode>("pos", '+');
