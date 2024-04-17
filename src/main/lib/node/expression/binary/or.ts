import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingOrNode extends TwingBaseBinaryNode<"or"> {
}

export const createOrNode = createBinaryNodeFactory<TwingOrNode>("or");
