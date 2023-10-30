import type {BaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";

export interface BitwiseOrNode extends BaseBinaryNode<"bitwise_or"> {
}

export const createBitwiseOrNode = createBinaryNodeFactory<BitwiseOrNode>("bitwise_or", '|');
