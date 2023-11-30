import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingOrNode extends TwingBaseBinaryNode<"or"> {
}

export const createOrNode = createBinaryNodeFactory<TwingOrNode>("or", {
    execute: async (left, right, executionContext) => {
        return !!(await left.execute(executionContext) || await right.execute(executionContext));
    }
});
