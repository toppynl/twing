import type {TwingBaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";

export interface TwingAddNode extends TwingBaseBinaryNode<"add"> {
}

export const createAddNode = createBinaryNodeFactory<TwingAddNode>("add");
