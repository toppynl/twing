import type {TwingNodeExecutor, TwingSynchronousNodeExecutor} from "../../node-executor";
import type {TwingAssignmentNode} from "../../node/expression/assignment";

export const executeAssignmentNode: TwingNodeExecutor<TwingAssignmentNode> = (node) => {
    return Promise.resolve(node.attributes.name);
};

export const executeAssignmentNodeSynchronously: TwingSynchronousNodeExecutor<TwingAssignmentNode> = (node) => {
    return node.attributes.name;
};
