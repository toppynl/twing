import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingStartsWithNode extends TwingBaseBinaryNode<"starts_with"> {
}

export const createStartsWithNode = createBinaryNodeFactory<TwingStartsWithNode>("starts_with");
