import type {TwingNodeExecutor} from "../node-executor";
import type {TwingLineNode} from "../node/line";

export const executeLineNode: TwingNodeExecutor<TwingLineNode> = () => {
    return Promise.resolve();
};
