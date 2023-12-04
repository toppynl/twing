import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export const endsWithNodeType = "ends_with";

export interface TwingEndsWithNode extends TwingBaseBinaryNode<typeof endsWithNodeType> {

}

export const createEndsWithNode = createBinaryNodeFactory<TwingEndsWithNode>(
    endsWithNodeType,
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
