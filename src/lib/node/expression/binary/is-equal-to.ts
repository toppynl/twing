import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";
import {compare} from "../../../helpers/compare";

export interface TwingIsEqualToNode extends TwingBaseBinaryNode<"equals"> {
}

export const createIsEqualNode = createBinaryNodeFactory<TwingIsEqualToNode>("equals", {
    execute: async (node, ...args) => {
        const {left, right} = node.children;

        const leftValue = await left.execute(...args);
        const rightValue = await right.execute(...args);

        return compare(leftValue, rightValue);
    }
});
