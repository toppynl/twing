import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingModuloNode extends TwingBaseBinaryNode<"mod"> {
}

export const createModuloNode = createBinaryNodeFactory<TwingModuloNode>("mod", '%');
