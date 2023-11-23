import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export const divideNodeType = "div";

export interface TwingDivideNode extends TwingBaseBinaryNode<typeof divideNodeType> {
}

export const createDivideNode = createBinaryNodeFactory<TwingDivideNode>(divideNodeType, {
    execute: async (baseNode, ...args) => {
        const {left, right} = baseNode.children;

        return await left.execute(...args) / await right.execute(...args);
    }
});
