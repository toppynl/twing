import type {TwingBaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";
import {concatenate} from "../../../helpers/concatenate";

export const concatenateNodeTYpe = "concat";

export interface TwingConcatenateNode extends TwingBaseBinaryNode<typeof concatenateNodeTYpe> {
}

export const createConcatenateNode = createBinaryNodeFactory<TwingConcatenateNode>(concatenateNodeTYpe, {
    execute: async (left, right, executionContext) => {
        const leftValue = await left.execute(executionContext);
        const rightValue = await right.execute(executionContext);

        return concatenate(leftValue, rightValue);
    }
});
