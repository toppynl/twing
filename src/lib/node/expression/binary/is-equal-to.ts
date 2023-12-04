import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";
import {compare} from "../../../helpers/compare";

export interface TwingIsEqualToNode extends TwingBaseBinaryNode<"is_equal_to"> {
}

export const createIsEqualNode = createBinaryNodeFactory<TwingIsEqualToNode>("is_equal_to", {
    execute: async (left, right, executionContext) => {
        const leftValue = await left.execute(executionContext);
        const rightValue = await right.execute(executionContext);

        return compare(leftValue, rightValue);
    }
});
