import type {TwingNodeExecutor} from "../../node-executor";
import type {TwingAssignmentNode} from "../../node/expression/assignment";

export const executeAssignmentNode: TwingNodeExecutor<TwingAssignmentNode> = (node) => {
    return Promise.resolve(node.attributes.name);
};
