import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingMultiplyNode extends TwingBaseBinaryNode<"multiply"> {
}

export const createMultiplyNode = createBinaryNodeFactory<TwingMultiplyNode>("multiply", {
    execute: async (left, right, executionContext) => {
        return await left.execute(executionContext) * await right.execute(executionContext);
    }
});
