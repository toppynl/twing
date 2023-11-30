import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingIsLessThanOrEqualToNode extends TwingBaseBinaryNode<"less_equal"> {
}

export const createIsLessThanOrEqualToNode = createBinaryNodeFactory<TwingIsLessThanOrEqualToNode>("less_equal", {
    execute: async (left, right, executionContext) => {
        return await left.execute(executionContext) <= await right.execute(executionContext);
    }
});
