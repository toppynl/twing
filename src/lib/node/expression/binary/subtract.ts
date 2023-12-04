import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingSubtractNode extends TwingBaseBinaryNode<"subtract"> {
}

export const createSubtractNode = createBinaryNodeFactory<TwingSubtractNode>("subtract", {
    execute: async (left, right, executionContext) => {
        return await left.execute(executionContext) - await right.execute(executionContext);
    }
});
