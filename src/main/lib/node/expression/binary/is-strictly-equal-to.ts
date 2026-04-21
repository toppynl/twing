import type {TwingBaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";

export interface TwingIsStrictlyEqualToNode extends TwingBaseBinaryNode<"is_strictly_equal_to"> {}
export const createIsStrictlyEqualToNode = createBinaryNodeFactory<TwingIsStrictlyEqualToNode>("is_strictly_equal_to");
