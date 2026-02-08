import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingIsNotInNode extends TwingBaseBinaryNode<"is_not_in"> {
}

export const createIsNotInNode = createBinaryNodeFactory<TwingIsNotInNode>("is_not_in");
