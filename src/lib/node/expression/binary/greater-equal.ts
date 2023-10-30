import {BaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface GreaterThanOrEqualToNode extends BaseBinaryNode<"greater_equal"> {
}

export const createGreaterThanOrEqualToNode = createBinaryNodeFactory<GreaterThanOrEqualToNode>("greater_equal", '>=');
