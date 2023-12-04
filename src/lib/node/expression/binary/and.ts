import type {TwingBaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";

export interface TwingAndNode extends TwingBaseBinaryNode<"and"> {
}

export const createAndNode = createBinaryNodeFactory<TwingAndNode>("and", {
    execute: async (left, right, executionContext) => {
        return !!(await left.execute(executionContext) && await right.execute(executionContext));
    }
});
