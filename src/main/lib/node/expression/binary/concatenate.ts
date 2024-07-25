import type {TwingBaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";

export interface TwingConcatenateNode extends TwingBaseBinaryNode<"concatenate"> {
}

export const createConcatenateNode = createBinaryNodeFactory<TwingConcatenateNode>("concatenate");
