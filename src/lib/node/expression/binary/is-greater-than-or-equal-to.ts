import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingIsGreaterThanOrEqualToNode extends TwingBaseBinaryNode<"is_greater_than_or_equal_to"> {
}

export const createIsGreaterThanOrEqualToNode = createBinaryNodeFactory<TwingIsGreaterThanOrEqualToNode>("is_greater_than_or_equal_to", {
    execute: async (left, right, executionContext) => {
        return await left.execute(executionContext) >= await right.execute(executionContext);
    }
});
