import type {TwingBaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";

export const divideAndFloorNodeType = "floor_div";

export interface TwingDivideAndFloorNode extends TwingBaseBinaryNode<typeof divideAndFloorNodeType> {
}

export const createDivideAndFloorNode = createBinaryNodeFactory<TwingDivideAndFloorNode>(divideAndFloorNodeType, {
    execute: async (baseNode, ...args) => {
        const {left, right} = baseNode.children;

        return Math.floor(await left.execute(...args) / await right.execute(...args));
    }
});
