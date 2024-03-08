import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingRangeNode extends TwingBaseBinaryNode<"range"> {
}

export const createRangeNode = createBinaryNodeFactory<TwingRangeNode>("range");
