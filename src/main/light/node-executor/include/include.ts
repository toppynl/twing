import {TwingNodeExecutor, TwingSynchronousNodeExecutor} from "../../node-executor";
import {TwingIncludeNode} from "../../node/include/include";
import {executeBaseIncludeNode, executeBaseIncludeNodeSynchronously} from "../include";

export const executeIncludeNode: TwingNodeExecutor<TwingIncludeNode> = (node, executionContext) => {
    const {nodeExecutor: execute} = executionContext;

    return executeBaseIncludeNode(node, executionContext, (executionContext) => {
        return execute(node.children.expression, executionContext);
    })
};

export const executeIncludeNodeSynchronously: TwingSynchronousNodeExecutor<TwingIncludeNode> = (node, executionContext) => {
    const {nodeExecutor: execute} = executionContext;

    return executeBaseIncludeNodeSynchronously(node, executionContext, (executionContext) => {
        return execute(node.children.expression, executionContext);
    })
};
