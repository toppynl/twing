import type {TwingNodeExecutor} from "../node-executor";
import type {TwingConstantNode} from "../node/expression/constant";

export const executeConstantNode: TwingNodeExecutor<TwingConstantNode> = (node) => {
    return Promise.resolve(node.attributes.value);
};
