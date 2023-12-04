import type {TwingBaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";

export interface TwingDivideAndFloorNode extends TwingBaseBinaryNode<"divide_and_floor"> {
}

export const createDivideAndFloorNode = createBinaryNodeFactory<TwingDivideAndFloorNode>("divide_and_floor", {
    execute: async (left, right, executionContext) => {
        return Math.floor(await left.execute(executionContext) / await right.execute(executionContext));
    }
});
