import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingIsLessThanNode extends TwingBaseBinaryNode<"is_less_than"> {
}

export const createIsLessThanNode = createBinaryNodeFactory<TwingIsLessThanNode>("is_less_than");
