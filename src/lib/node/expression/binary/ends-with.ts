import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingEndsWithNode extends TwingBaseBinaryNode<"ends_with"> {

}

export const createEndsWithNode = createBinaryNodeFactory<TwingEndsWithNode>(
    "ends_with",
    {
        execute: async (left, right, executionContext) => {
            const leftValue = await left.execute(executionContext);

            if (typeof leftValue !== "string") {
                return false;
            }

            const rightValue = await right.execute(executionContext);

            if (typeof rightValue !== "string") {
                return false;
            }

            return rightValue.length < 1 || leftValue.endsWith(rightValue);
        }
    }
);
