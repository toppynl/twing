import {TwingNodeExecutor} from "../../node-executor";
import {TwingIncludeNode} from "../../node/include/include";
import {executeBaseIncludeNode} from "../include";

export const executeIncludeNode: TwingNodeExecutor<TwingIncludeNode> = (node, executionContext) => {
    const {nodeExecutor: execute} = executionContext;

    return executeBaseIncludeNode(node, executionContext, (executionContext) => {
        return execute(node.children.expression, executionContext);
    })
};
