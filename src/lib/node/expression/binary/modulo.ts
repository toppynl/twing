import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingModuloNode extends TwingBaseBinaryNode<"modulo"> {
}

export const createModuloNode = createBinaryNodeFactory<TwingModuloNode>("modulo", {
    execute: async (left, right, executionContext) => {
        return await left.execute(executionContext) % await right.execute(executionContext);
    }
});
