import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingBitwiseAndNode extends TwingBaseBinaryNode<"bitwise_and"> {
}

export const createBitwiseAndNode = createBinaryNodeFactory<TwingBitwiseAndNode>("bitwise_and",);
