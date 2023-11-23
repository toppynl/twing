import type {TwingBaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";
import {concatenate} from "../../../helpers/concatenate";

export const concatenateNodeTYpe = "concat";

export interface TwingConcatenateNode extends TwingBaseBinaryNode<typeof concatenateNodeTYpe> {
}

export const createConcatenateNode = createBinaryNodeFactory<TwingConcatenateNode>(concatenateNodeTYpe, {
    execute: async (binaryNode, ...args) => {
        const {left, right} = binaryNode.children;

        const leftValue = await left.execute(...args);
        const rightValue = await right.execute(...args);

        return concatenate(leftValue, rightValue);
    }
});
