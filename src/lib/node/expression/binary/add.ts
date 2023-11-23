import type {TwingBaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";

export const addNodeType = "add";

export interface TwingAddNode extends TwingBaseBinaryNode<typeof addNodeType> {
}

export const createAddNode = createBinaryNodeFactory<TwingAddNode>(addNodeType, {
    execute: async (baseNode, ...args) => {
        const {left, right} = baseNode.children;

        return await left.execute(...args) + await right.execute(...args);
    }
});
