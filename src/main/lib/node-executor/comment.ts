import type {TwingNodeExecutor} from "../node-executor";
import type {TwingCommentNode} from "../node/comment";

export const executeCommentNode: TwingNodeExecutor<TwingCommentNode> = () => {
    return Promise.resolve();
};
