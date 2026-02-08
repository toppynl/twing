import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingHasSomeNode extends TwingBaseBinaryNode<"has_some"> {

}

export const createHasSomeNode = createBinaryNodeFactory<TwingHasSomeNode>("has_some");
