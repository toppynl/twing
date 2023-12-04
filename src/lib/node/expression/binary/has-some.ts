import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";
import {isAMapLike, some} from "../../../helpers/map-like";

export const hasSomeNodeType = "has_some";

export interface TwingHasSomeNode extends TwingBaseBinaryNode<typeof hasSomeNodeType> {

}

export const createHasSomeNode = createBinaryNodeFactory<TwingHasSomeNode>(
    hasSomeNodeType,
    {
        execute: async (left, right, executionContext) => {
            const leftValue = await left.execute(executionContext);
            const rightValue = await right.execute(executionContext);
            
            if (typeof rightValue !== "function") {
                return Promise.resolve(false);
            }

            if (!isAMapLike(leftValue) && !Array.isArray(leftValue)) {
                return Promise.resolve(false);
            }

            return some(leftValue, rightValue);
        }
    }
);
