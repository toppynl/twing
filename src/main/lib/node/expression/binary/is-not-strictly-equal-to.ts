import type {TwingBaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";

export interface TwingIsNotStrictlyEqualToNode extends TwingBaseBinaryNode<"is_not_strictly_equal_to"> {}
export const createIsNotStrictlyEqualToNode = createBinaryNodeFactory<TwingIsNotStrictlyEqualToNode>("is_not_strictly_equal_to");
