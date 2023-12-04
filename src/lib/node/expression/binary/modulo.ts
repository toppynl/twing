import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingModuloNode extends TwingBaseBinaryNode<"mod"> {
}

export const createModuloNode = createBinaryNodeFactory<TwingModuloNode>("mod", {
    execute: async (left, right, executionContext) => {
        return await left.execute(executionContext) % await right.execute(executionContext);
    }
});
