import type {TwingBaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";
import {compare} from "../../../helpers/compare";

export const spaceshipNodeType = "spaceship";

export interface TwingSpaceshipNode extends TwingBaseBinaryNode<typeof spaceshipNodeType> {
}

export const createSpaceshipNode = createBinaryNodeFactory<TwingSpaceshipNode>(spaceshipNodeType, {
    execute: async (left, right, executionContext) => {
        const leftValue = await left.execute(executionContext);
        const rightValue = await right.execute(executionContext);
        
        return compare(leftValue, rightValue) ? 0 : (leftValue < rightValue ? -1 : 1);
    }
});
