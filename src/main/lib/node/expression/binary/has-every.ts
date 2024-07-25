import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingHasEveryNode extends TwingBaseBinaryNode<"has_every"> {

}

export const createHasEveryNode = createBinaryNodeFactory<TwingHasEveryNode>("has_every");
