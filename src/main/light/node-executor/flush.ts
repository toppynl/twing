import {TwingNodeExecutor, TwingSynchronousNodeExecutor} from "../node-executor";
import {TwingFlushNode} from "../node/flush";

export const executeFlushNode: TwingNodeExecutor<TwingFlushNode> = (_node, {outputBuffer}) => {
    outputBuffer.flush();

    return Promise.resolve();
};

export const executeFlushNodeSynchronously: TwingSynchronousNodeExecutor<TwingFlushNode> = (_node, {outputBuffer}) => {
    outputBuffer.flush();
};
