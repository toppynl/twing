import type {TwingBaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";

export interface TwingAndNode extends TwingBaseBinaryNode<"and"> {
}

export const createAndNode = createBinaryNodeFactory<TwingAndNode>("and");
