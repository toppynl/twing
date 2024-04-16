import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingIsNotEqualToNode extends TwingBaseBinaryNode<"is_not_equal_to"> {
}

export const createIsNotEqualToNode = createBinaryNodeFactory<TwingIsNotEqualToNode>("is_not_equal_to");
