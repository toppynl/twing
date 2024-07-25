import type {TwingBaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";

export interface TwingBitwiseOrNode extends TwingBaseBinaryNode<"bitwise_or"> {
}

export const createBitwiseOrNode = createBinaryNodeFactory<TwingBitwiseOrNode>("bitwise_or");
