import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";
import {compare} from "../../../helpers/compare";

export interface TwingIsNotEqualToNode extends TwingBaseBinaryNode<"not_equal"> {
}

export const createIsNotEqualToNode = createBinaryNodeFactory<TwingIsNotEqualToNode>("not_equal", {
    execute: async (baseNode, ...args) => {
        const {left, right} = baseNode.children;

        return Promise.resolve(!compare(await left.execute(...args), await right.execute(...args)))
    }
});
