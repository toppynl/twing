import type {TwingNodeExecutor, TwingSynchronousNodeExecutor} from "../node-executor";
import type {TwingCommentNode} from "../node/comment";

export const executeCommentNode: TwingNodeExecutor<TwingCommentNode> = () => {
    return Promise.resolve();
};

export const executeCommentNodeSynchronously: TwingSynchronousNodeExecutor<TwingCommentNode> = () => {
    return;
};

