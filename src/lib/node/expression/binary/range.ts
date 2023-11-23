import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";
import {createRange} from "../../../helpers/create-range";

export interface TwingRangeNode extends TwingBaseBinaryNode<"range"> {
}

export const createRangeNode = createBinaryNodeFactory<TwingRangeNode>("range", {
    execute: async (baseNode, ...args) => {
        const leftValue = await baseNode.children.left.execute(...args);
        const rightValue = await baseNode.children.right.execute(...args);

        return createRange(leftValue, rightValue, 1);
    }
});
