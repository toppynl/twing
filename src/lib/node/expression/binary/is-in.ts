import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";
import {isIn} from "../../../helpers/is-in";

export interface TwingIsInNode extends TwingBaseBinaryNode<"in"> {
}

export const createIsInNode = createBinaryNodeFactory<TwingIsInNode>("in", {
    execute: async (left, right, executionContext) => {
        return isIn(await left.execute(executionContext), await right.execute(executionContext));
    }
});
