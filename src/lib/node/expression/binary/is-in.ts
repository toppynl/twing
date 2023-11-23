import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";
import {isIn} from "../../../helpers/is-in";

export interface TwingIsInNode extends TwingBaseBinaryNode<"in"> {
}

export const createIsInNode = createBinaryNodeFactory<TwingIsInNode>("in", {
    execute: async (baseNode, ...args) => {
        const {left, right} = baseNode.children;

        return isIn(await left.execute(...args), await right.execute(...args));
    }
});
