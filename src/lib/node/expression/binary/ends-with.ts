import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingEndsWithNode extends TwingBaseBinaryNode<"ends_with"> {

}

export const createEndsWithNode = createBinaryNodeFactory<TwingEndsWithNode>("ends_with");
