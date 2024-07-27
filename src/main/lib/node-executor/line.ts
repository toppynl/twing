import type {TwingNodeExecutor, TwingSynchronousNodeExecutor} from "../node-executor";
import type {TwingLineNode} from "../node/line";

export const executeLineNode: TwingNodeExecutor<TwingLineNode> = () => {
    return Promise.resolve();
};

export const executeLineNodeSynchronously: TwingSynchronousNodeExecutor<TwingLineNode> = () => {
    
};
