import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingIsLessThanNode extends TwingBaseBinaryNode<"is_less_than"> {
}

export const createIsLessThanNode = createBinaryNodeFactory<TwingIsLessThanNode>("is_less_than", {
    execute: async (left, right, executionContext) => {
        return await left.execute(executionContext) < await right.execute(executionContext);
    }
});
