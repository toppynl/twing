import type {TwingBaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";
import {concatenate} from "../../../helpers/concatenate";

export interface TwingConcatenateNode extends TwingBaseBinaryNode<"concatenate"> {
}

export const createConcatenateNode = createBinaryNodeFactory<TwingConcatenateNode>("concatenate", {
    execute: async (left, right, executionContext) => {
        const leftValue = await left.execute(executionContext);
        const rightValue = await right.execute(executionContext);

        return concatenate(leftValue, rightValue);
    }
});
