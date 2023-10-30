import {BaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface DivNode extends BaseBinaryNode<"div"> {
}

export const createDivNode = createBinaryNodeFactory<DivNode>("div", '/');
