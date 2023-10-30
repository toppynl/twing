import type {BaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";

export interface AddNode extends BaseBinaryNode<"add"> {
}

export const createAddNode = createBinaryNodeFactory<AddNode>("add", '+');
