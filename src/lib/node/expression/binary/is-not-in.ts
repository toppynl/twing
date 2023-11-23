import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";
import {isIn} from "../../../helpers/is-in";

export interface TwingIsNotInNode extends TwingBaseBinaryNode<"not_in"> {
}

export const createIsNotInNode = createBinaryNodeFactory<TwingIsNotInNode>("not_in", {
    execute: async (baseNode, ...args) => {
        const {left, right} = baseNode.children;

        return Promise.resolve(!isIn(await left.execute(...args), await right.execute(...args)))
    }
});
