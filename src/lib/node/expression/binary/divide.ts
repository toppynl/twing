import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingDivideNode extends TwingBaseBinaryNode<"divide"> {
}

export const createDivideNode = createBinaryNodeFactory<TwingDivideNode>("divide", {
    execute: async (left, right, executionContext) => {
        return await left.execute(executionContext) / await right.execute(executionContext);
    }
});
