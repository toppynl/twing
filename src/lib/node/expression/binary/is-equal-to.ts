import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingIsEqualToNode extends TwingBaseBinaryNode<"is_equal_to"> {
}

export const createIsEqualNode = createBinaryNodeFactory<TwingIsEqualToNode>("is_equal_to");
