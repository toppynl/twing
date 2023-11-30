import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingIsGreaterThanNode extends TwingBaseBinaryNode<"greater"> {
}

export const createIsGreaterThanNode = createBinaryNodeFactory<TwingIsGreaterThanNode>("greater", {
    execute: async (left, right, executionContext) => {
        return await left.execute(executionContext) > await right.execute(executionContext);
    }
});
