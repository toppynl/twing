import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingPowerNode extends TwingBaseBinaryNode<"power"> {
}

export const createPowerNode = createBinaryNodeFactory<TwingPowerNode>("power", {
    execute: async (left, right, executionContext) => {
        return Math.pow(await left.execute(executionContext), await right.execute(executionContext));
    }
});
