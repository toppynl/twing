import type {TwingBaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";

export const andNodeType = "and";

export interface TwingAndNode extends TwingBaseBinaryNode<typeof andNodeType> {
}

export const createAndNode = createBinaryNodeFactory<TwingAndNode>(andNodeType, {
    execute: async (baseNode, ...args) => {
        const {left, right} = baseNode.children;

        return !!(await left.execute(...args) && await right.execute(...args));
    }
});
