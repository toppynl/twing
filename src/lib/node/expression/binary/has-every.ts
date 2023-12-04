import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";
import {every, isAMapLike} from "../../../helpers/map-like";

export interface TwingHasEveryNode extends TwingBaseBinaryNode<"has_every"> {

}

export const createHasEveryNode = createBinaryNodeFactory<TwingHasEveryNode>(
    "has_every",
    {
        execute: async (left, right, executionContext) => {
            const leftValue = await left.execute(executionContext);
            const rightValue = await right.execute(executionContext);
            
            if (typeof rightValue !== "function") {
                return Promise.resolve(true);
            }

            if (!isAMapLike(leftValue) && !Array.isArray(leftValue)) {
                return Promise.resolve(true);
            }

            return every(leftValue, rightValue);
        }
    }
);
