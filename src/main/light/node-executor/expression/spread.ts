import {TwingNodeExecutor, TwingSynchronousNodeExecutor} from "../../node-executor";
import {TwingSpreadNode} from "../../node/expression/spread";
import {iteratorToHash} from "../../helpers/iterator-to-hash";

export const executeSpreadNode: TwingNodeExecutor<TwingSpreadNode> = (node, executionContext) => {
    const {iterable} = node.children;
    const {nodeExecutor: execute} = executionContext;

    return execute(iterable, executionContext);
};

export const executeSpreadNodeSynchronously: TwingSynchronousNodeExecutor<TwingSpreadNode> = (node, executionContext) => {
    const {iterable: iterableNode} = node.children;
    const {nodeExecutor: execute} = executionContext;

    const iterable = execute(iterableNode, executionContext);
    
    return iteratorToHash(iterable);
};
