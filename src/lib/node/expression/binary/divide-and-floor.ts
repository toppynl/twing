import type {TwingBaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";

export const divideAndFloorNodeType = "floor_div";

export interface TwingDivideAndFloorNode extends TwingBaseBinaryNode<typeof divideAndFloorNodeType> {
}

export const createDivideAndFloorNode = createBinaryNodeFactory<TwingDivideAndFloorNode>(divideAndFloorNodeType, {
    execute: async (left, right, executionContext) => {
        return Math.floor(await left.execute(executionContext) / await right.execute(executionContext));
    }
});
