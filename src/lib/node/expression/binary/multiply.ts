import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingMultiplyNode extends TwingBaseBinaryNode<"mul"> {
}

export const createMultiplyNode = createBinaryNodeFactory<TwingMultiplyNode>("mul", {
    execute: async (left, right, executionContext) => {
        return await left.execute(executionContext) * await right.execute(executionContext);
    }
});
