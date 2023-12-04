import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";
import {compare} from "../../../helpers/compare";

export interface TwingIsNotEqualToNode extends TwingBaseBinaryNode<"not_equal"> {
}

export const createIsNotEqualToNode = createBinaryNodeFactory<TwingIsNotEqualToNode>("not_equal", {
    execute: async (left, right, executionContext) => {
        return Promise.resolve(!compare(await left.execute(executionContext), await right.execute(executionContext)))
    }
});
