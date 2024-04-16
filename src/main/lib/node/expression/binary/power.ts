import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingPowerNode extends TwingBaseBinaryNode<"power"> {
}

export const createPowerNode = createBinaryNodeFactory<TwingPowerNode>("power");
