import {BaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface ModuloNode extends BaseBinaryNode<"mod"> {
}

export const createModuloNode = createBinaryNodeFactory<ModuloNode>("mod", '%');
