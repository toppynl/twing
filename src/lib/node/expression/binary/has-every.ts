import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";
import {every, isAMapLike} from "../../../helpers/map-like";

export const hasEveryNodeType = "has_every";

export interface TwingHasEveryNode extends TwingBaseBinaryNode<typeof hasEveryNodeType> {

}

export const createHasEveryNode = createBinaryNodeFactory<TwingHasEveryNode>(
    hasEveryNodeType,
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
