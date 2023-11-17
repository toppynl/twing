import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingIsLessThanOrEqualToNode extends TwingBaseBinaryNode<"less_equal"> {
}

export const createIsLessThanOrEqualToNode = createBinaryNodeFactory<TwingIsLessThanOrEqualToNode>("less_equal", '<=');
