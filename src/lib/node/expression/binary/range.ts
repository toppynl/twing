import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";
import {createRange} from "../../../helpers/create-range";

export interface TwingRangeNode extends TwingBaseBinaryNode<"range"> {
}

export const createRangeNode = createBinaryNodeFactory<TwingRangeNode>("range", {
    execute: async (left, right, executionContext) => {
        const leftValue = await left.execute(executionContext);
        const rightValue = await right.execute(executionContext);

        return createRange(leftValue, rightValue, 1);
    }
});
