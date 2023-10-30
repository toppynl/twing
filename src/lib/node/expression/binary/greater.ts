import {BaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface GreaterThanNode extends BaseBinaryNode<"greater"> {
}

export const createGreaterThanNode = createBinaryNodeFactory<GreaterThanNode>("greater", '>');
