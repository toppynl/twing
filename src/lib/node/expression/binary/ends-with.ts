import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingEndsWithNode extends TwingBaseBinaryNode<"ends_with"> {

}

export const createEndsWithNode = createBinaryNodeFactory<TwingEndsWithNode>(
    'ends_with',
    {
        execute: async (baseNode, ...args) => {
            const {left, right} = baseNode.children;

            const leftValue = await left.execute(...args);
            
            if (typeof leftValue !== "string") {
                return false;
            }

            const rightValue = await right.execute(...args);

            if (typeof rightValue !== "string") {
                return false;
            }
            
            return rightValue.length < 1 || leftValue.endsWith(rightValue);
        }
    }
);
