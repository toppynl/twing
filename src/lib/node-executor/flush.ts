import {TwingNodeExecutor} from "../node-executor";
import {TwingFlushNode} from "../node/flush";

export const executeFlushNode: TwingNodeExecutor<TwingFlushNode> = (_node, {outputBuffer}) => {
    outputBuffer.flush();

    return Promise.resolve();
};
