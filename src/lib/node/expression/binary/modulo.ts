import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingModuloNode extends TwingBaseBinaryNode<"mod"> {
}

export const createModuloNode = createBinaryNodeFactory<TwingModuloNode>("mod", {
    execute: async (baseNode, ...args) => {
        const {left, right} = baseNode.children;

        return await left.execute(...args) % await right.execute(...args);
    }
});
