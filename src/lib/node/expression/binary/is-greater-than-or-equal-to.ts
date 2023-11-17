import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingIsGreaterThanOrEqualToNode extends TwingBaseBinaryNode<"greater_equal"> {
}

export const createIsGreaterThanOrEqualToNode = createBinaryNodeFactory<TwingIsGreaterThanOrEqualToNode>("greater_equal", '>=');
