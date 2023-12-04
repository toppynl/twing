import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingStartsWithNode extends TwingBaseBinaryNode<"starts_with"> {
}

export const createStartsWithNode = createBinaryNodeFactory<TwingStartsWithNode>("starts_with", {
    execute: async (left, right, executionContext) => {
        const leftValue = await left.execute(executionContext);

        if (typeof leftValue !== "string") {
            return false;
        }

        const rightValue = await right.execute(executionContext);

        if (typeof rightValue !== "string") {
            return false;
        }

        return rightValue.length < 1 || leftValue.startsWith(rightValue);
    }
});
