import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingIsLessThanNode extends TwingBaseBinaryNode<"less"> {
}

export const createIsLessThanNode = createBinaryNodeFactory<TwingIsLessThanNode>("less", {
    execute: async (left, right, executionContext) => {
        return await left.execute(executionContext) < await right.execute(executionContext);
    }
});
