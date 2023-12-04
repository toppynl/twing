import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";
import {compare} from "../../../helpers/compare";

export interface TwingIsNotEqualToNode extends TwingBaseBinaryNode<"is_not_equal_to"> {
}

export const createIsNotEqualToNode = createBinaryNodeFactory<TwingIsNotEqualToNode>("is_not_equal_to", {
    execute: async (left, right, executionContext) => {
        return Promise.resolve(!compare(await left.execute(executionContext), await right.execute(executionContext)))
    }
});
