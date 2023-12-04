import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export const divideNodeType = "div";

export interface TwingDivideNode extends TwingBaseBinaryNode<typeof divideNodeType> {
}

export const createDivideNode = createBinaryNodeFactory<TwingDivideNode>(divideNodeType, {
    execute: async (left, right, executionContext) => {
        return await left.execute(executionContext) / await right.execute(executionContext);
    }
});
