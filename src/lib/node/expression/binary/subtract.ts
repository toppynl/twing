import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingSubtractNode extends TwingBaseBinaryNode<"sub"> {
}

export const createSubtractNode = createBinaryNodeFactory<TwingSubtractNode>("sub", {
    execute: async (left, right, executionContext) => {
        return await left.execute(executionContext) - await right.execute(executionContext);
    }
});
