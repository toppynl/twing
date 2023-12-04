import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingIsGreaterThanOrEqualToNode extends TwingBaseBinaryNode<"greater_equal"> {
}

export const createIsGreaterThanOrEqualToNode = createBinaryNodeFactory<TwingIsGreaterThanOrEqualToNode>("greater_equal", {
    execute: async (left, right, executionContext) => {
        return await left.execute(executionContext) >= await right.execute(executionContext);
    }
});
