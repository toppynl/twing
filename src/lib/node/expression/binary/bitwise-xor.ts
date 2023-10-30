import type {BaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";

export interface BitwiseXorNode extends BaseBinaryNode<"bitwise_xor"> {
}

export const createBitwiseXorNode = createBinaryNodeFactory<BitwiseXorNode>("bitwise_xor", '^');
