import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingIsLessThanOrEqualToNode extends TwingBaseBinaryNode<"is_less_than_or_equal_to"> {
}

export const createIsLessThanOrEqualToNode = createBinaryNodeFactory<TwingIsLessThanOrEqualToNode>("is_less_than_or_equal_to");
