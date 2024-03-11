import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingSubtractNode extends TwingBaseBinaryNode<"subtract"> {
}

export const createSubtractNode = createBinaryNodeFactory<TwingSubtractNode>("subtract");
