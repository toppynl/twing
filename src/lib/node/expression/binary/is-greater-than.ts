import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingIsGreaterThanNode extends TwingBaseBinaryNode<"greater"> {
}

export const createIsGreaterThanNode = createBinaryNodeFactory<TwingIsGreaterThanNode>("greater", '>');
