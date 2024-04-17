import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingDivideNode extends TwingBaseBinaryNode<"divide"> {
}

export const createDivideNode = createBinaryNodeFactory<TwingDivideNode>("divide");
