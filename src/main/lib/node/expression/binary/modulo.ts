import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingModuloNode extends TwingBaseBinaryNode<"modulo"> {
}

export const createModuloNode = createBinaryNodeFactory<TwingModuloNode>("modulo");
