import {BaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface LessThanOrEqualToNode extends BaseBinaryNode<"less_equal"> {
}

export const createLessThanOrEqualToNode = createBinaryNodeFactory<LessThanOrEqualToNode>("less_equal", '<=');
