import type {TwingBaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";
import {compare} from "../../../helpers/compare";

export interface TwingSpaceshipNode extends TwingBaseBinaryNode<"spaceship"> {
}

export const createSpaceshipNode = createBinaryNodeFactory<TwingSpaceshipNode>("spaceship", {
    execute: async (left, right, executionContext) => {
        const leftValue = await left.execute(executionContext);
        const rightValue = await right.execute(executionContext);
        
        return compare(leftValue, rightValue) ? 0 : (leftValue < rightValue ? -1 : 1);
    }
});
