import type {TwingBaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";

export const andNodeType = "and";

export interface TwingAndNode extends TwingBaseBinaryNode<typeof andNodeType> {
}

export const createAndNode = createBinaryNodeFactory<TwingAndNode>(andNodeType, {
    execute: async (left, right, executionContext) => {
        return !!(await left.execute(executionContext) && await right.execute(executionContext));
    }
});
