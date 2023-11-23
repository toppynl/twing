import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingPowerNode extends TwingBaseBinaryNode<"power"> {
}

export const createPowerNode = createBinaryNodeFactory<TwingPowerNode>("power", {
    execute: async (baseNode, ...args) => {
        const {left, right} = baseNode.children;

        return Math.pow(await left.execute(...args), await right.execute(...args));
    }
});
