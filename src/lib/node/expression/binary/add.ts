import type {TwingBaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";

export interface TwingAddNode extends TwingBaseBinaryNode<"add"> {
}

export const createAddNode = createBinaryNodeFactory<TwingAddNode>("add", {
    execute: async (left, right, executionContext) => {
        return await left.execute(executionContext) + await right.execute(executionContext);
    }
});
