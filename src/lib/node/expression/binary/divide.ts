import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export const divideNodeType = "div";

export interface TwingDivideNode extends TwingBaseBinaryNode<typeof divideNodeType> {
}

export const createDivideNode = createBinaryNodeFactory<TwingDivideNode>(divideNodeType, '/');
