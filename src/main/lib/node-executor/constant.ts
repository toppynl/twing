import type {TwingNodeExecutor, TwingSynchronousNodeExecutor} from "../node-executor";
import type {TwingConstantNode} from "../node/expression/constant";

export const executeConstantNode: TwingNodeExecutor<TwingConstantNode> = (node) => {
    return Promise.resolve(node.attributes.value);
};

export const executeConstantNodeSynchronously: TwingSynchronousNodeExecutor<TwingConstantNode> = (node) => {
    return node.attributes.value;
};
