import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";
import {compare} from "../../../helpers/compare";

export interface TwingIsEqualToNode extends TwingBaseBinaryNode<"equals"> {
}

export const createIsEqualNode = createBinaryNodeFactory<TwingIsEqualToNode>("equals", {
    execute: async (left, right, executionContext) => {
        const leftValue = await left.execute(executionContext);
        const rightValue = await right.execute(executionContext);

        return compare(leftValue, rightValue);
    }
});
