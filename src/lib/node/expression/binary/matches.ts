import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingMatchesNode extends TwingBaseBinaryNode<"matches"> {
}

export const createMatchesNode = createBinaryNodeFactory<TwingMatchesNode>("matches");
