import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingIsGreaterThanNode extends TwingBaseBinaryNode<"is_greater_than"> {
}

export const createIsGreaterThanNode = createBinaryNodeFactory<TwingIsGreaterThanNode>("is_greater_than", {
    execute: async (left, right, executionContext) => {
        return await left.execute(executionContext) > await right.execute(executionContext);
    }
});
