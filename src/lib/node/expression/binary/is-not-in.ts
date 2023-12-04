import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";
import {isIn} from "../../../helpers/is-in";

export interface TwingIsNotInNode extends TwingBaseBinaryNode<"is_not_in"> {
}

export const createIsNotInNode = createBinaryNodeFactory<TwingIsNotInNode>("is_not_in", {
    execute: async (left, right, executionContext) => {
        return Promise.resolve(!isIn(await left.execute(executionContext), await right.execute(executionContext)))
    }
});
