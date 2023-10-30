import {BaseUnaryNode, createUnaryNodeFactory} from "../unary";

export interface NotNode extends BaseUnaryNode<"not"> {
}

export const createNotNode = createUnaryNodeFactory<NotNode>("not", '!');
