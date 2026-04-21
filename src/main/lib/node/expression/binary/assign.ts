import type {TwingBaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";

export interface TwingAssignNode extends TwingBaseBinaryNode<"assign"> {}
export const createAssignNode = createBinaryNodeFactory<TwingAssignNode>("assign");
