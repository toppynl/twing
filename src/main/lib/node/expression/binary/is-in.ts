import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingIsInNode extends TwingBaseBinaryNode<"is_in"> {
}

export const createIsInNode = createBinaryNodeFactory<TwingIsInNode>("is_in");
